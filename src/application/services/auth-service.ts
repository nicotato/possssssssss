import { nowIso } from '../../domain/utils/time.js';
import { AuthError, ValidationError } from '../../domain/errors/errors.ts';
import bcrypt from 'bcryptjs';

export class AuthService {
  private userRepository:any;
  private roleRepository:any;
  private audit:any;
  private sessionConfig:{ durationMinutes:number };
  private currentUser:any = null;
  private roleCache = new Map();
  private permissionsCache = new Set<string>();
  private initialized=false;
  private storage: { getItem(k:string):string|null; setItem(k:string,v:string):void; removeItem(k:string):void };
  constructor(userRepository:any, roleRepository:any, auditService:any, sessionConfig = { durationMinutes: 60 }, storage?: { getItem(k:string):string|null; setItem(k:string,v:string):void; removeItem(k:string):void }) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.audit = auditService;
    this.sessionConfig = sessionConfig;
    this.storage = storage || (typeof localStorage!=='undefined'? localStorage : (()=>{ const m = new Map<string,string>(); return { getItem:(k:string)=> m.has(k)? m.get(k)!: null, setItem:(k:string,v:string)=>{ m.set(k,v); }, removeItem:(k:string)=>{ m.delete(k); } }; })());
    this._loadFromStorage();
    this._validateExpiration();
  }
  async initialize(){ if(this.initialized) return; try { if(this.currentUser){ await this._loadPermissions(); } this.initialized=true; } catch { this.logout(true); this.initialized=true; } }
  
  private async sha256(str:string){ 
    // Check if we're in a Node.js environment (for tests)
    if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
      const enc = new TextEncoder().encode(str); 
      const dig = await globalThis.crypto.subtle.digest('SHA-256', enc); 
      return Array.from(new Uint8Array(dig)).map(b=>b.toString(16).padStart(2,'0')).join(''); 
    }
    // Fallback for Node.js environments (like tests)
    try {
      const crypto = require('crypto');
      return crypto.createHash('sha256').update(str).digest('hex');
    } catch {
      // If crypto is not available, use a simple hash for testing
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(16);
    }
  }
  private _saveToStorage(){ if(this.currentUser) this.storage.setItem('pos_session', JSON.stringify(this.currentUser)); else this.storage.removeItem('pos_session'); }
  private _loadFromStorage(){ try { const raw = this.storage.getItem('pos_session'); if(raw) { this.currentUser=JSON.parse(raw); } } catch { this.storage.removeItem('pos_session'); } }
  private _validateExpiration(){ if(!this.currentUser) return; if(new Date(this.currentUser.expiresAt).getTime()<Date.now()) this.logout(true); }
  async login(username:string, password:string){
    const user = await this.userRepository.findByUsername(username);
    if(!user) throw new AuthError('Usuario o contraseña inválidos');
    if(user.active===false) throw new AuthError('Usuario inactivo');
    const storedHash = user.passwordHash;
    let ok = false;
    if(storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$')) {
      ok = await bcrypt.compare(password, storedHash);
    } else {
      // legacy sha256
      const legacy = await this.sha256(password);
      ok = legacy === storedHash;
      if(ok) { // upgrade hash
        const newHash = await bcrypt.hash(password, 10);
        await this.userRepository.setPassword(user.id, newHash);
      }
    }
    if(!ok) throw new AuthError('Usuario o contraseña inválidos');
    const expiresAt = new Date(Date.now() + this.sessionConfig.durationMinutes*60000).toISOString();
    this.currentUser = { username:user.username, userId:user.id, roleId:user.roleId, expiresAt };
    await this._loadPermissions();
    this._saveToStorage();
    await this.audit.log('LOGIN', { user:user.username });
    if(user.mustChangePassword) this.currentUser.mustChangePassword=true;
    return this.currentUser;
  }
  private async _loadPermissions(){ this.permissionsCache.clear(); if(!this.currentUser) return; const role = await this.roleRepository.findById(this.currentUser.roleId); if(!role) return; let perms = role.permissions||[]; if(perms.includes('*')) { try { const raw=this.storage.getItem('all_perms_cache'); perms = raw? JSON.parse(raw): []; } catch { perms=[]; } } perms.forEach((p:string)=> this.permissionsCache.add(p)); }
  isAuthenticated(){ this._validateExpiration(); return !!this.currentUser; }
  isFullyAuthenticated(){ return this.isAuthenticated() && this.initialized; }
  logout(expired=false){ if(this.currentUser){ this.audit.log('LOGOUT', { user:this.currentUser.username, expired }); } this.currentUser=null; this._saveToStorage(); }
  getRoleId(){ return this.currentUser?.roleId || null; }
  getUserId(){ return this.currentUser?.userId || null; }
  getUsername(){ return this.currentUser?.username || null; }
  hasPermission(perm:string){ if(!this.isAuthenticated()) return false; return this.permissionsCache.has(perm) || this.permissionsCache.has('*'); }
  hasAny(...perms:string[]){ return perms.some(p=> this.hasPermission(p)); }
  async changeOwnPassword(oldPass:string, newPass:string){ if(!this.isAuthenticated()) throw new AuthError('No autenticado'); const user = await this.userRepository.findById(this.getUserId()); const storedHash = user.passwordHash; let ok=false; if(storedHash.startsWith('$2a$')||storedHash.startsWith('$2b$')) ok = await bcrypt.compare(oldPass, storedHash); else ok = (await this.sha256(oldPass))===storedHash; if(!ok) throw new AuthError('Contraseña actual incorrecta'); const newHash = await bcrypt.hash(newPass,10); await this.userRepository.setPassword(user.id,newHash); await this.audit.log('USER_PASSWORD_CHANGE',{ user:user.username }); }
  async adminResetPassword(userId:string, newPass:string){ const newHash = await bcrypt.hash(newPass,10); await this.userRepository.setPassword(userId,newHash); await this.userRepository.update(userId,{ mustChangePassword:true }); await this.audit.log('USER_PASSWORD_CHANGE',{ targetUserId:userId, admin:this.getUsername() }); }
}