import { addRxPlugin, createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBMigrationSchemaPlugin } from 'rxdb/plugins/migration-schema';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';

// Schemas (importa todos)
import { orderSchema } from './schemas/order.schema.ts';
import { promotionSchema } from './schemas/promotion.schema.ts';
import { productSchema } from './schemas/product.schema.ts';
import { customerSchema } from './schemas/customer.schema.ts';
import { userSchema } from './schemas/user.schema.ts';
import { roleSchema } from './schemas/role.schema.ts';
import { auditLogSchema } from './schemas/audit-log.schema.ts';
import { syncQueueSchema } from './schemas/sync-queue.schema.ts';
import { ingredientSchema } from './schemas/ingredient.schema.ts';
import { recipeSchema } from './schemas/recipe.schema.ts';
import { recipeVariantSchema } from './schemas/recipe-variant.schema.ts';
import { stockMovementSchema } from './schemas/stock-movement.schema.ts';
import { productPriceHistorySchema } from './schemas/currency-price-history.schema.ts';
import { simulationRunSchema } from './schemas/simulation-run.schema.ts';
import { priceExperimentSchema } from './schemas/price-experiment.schema.ts';

// Migration strategies existentes
import { orderMigrationStrategies } from './migrations/order.migrations.ts';
import { promotionMigrationStrategies } from './migrations/promotion.migrations.ts';
import { userMigrationStrategies } from './migrations/user.migrations.ts';

addRxPlugin(RxDBMigrationSchemaPlugin);
addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBQueryBuilderPlugin);

export async function initDatabaseV7() {
  console.log('[DB] Iniciando creación de base de datos...');
  
  try {
    const db = await createRxDatabase({
      name: 'pos_pizzeria_v8', // Cambiar nombre para evitar conflicto
      storage: getRxStorageDexie()
    });
    console.log('[DB] RxDatabase creada exitosamente');

    console.log('[DB] Agregando colecciones...');
    await db.addCollections({
      // Comerciales
      products: { schema: productSchema },
      customers: { schema: customerSchema },
      orders: {
        schema: orderSchema,
        migrationStrategies: orderMigrationStrategies
      },
      promotions: {
        schema: promotionSchema,
        migrationStrategies: promotionMigrationStrategies
      },

      // Seguridad / Usuarios
      users: { 
        schema: userSchema,
        migrationStrategies: userMigrationStrategies
      },
      roles: { schema: roleSchema },

      // Auditoría y sincronización
      audit_logs: { schema: auditLogSchema },
      sync_queue: { schema: syncQueueSchema },

      // Inventario / Costos
      ingredients: { schema: ingredientSchema },
      recipes: { schema: recipeSchema },
      recipe_variants: { schema: recipeVariantSchema },
      stock_movements: { schema: stockMovementSchema },

      // Multi-moneda / Precios históricos
      product_price_history: { schema: productPriceHistorySchema },

      // Simulaciones / Experimentos
      simulation_runs: { schema: simulationRunSchema },
      price_experiments: { schema: priceExperimentSchema }
    });
    console.log('[DB] Colecciones agregadas exitosamente');

    return db;
  } catch (error) {
    console.error('[DB] Error inicializando base de datos:', error);
    throw error;
  }
}