# POS Pizzería del Barrio (Offline-First) – Versión Avanzada

Este README resume las nuevas capacidades añadidas:

## Nuevas Funcionalidades
- Expiración de sesión configurable (por defecto 90 min).
- Cambio de contraseña propio y reseteo admin (flag mustChangePassword).
- Roles y permisos dinámicos en DB (colección roles).
- Auditoría completa (acciones clave).
- Gestión de usuarios (crear, desactivar, cambiar rol).
- CRUD de productos (crear, editar, activar/desactivar).
- Administración de órdenes (filtrar, anular, marcar entregada).
- Comanda para cocina (impresión separada, sin precios).
- Impresión de factura con flags de impresión.
- Reportes de:
  - Ventas por rango de fechas
  - Top productos
  - Totales por categoría
- Sincronización remota (arquitectura + adapter + cola)
- Cola de sincronización (sync_queue):
  - Encolado de operaciones offline
  - Push/Pull periódico
- Auditoría de sincronización, impresión y mutaciones.

## Arquitectura Hexagonal
Capas:
- domain/: modelos conceptuales, utilidades, permisos base
- application/: servicios de negocio (auth, orders, reports, etc.)
- infrastructure/: adaptadores concretos (RxDB, printers, sync, repos)
- ui/: vistas y control de interacción

## Colecciones RxDB
- products
- customers
- orders (versión 1)
- users (versión 1)
- roles
- audit_logs
- sync_queue

## Permisos Base
Se almacenan en `domain/auth/permissions.js`.
Roles con `'*'` interpretan "todos los permisos".

## Auditoría
Acciones en `domain/audit/actions.js` (puedes extender).

## Sincronización
`SyncService` + `RemoteAdapter`. Debes implementar backend:
Endpoints sugeridos:
- `POST /api/push` body: { id, entity, entityId, op, payload }
- `GET /api/pull` respuesta: { products:[], orders:[] }

## Impresión
Sistema unificado mediante `PrintingService`:

Características:
- Cola FIFO con IDs (`pj_<n>`)
- Batching ESC/POS (ventana 50ms) agrupa trabajos y reduce round-trips
- Retries para ESC/POS (250, 500, 1000ms) y fallback a ventana salvo modo `escpos`
- Métricas: `jobsProcessed`, `jobsFailed`, `escposRetries`, `avgLatencyMs`, `batchCount`, `queuedPeak`
- Cancelación: `cancelJob(id)` y `cancelAll()` (limpia buffer y timer)
- Preferencia persistida (`print_pref`): `auto | escpos | window`
- Eventos: `queue`, `processing`, `mode`, `metrics`
- Formateo monetario i18n
- Fallback `window.open` HTML minimalista

API:
- `printInvoice(order)` / `printKitchen(order)` / `printBoth(order)`
- `setPreferredMode(mode)` y `getPreferredMode()`
- `getMetrics()` snapshot

Adaptadores tipados:
- `InvoicePrinter`, `KitchenPrinter`, `EscPosPrinterLike`

Próximos incrementos sugeridos: timeout por trabajo, backoff configurable, persistencia de métricas histórica.

## Reportes
Servicio `ReportService` con agregados en memoria (para grandes volúmenes considerar índices y pre-aggregados).

## Migraciones
Actualmente se cambió nombre DB a `pos_pizzeria_v2` para evitar migraciones manuales en desarrollo.
En producción:

## Sesión / Autenticación
`AuthService` ahora:

- Hash seguro `bcrypt` (cost 10) y upgrade automático desde SHA-256 legacy al primer login correcto.
- Inyección de almacenamiento (por defecto `localStorage`, en tests memoria) para `pos_session`.
- Expiración configurable (`durationMinutes`).
- Carga perezosa de permisos en `initialize()` y caché en `Set`.
- Wildcard `'*'` soportada (lee `all_perms_cache` si existe).
- `changeOwnPassword` y `adminResetPassword` renombran hash y marcan `mustChangePassword`.
- Errores consistentes con `AuthError`.

Campos sesión: `username`, `userId`, `roleId`, `expiresAt` (+ opcional `mustChangePassword`).

Edge cases cubiertos en tests: login bcrypt, login legacy + upgrade, password incorrecto. Pendiente: expiración, wildcard, cambio de password (se pueden añadir fácilmente).
## Migración a React (Progreso)

Se inició una migración incremental de la UI clásica (manipulación directa del DOM) a React + TypeScript sin romper la app existente.

### En esta fase
1. Se agregaron dependencias: react, react-dom, react-router-dom y tipos.
2. `tsconfig.json` ahora habilita `"jsx": "react-jsx"`.
3. Nuevo árbol en `src/ui/` con:
  - `AppContext.tsx`: puente a los servicios/repos legacy.
  - `App.tsx`: shell + routing básico.
  - `components/NavBar.tsx`: navegación autorizada según permisos.
  - `pages/LoginPage.tsx`, `pages/ProductsPage.tsx`: primera vista migrada.
  - `main-react.tsx`: punto de entrada React que reutiliza bootstrap existente.
  - `shim-existing-state.js`: expone `window.__LEGACY_STATE` usando `state` de `main.js`.
