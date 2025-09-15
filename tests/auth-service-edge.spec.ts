import { describe, it, expect } from 'vitest';
import { AuthService } from '../src/application/services/auth-service.ts';
import bcrypt from 'bcryptjs';

interface TestUser { id:string; username:string; passwordHash:string; roleId:string; active:boolean; mustChangePassword?:boolean; }
function makeUserRepo(initial: TestUser){
  let stored: TestUser = { ...initial };
  return {
    findByUsername: async (u:string)=> stored && stored.username===u? stored: null,
    findById: async (id:string)=> stored && stored.id===id? stored: null,
    setPassword: async (id:string, hash:string)=> { if(stored.id===id) stored.passwordHash=hash; },
    update: async (id:string, patch:Partial<TestUser>)=> { if(stored.id===id) stored = { ...stored, ...patch }; },
    _get: ()=> stored
  };
}
function makeRoleRepo(perms:string[]){ return { findById: async ()=> ({ id:'r1', permissions:perms }) }; }
const audit = { log: async ()=>{} };
function memoryStorage(seed?:any){ const m = new Map<string,string>(); if(seed) for(const [k,v] of Object.entries(seed)) m.set(k, JSON.stringify(v)); return { getItem:(k:string)=> m.has(k)? m.get(k)!: null, setItem:(k:string,v:string)=>{ m.set(k,v); }, removeItem:(k:string)=>{ m.delete(k); } }; }

// Simple helper to simulate expired session
function expiredSession(){ return { username:'x', userId:'u', roleId:'r1', expiresAt: new Date(Date.now()-60000).toISOString() }; }

describe('AuthService edge cases', () => {
  it('rechaza login de usuario inactivo', async () => {
    const hash = await bcrypt.hash('pw', 6);
    const userRepo = makeUserRepo({ id:'u1', username:'off', passwordHash:hash, roleId:'r1', active:false });
    const auth = new AuthService(userRepo, makeRoleRepo([]), audit, { durationMinutes:1 }, memoryStorage());
    await expect(auth.login('off','pw')).rejects.toThrow();
  });

  it('expira sesión al inicializar si ya vencida', async () => {
    const storage = memoryStorage({ 'pos_session': expiredSession() });
    const hash = await bcrypt.hash('pw',6);
    const userRepo = makeUserRepo({ id:'u', username:'x', passwordHash:hash, roleId:'r1', active:true });
    const auth = new AuthService(userRepo, makeRoleRepo([]), audit, { durationMinutes:1 }, storage);
    await auth.initialize();
    expect(auth.isAuthenticated()).toBe(false);
  });

  it('soporta wildcard de permisos *', async () => {
    const hash = await bcrypt.hash('pw',6);
    const userRepo = makeUserRepo({ id:'u2', username:'star', passwordHash:hash, roleId:'r1', active:true });
    const storage = memoryStorage({ 'all_perms_cache': ['A','B','C'] });
    const auth = new AuthService(userRepo, makeRoleRepo(['*']), audit, { durationMinutes:1 }, storage);
    await auth.initialize();
    await auth.login('star','pw');
    expect(auth.hasPermission('A')).toBe(true);
    expect(auth.hasAny('Z','B')).toBe(true);
  });

  it('changeOwnPassword actualiza hash y permite login con nueva', async () => {
    const hash = await bcrypt.hash('oldpw',6);
    const userRepo = makeUserRepo({ id:'u3', username:'chg', passwordHash:hash, roleId:'r1', active:true });
    const auth = new AuthService(userRepo, makeRoleRepo([]), audit, { durationMinutes:1 }, memoryStorage());
    await auth.initialize();
    await auth.login('chg','oldpw');
    await auth.changeOwnPassword('oldpw','newpw');
    // simulate fresh instance (reuse repo state)
    const auth2 = new AuthService(userRepo, makeRoleRepo([]), audit, { durationMinutes:1 }, memoryStorage());
    await auth2.initialize();
    await auth2.login('chg','newpw');
    expect(auth2.isAuthenticated()).toBe(true);
  });
});
