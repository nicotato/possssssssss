import { describe, it, expect, vi } from 'vitest';
import { AuthService } from '../src/application/services/auth-service.ts';
import bcrypt from 'bcryptjs';

interface TestUser { id:string; username:string; passwordHash:string; roleId:string; active:boolean; }
function makeUserRepo(user: TestUser){
  let stored: TestUser = { ...user };
  return {
    findByUsername: async (u:string)=> stored && stored.username===u? stored: null,
    findById: async (id:string)=> stored && stored.id===id? stored: null,
    setPassword: async ()=>{}, update: async ()=>{}
  };
}
function makeRoleRepo(perms:string[]){ return { findById: async ()=> ({ id:'r1', permissions:perms }) }; }
const audit = { log: async ()=>{} };
function memoryStorage(){ const m = new Map<string,string>(); return { getItem:(k:string)=> m.has(k)? m.get(k)!: null, setItem:(k:string,v:string)=>{ m.set(k,v); }, removeItem:(k:string)=>{ m.delete(k); } }; }

describe('AuthService expiración dinámica', () => {
  it('expira después de avanzar el tiempo configurado', async () => {
    vi.useFakeTimers();
    const hash = await bcrypt.hash('pw',6);
    const auth = new AuthService(makeUserRepo({ id:'u1', username:'demo', passwordHash:hash, roleId:'r1', active:true }), makeRoleRepo([]), audit, { durationMinutes: 1 }, memoryStorage());
    await auth.initialize();
    await auth.login('demo','pw');
    expect(auth.isAuthenticated()).toBe(true);
    // avanzar 59 segundos => todavía válida
    vi.advanceTimersByTime(59_000);
    expect(auth.isAuthenticated()).toBe(true);
    // avanzar 2 segundos más (total >60s)
    vi.advanceTimersByTime(2_000);
    expect(auth.isAuthenticated()).toBe(false);
    vi.useRealTimers();
  });
});