4. `Index.html` ahora tiene `<div id="react-root"></div>` y carga el bundle React luego del legacy.

### Estrategia de migración
Se usa ejecución side-by-side: la UI existente sigue operativa mientras se van reemplazando vistas. Cada vista migrada se servirá por ruta React (`/productos`, `/menu`, etc.) y podremos retirar gradualmente el rendering manual.

### Próximos pasos sugeridos

### Cómo probar
1. Iniciar la app (`npm run dev`).
2. Navegar a `/productos` directamente o usar la barra React (si permisos cargados).
3. Crear/editar productos para validar paridad funcional.
Eliminar el script `src/ui/main-react.tsx` del `Index.html` y el div `react-root` para volver al comportamiento original sin React.

## React Migration Progress

Completed:
- Core bootstrap rewritten for React (bootstrap-react.ts + main-react-full.tsx)
- Authentication persistence and permission-based navigation
- Products, Login, Roles, Users, Audit, Reports, Menu (cart), Ventas (sales history), Órdenes Admin pages migrated
- Shared hooks (useServices, useAuth, usePermissions, useOnlineStatus)
- Reusable UI primitives (DataTable, Modal, Tag, SyncStatus)
- Toast + Confirm + FormModal providers (reemplazo completo de alert/confirm/prompt)

Pending (next waves):
- Audit log streaming or on-demand refresh option
- Sync operations UI (manual push/pull, conflict indicators)
- Extended service typing with richer domain models

Planned Architecture Notes:
- State derives from existing services; React layer remains thin wrappers.
  - Objetivo cumplido: eliminación total de `alert/confirm/prompt` nativos para UX consistente y futura internacionalización.

### FormModal Pattern
Ejemplo creación de producto:
```ts
const showForm = useFormModal();
await showForm({
  title:'Nuevo Producto',
  submitLabel:'Crear',
  fields:[
    { name:'name', label:'Nombre', required:true },
    { name:'basePrice', label:'Precio', type:'number', required:true },
    { name:'category', label:'Categoría' }
  ],
  validate:(v)=> !v.name ? 'Nombre requerido' : (v.basePrice==null||isNaN(v.basePrice)) ? 'Precio inválido' : null
}, async (values)=> { /* persist */ });
```

### Service Typings
Archivo `src/ui/types/services.d.ts` define interfaces mínimas (AuthService, UsersService, RolesService, OrdersService, PricingService, CartService, AuditService, ReportsService). Esto facilita refactors y autocompletado. Se pueden ampliar progresivamente.

Tracking: See issue list / TODOs for incremental tasks.
Guardada en localStorage: `pos_session`
Campos: username, userId, roleId, expiresAt
Verifica expiración antes de chequear permisos.

## Próximas Mejoras (Sugeridas)
- Manejo de impuestos / descuentos
- Pagos múltiples (efectivo, tarjeta)
- Integración con impresora térmica ESC/POS (WebUSB/WebSerial)
- Sincronización incremental (solo cambios)
- Seguridad real con backend + JWT

## Desarrollo
Servir con:
```bash
npx serve .
```
O Vite / Webpack para empaquetar RxDB según tu entorno.

## Seguridad y Errores
Taxonomía (`domain/errors/errors.ts`): `DomainError`, `ValidationError`, `AuthError`, `NotFoundError`, `ConflictError`.

Mejoras:
- Hash bcrypt + upgrade transparente.
- Validación de expiración de sesión.
- Logging centralizado (`logger`) con niveles.

Pendiente para producción:
- Backend con tokens firmados (JWT/PASETO) + refresh tokens y rotación.
- Rate limiting / bloqueo adaptativo.
- Protección sync (firmas, nonce, control de repetición).
- Auditoría durable con retención y export.

Nota: todavía no hay control de origen ni CSRF porque el backend es demo.

### Manejo Estándar de Errores
Ejemplo patrón en UI / servicio consumidor:
```ts
import { ValidationError, AuthError, NotFoundError, ConflictError } from 'domain/errors/errors';

try {
  await orderService.finalizeSale(payload);
  toast.success('Venta registrada');
} catch(e:any){
  if(e instanceof ValidationError){ toast.error(e.message); }
  else if(e instanceof AuthError){ redirectToLogin(); }
  else if(e instanceof NotFoundError){ toast.warn('Recurso no encontrado'); }
  else if(e instanceof ConflictError){ toast.warn('Conflicto de actualización, refresca datos'); }
  else { logger.error('Unhandled error', { error:String(e) }); toast.error('Error inesperado'); }
}
```
Ventajas:
- Mensajes consistentes y traducibles.
- Log estructurado para monitoreo.
- Futuros mapeos a códigos HTTP si se externaliza backend.

## Usuarios Iniciales
| Usuario | Contraseña | Rol    |
|---------|------------|--------|
| admin   | admin123   | ADMIN  |
| caja    | caja123    | CAJERO (mustChangePassword=true) |

## Roles Iniciales
Ver `domain/auth/constants.js`.

## Licencia
MIT