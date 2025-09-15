// Bootstrap simplificado para diagnosticar el problema
import { AuthService } from '../application/services/auth-service.js';

// Mock repositories para pruebas rápidas
class MockUserRepository {
  private users: any[] = [
    { id:'u_admin', username:'admin', passwordHash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', roleId:'r_admin', active:true }
  ];
  
  async findByUsername(username: string) {
    return this.users.find(u => u.username === username) || null;
  }
  
  async findById(id: string) {
    return this.users.find(u => u.id === id) || null;
  }

  async setPassword(id: string, passwordHash: string) {
    const user = this.users.find(u => u.id === id);
    if (user) {
      user.passwordHash = passwordHash;
      user.passwordChangedAt = new Date().toISOString();
      user.mustChangePassword = false;
    }
  }
}

class MockRoleRepository {
  private roles: any[] = [
    { id: 'r_admin', name: 'ADMIN', permissions: ['*'] }
  ];
  
  async findById(id: string) {
    return this.roles.find(r => r.id === id) || null;
  }
}

class MockAuditService {
  async log(action: string, details: any) {
    console.log(`[AUDIT] ${action}:`, details);
  }
}

export async function createSimpleAppEnvironment() {
  console.log('[SIMPLE BOOTSTRAP] Iniciando...');
  
  const mockUserRepo = new MockUserRepository();
  const mockRoleRepo = new MockRoleRepository();
  const mockAudit = new MockAuditService();
  
  const services: any = {};
  services.audit = mockAudit;
  services.auth = new AuthService(mockUserRepo, mockRoleRepo, mockAudit, { durationMinutes: 90 });
  
  try {
    await services.auth.initialize();
    console.log('[SIMPLE BOOTSTRAP] Auth service inicializado');
  } catch (error) {
    console.error('[SIMPLE BOOTSTRAP] Error inicializando auth service:', error);
    throw error;
  }
  
  // Mock para otros servicios que puedan ser necesarios
  services.cart = { toArray: () => [], total: () => 0 };
  services.pricing = { calculate: () => ({ subTotal: 0, discountTotal: 0, grandTotal: 0 }) };
  
  const repos = {
    products: { 
      getAll: async () => [
        { id: 'p1', name: 'Pizza Test', basePrice: 100, toJSON: function() { return this; } }
      ],
      findById: async (id: string) => null,
      col: null // Agregar propiedad requerida
    }
  };
  
  console.log('[SIMPLE BOOTSTRAP] Entorno simple creado exitosamente');
  return { services, repos, db: null };
}
