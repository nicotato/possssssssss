import { initDatabaseV7 } from '../infrastructure/db/init-database.ts';
import { RxProductRepository } from '../infrastructure/repositories/rx-product-repository.js';
import { RxCustomerRepository } from '../infrastructure/repositories/rx-customer-repository.js';
import { RxOrderRepository } from '../infrastructure/repositories/rx-order-repository.js';
import { RxUserRepository } from '../infrastructure/repositories/rx-user-repository.js';
import { RxRoleRepository } from '../infrastructure/repositories/rx-role-repository.js';
import { RxAuditRepository } from '../infrastructure/repositories/rx-audit-repository.js';
import { RxSyncQueueRepository } from '../infrastructure/repositories/rx-sync-queue-repository.js';

import { CartService } from '../application/services/cart-service.js';
import { OrderService } from '../application/services/order-service.js';
import { AuthService } from '../application/services/auth-service.js';
import { AuditService } from '../application/services/audit-service.js';
import { RoleService } from '../application/services/role-service.js';
import { UserService } from '../application/services/user-service.js';
import { ReportService } from '../application/services/report-service.js';
import { SyncService } from '../application/services/sync-service.js';
import { PricingService } from '../application/services/pricing-service.js';
import { PrintingService } from '../application/services/printing-service.js';
import { ConfigurationService } from '../application/services/configuration-service.ts';
import { KitchenPrinter } from '../infrastructure/printing/kitchen-printer.ts';
import { EscPosPrinter } from '../infrastructure/printing/escpos-printer.ts';
import { RemoteAdapter } from '../infrastructure/sync/remote-adapter.js';
import { DEFAULT_ROLES } from '../domain/auth/constants.js';
import { BASE_PERMISSIONS } from '../domain/auth/permissions.js';

export async function createAppEnvironment() {
  console.log('[Bootstrap] Iniciando creación del entorno...');
  
  try {
    const db = await initDatabaseV7();
    console.log('[Bootstrap] Base de datos inicializada correctamente');
    
    const repos: any = {
      products: new RxProductRepository(db),
      customers: new RxCustomerRepository(db),
      orders: new RxOrderRepository(db),
      users: new RxUserRepository(db),
      roles: new RxRoleRepository(db),
      audit: new RxAuditRepository(db),
      queue: new RxSyncQueueRepository(db)
    };
    console.log('[Bootstrap] Repositorios creados');

    await seedIfEmpty(db);
    console.log('[Bootstrap] Datos semilla cargados');

    const services: any = {};
    services.audit = new AuditService(repos.audit);
    console.log('[Bootstrap] Servicio de auditoría creado');
    
    services.config = new ConfigurationService();
    console.log('[Bootstrap] Servicio de configuración creado');
    
    services.auth = new AuthService(repos.users, repos.roles, services.audit, { durationMinutes: 90 });
    await services.auth.initialize();
    console.log('[Bootstrap] Servicio de autenticación inicializado');
    
    services.cart = new CartService();
    services.pricing = new PricingService();
    
    // Inicializar PrintingService con configuración
    const printerConfig = services.config.getPrinterConfig();
    services.printing = new PrintingService({ 
      fallbackWindow: printerConfig.fallbackWindow,
      kitchen: new KitchenPrinter(),
      escpos: new EscPosPrinter()
    });
    if (services.printing.setPreferredMode) {
      services.printing.setPreferredMode(printerConfig.preferredMode);
    }
    console.log('[Bootstrap] Servicios de carrito, pricing y printing creados');
    
    services.orders = new OrderService(repos.orders, services.cart, services.audit, services.auth, repos.queue, services.pricing);
    services.orders.orderRepository = repos.orders; // Exponer el repositorio para acceso directo
    services.roles = new RoleService(repos.roles, services.audit);
    services.users = new UserService(repos.users, services.auth, services.audit);
    services.reports = new ReportService(repos.orders);
    services.sync = new SyncService(new RemoteAdapter('https://example-sync-server.test', async ()=> 'demo-token'), repos.orders, repos.products, repos.users, services.audit, repos.queue);
    
    console.log('[Bootstrap] Todos los servicios creados exitosamente');
    return { db, repos, services };
  } catch (error) {
    console.error('[Bootstrap] Error en createAppEnvironment:', error);
    throw error;
  }
}

