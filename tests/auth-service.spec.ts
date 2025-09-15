import { describe, it, expect } from 'vitest';
import { AuthService } from '../src/application/services/auth-service.ts';
import bcrypt from 'bcryptjs';

interface TestUser { id:string; username:string; passwordHash:string; roleId:string; active:boolean; mustChangePassword?:boolean; }
function makeUserRepo(user: TestUser){
  let stored: TestUser = { ...user };
  return {
    findByUsername: async (u:string)=> stored && stored.username===u? stored: null,
    findById: async (id:string)=> stored && stored.id===id? stored: null,
    setPassword: async (id:string, hash:string)=> { if(stored.id===id) stored.passwordHash=hash; },
    update: async (id:string, patch:Partial<TestUser>)=> { if(stored.id===id) stored = { ...stored, ...patch }; }
  };
}
function makeRoleRepo(perms:string[]){ return { findById: async ()=> ({ id:'r1', permissions:perms }) }; }
const audit = { log: async ()=>{} };
function memoryStorage(){ const m = new Map<string,string>(); return { getItem:(k:string)=> m.has(k)? m.get(k)!: null, setItem:(k:string,v:string)=>{ m.set(k,v); }, removeItem:(k:string)=>{ m.delete(k); } }; }

describe('AuthService', () => {
  it('login con hash bcrypt existente', async () => {
    const hash = await bcrypt.hash('secret', 6);
    const userRepo = makeUserRepo({ id:'u1', username:'juan', passwordHash:hash, roleId:'r1', active:true });
  const auth = new AuthService(userRepo, makeRoleRepo(['A']), audit, { durationMinutes:1 }, memoryStorage());
    await auth.initialize();
    const session = await auth.login('juan','secret');
    expect(session.username).toBe('juan');
    expect(auth.hasPermission('A')).toBe(true);
  });

  it('login con hash legacy sha256 y upgrade a bcrypt', async () => {
    // sha256("legacy") correcto (echo -n legacy | shasum -a 256)
    const legacyHash = 'c49fea7425fa7f8699897a97c159c6690267d9003bb78c53fafa8fc15c325d84';
    const userRepo = makeUserRepo({ id:'u2', username:'ana', passwordHash: legacyHash, roleId:'r1', active:true });
  const auth = new AuthService(userRepo, makeRoleRepo(['X']), audit, { durationMinutes:1 }, memoryStorage());
    await auth.initialize();
    await auth.login('ana','legacy');
  const upgraded = await userRepo.findByUsername('ana');
  expect(upgraded).not.toBeNull();
  expect(upgraded!.passwordHash.startsWith('$2')).toBe(true);
    expect(auth.hasPermission('X')).toBe(true);
  });

  it('rechaza password incorrecto', async () => {
    const hash = await bcrypt.hash('secret', 6);
    const userRepo = makeUserRepo({ id:'u3', username:'maria', passwordHash:hash, roleId:'r1', active:true });
  const auth = new AuthService(userRepo, makeRoleRepo([]), audit, { durationMinutes:1 }, memoryStorage());
    await auth.initialize();
    await expect(auth.login('maria','bad')).rejects.toThrow();
  });
});
