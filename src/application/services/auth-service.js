import { nowIso } from '../../domain/utils/time.js';

// Servicio Auth extendido: sesión con expiración y cambio password
export class AuthService {
  constructor(userRepository, roleRepository, auditService, sessionConfig = { durationMinutes: 60 }) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.audit = auditService;
    this.sessionConfig = sessionConfig;
    this.currentUser = null; // { username, userId, roleId, expiresAt }
    this.roleCache = new Map();
    this.permissionsCache = new Set();
    this.initialized = false; // Flag para saber si se completó la inicialización
    this._loadFromStorage();
    this._validateExpiration();
  }

  // Método de inicialización asíncrona para cargar permisos
  async initialize() {
    if (this.initialized) return;
    
    try {
      if (this.currentUser) {
        await this._loadPermissions();
        console.log(`[Auth] Sesión restaurada para ${this.currentUser.username}`);
      }
      this.initialized = true;
    } catch (error) {
      console.warn('[Auth] Error restaurando sesión:', error);
      this.logout(true); // Limpiar sesión corrupta
      this.initialized = true;
    }
  }

  async _hash(str) {
    const enc = new TextEncoder().encode(str);
    const digest = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(digest))
      .map(b=>b.toString(16).padStart(2,'0')).join('');
  }

  _saveToStorage() {
    if(this.currentUser) {
      localStorage.setItem('pos_session', JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem('pos_session');
    }
  }

  _loadFromStorage() {
    try {
      const raw = localStorage.getItem('pos_session');
      if(raw) {
        this.currentUser = JSON.parse(raw);
        console.log(`[Auth] Sesión cargada desde localStorage para ${this.currentUser.username}`);
        // No cargar permisos aquí, se hará en initialize()
      }
    } catch(e) {
      console.warn('[Auth] Error cargando sesión desde localStorage:', e);
      localStorage.removeItem('pos_session'); // Limpiar sesión corrupta
    }
  }

  _validateExpiration() {
    if(!this.currentUser) return;
    if(new Date(this.currentUser.expiresAt).getTime() < Date.now()) {
      this.logout(true);
    }
  }

  async login(username, password) {
    const user = await this.userRepository.findByUsername(username);
    if(!user) throw new Error('Usuario no encontrado');
    if(user.active === false) throw new Error('Usuario inactivo');
    const hash = await this._hash(password);
    if(hash !== user.passwordHash) throw new Error('Credenciales inválidas');
    const expiresAt = new Date(Date.now() + this.sessionConfig.durationMinutes * 60000).toISOString();
    this.currentUser = {
      username: user.username,
      userId: user.id,
      roleId: user.roleId,
      expiresAt
    };
    await this._loadPermissions();
    this._saveToStorage();
    await this.audit.log('LOGIN', { user: user.username });
    if(user.mustChangePassword) {
      // Flag para UI
      this.currentUser.mustChangePassword = true;
    }
    return this.currentUser;
  }

  async _loadPermissions() {
    this.permissionsCache.clear();
    if(!this.currentUser) return;
    const role = await this.roleRepository.findById(this.currentUser.roleId);
    if(!role) return;
    let perms = role.permissions || [];
    if(perms.includes('*')) {
      // "*" = todos => podrías obtener base de DB o import base
      perms = JSON.parse(localStorage.getItem('all_perms_cache') || '[]'); // fallback
    }
    perms.forEach(p => this.permissionsCache.add(p));
  }

  isAuthenticated() {
    this._validateExpiration();
    const isAuth = !!this.currentUser;
    if (isAuth && !this.initialized) {
      console.warn('[Auth] Usuario encontrado pero permisos no cargados aún');
    }
    return isAuth;
  }

  // Método mejorado que también verifica que los permisos estén cargados
  isFullyAuthenticated() {
    return this.isAuthenticated() && this.initialized;
  }

  logout(expired=false) {
    if(this.currentUser) {
      this.audit.log('LOGOUT', { user: this.currentUser.username, expired });
    }
    this.currentUser = null;
    this._saveToStorage();
  }

  getRoleId() { return this.currentUser?.roleId || null; }
  getUserId() { return this.currentUser?.userId || null; }
  getUsername() { return this.currentUser?.username || null; }

  hasPermission(perm) {
    if(!this.isAuthenticated()) return false;
    return this.permissionsCache.has(perm) || this.permissionsCache.has('*');
  }

  hasAny(...perms) {
    return perms.some(p => this.hasPermission(p));
  }

  async changeOwnPassword(oldPass, newPass) {
    if(!this.isAuthenticated()) throw new Error('No autenticado');
    const user = await this.userRepository.findById(this.getUserId());
    const oldHash = await this._hash(oldPass);
    if(oldHash !== user.passwordHash) throw new Error('Contraseña actual incorrecta');
    const newHash = await this._hash(newPass);
    await this.userRepository.setPassword(user.id, newHash);
    await this.audit.log('USER_PASSWORD_CHANGE', { user: user.username });
  }

  async adminResetPassword(userId, newPass) {
    const newHash = await this._hash(newPass);
    await this.userRepository.setPassword(userId, newHash);
    await this.userRepository.update(userId, { mustChangePassword:true });
    await this.audit.log('USER_PASSWORD_CHANGE', { targetUserId: userId, admin: this.getUsername() });
  }
}