async function seedIfEmpty(db:any) {
  try {
    console.log('[SEED] Iniciando proceso de seeding...');
    localStorage.setItem('all_perms_cache', JSON.stringify(BASE_PERMISSIONS));
    console.log('[SEED] Cache de permisos establecido');
    
    // Force refresh products in development (safe clear)
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      try {
        if (db.collections?.products) {
          const all = await db.products.find().exec();
          for (const doc of all) {
            try { await doc.remove(); } catch (e) { /* ignore individual */ }
          }
          // eslint-disable-next-line no-console
          console.log('[SEED] Productos limpiados (dev)');
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[SEED] Falló limpieza de productos dev', e);
      }
    }
    
    if(!db.collections?.roles) {
      console.error('[SEED] Colección roles no inicializada');
      return;
    }
    console.log('[SEED] Verificando roles existentes...');
    const rolesExisting = await db.roles.find().exec();
    console.log('[SEED] Roles encontrados:', rolesExisting.length);
    
    if(rolesExisting.length===0) {
      console.log('[SEED] Insertando roles por defecto...');
      await db.roles.bulkInsert(DEFAULT_ROLES);
      console.log('[SEED] Roles insertados exitosamente');
    }
    
    console.log('[SEED] Verificando usuarios...');
    const userCount = await db.users.count().exec();
    console.log('[SEED] Usuarios encontrados:', userCount);
    
    if(userCount === 0) {
      console.log('[SEED] Creando usuarios por defecto...');
      const hash = async (str:string) => {
        const enc = new TextEncoder().encode(str);
        const dig = await crypto.subtle.digest('SHA-256', enc);
        return Array.from(new Uint8Array(dig)).map(b=>b.toString(16).padStart(2,'0')).join('');
      };
      const adminHash = await hash('admin123');
      const cajaHash = await hash('caja123');
      await db.users.bulkInsert([
        { id:'u_admin', username:'admin', passwordHash:adminHash, roleId:'r_admin', active:true, createdAt:new Date().toISOString() },
        { id:'u_caja', username:'caja', passwordHash:cajaHash, roleId:'r_cajero', active:true, createdAt:new Date().toISOString() }
      ]);
      console.log('[SEED] Usuarios creados exitosamente');
    }
    
    if(!db.collections?.products) {
      console.error('[SEED] Colección products no inicializada');
      return;
    }
    
    console.log('[SEED] Verificando productos...');
    const existing = await db.products.find().exec();
    console.log('[SEED] Productos encontrados:', existing.length);
    
    if(existing.length===0) {
      console.log('[SEED] Insertando productos por defecto...');
      const pizzaImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDI1MCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTAiIGhlaWdodD0iMTgwIiBmaWxsPSIjZjc3ZjAwIi8+CjxjaXJjbGUgY3g9IjEyNSIgY3k9IjkwIiByPSI2MCIgZmlsbD0iI2ZmZmZmZiIgb3BhY2l0eT0iMC44Ii8+Cjx0ZXh0IHg9IjEyNSIgeT0iOTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5QaXp6YTwvdGV4dD4KPC9zdmc+';
      await db.products.bulkInsert([
        { id: 'p1', name: 'Pizza Muzzarella', basePrice: 300, category: 'Pizza', img: pizzaImage, active:true, createdAt:new Date().toISOString() },
        { id: 'p2', name: 'Pizza Napolitana', basePrice: 350, category: 'Pizza', img: pizzaImage, active:true, createdAt:new Date().toISOString() },
        { id: 'p3', name: 'Pizza Fugazzeta', basePrice: 360, category: 'Pizza', img: pizzaImage, active:true, createdAt:new Date().toISOString() }
      ]);
      console.log('[SEED] Productos insertados exitosamente');
    }
    
    console.log('[SEED] Verificando clientes...');
    const customers = await db.customers.find().exec();
    console.log('[SEED] Clientes encontrados:', customers.length);
    
    if(customers.length===0) {
      console.log('[SEED] Insertando clientes por defecto...');
      await db.customers.bulkInsert([
        { id: 'c099123456', phone: '099123456', name: 'Juan Pérez', address: 'Calle 123', barrio: 'Centro' },
        { id: 'c098987654', phone: '098987654', name: 'María López', address: 'Av. Italia 456', barrio: 'Malvín' }
      ]);
      console.log('[SEED] Clientes insertados exitosamente');
    }
    
    console.log('[SEED] Seeding completado exitosamente');
  } catch (error) {
    console.error('[SEED] Error durante el proceso de seeding:', error);
    throw error;
  }
}
