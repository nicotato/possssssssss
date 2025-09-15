import { addRxPlugin, createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBMigrationPlugin } from 'rxdb/plugins/migration';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';

import { ORDER_SCHEMA, orderMigrationStrategies } from './order.migrations.js';
import { PROMOTION_SCHEMA, promotionMigrationStrategies } from './promotion.migrations.js';

// IMPORTA el resto de schemas ya existentes
import { productPriceHistorySchema } from '../schemas/currency-price-history.schema.ts'; // ejemplo
// ... (añade tus otros schemas tipados)

addRxPlugin(RxDBMigrationPlugin);
addRxPlugin(RxDBUpdatePlugin);
addRxPlugin(RxDBQueryBuilderPlugin);

export async function initDatabaseV7() {
  const db = await createRxDatabase({
    name: 'pos_pizzeria_v7',
    storage: getRxStorageDexie()
  });

  await db.addCollections({
    orders: {
      schema: ORDER_SCHEMA,
      migrationStrategies: orderMigrationStrategies
    },
    promotions: {
      schema: PROMOTION_SCHEMA,
      migrationStrategies: promotionMigrationStrategies
    },
    product_price_history: {
      schema: productPriceHistorySchema
    }
    // Añade el resto de colecciones con sus migraciones si aplica
  });

  return db;
}