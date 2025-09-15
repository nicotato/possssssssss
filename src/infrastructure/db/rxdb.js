// MODIFICADO: order schema version 2 para incluir descuentos y pagos
import { createRxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBQueryBuilderPlugin } from 'rxdb/plugins/query-builder';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';

addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBUpdatePlugin);

const productSchema = {
  title: 'product schema',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    price: { type: 'number' },
    category: { type: 'string' },
    img: { type: 'string' },
    active: { type: 'boolean', default: true }
  },
  required: ['id','name','price']
};

const customerSchema = {
  title: 'customer schema',
  version: 0,
  primaryKey: 'id',
  type:'object',
  properties: {
    id:{type:'string'},
    phone:{type:'string'},
    name:{type:'string'},
    address:{type:'string'},
    barrio:{type:'string'}
  },
  required:['id','phone','name']
};

const orderSchema = {
  title: 'order schema',
  version: 2,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id:{type:'string'},
    createdAt:{type:'string', format:'date-time'},
    status:{type:'string'},
    lines:{
      type:'array',
      items:{
        type:'object',
        properties:{
          productId:{type:'string'},
          name:{type:'string'},
          qty:{type:'number'},
          unitPrice:{type:'number'},
          lineTotal:{type:'number'},
          category:{type:'string'}
        },
        required:['productId','name','qty','unitPrice','lineTotal']
      }
    },
    subTotal:{type:'number'},
    discountTotal:{type:'number'},
    grandTotal:{type:'number'},
    discounts:{
      type:'array',
      items:{
        type:'object',
        properties:{
          type:{type:'string'},
          value:{type:'number'},
          label:{type:'string'},
            amount:{type:'number'}
        }
      }
    },
    payments:{
      type:'array',
      items:{
        type:'object',
        properties:{
          method:{type:'string'},
          amount:{type:'number'}
        },
        required:['method','amount']
      }
    },
    amountPaid:{type:'number'},
    changeDue:{type:'number'},
    paymentStatus:{type:'string'},
    customerPhone:{type:'string'},
    customerName:{type:'string'},
    total:{type:'number'},
    sync:{
      type:'object',
      properties:{
        synced:{type:'boolean'},
        lastAttempt:{type:'string', format:'date-time'}
      }
    },
    kitchenPrinted:{type:'boolean', default:false},
    invoicePrinted:{type:'boolean', default:false}
  },
  required:['id','createdAt','status','lines','grandTotal']
};

// Reusar schemas previos (users, roles, audit, queue) — se omiten aquí por brevedad; mantener igual que tu versión avanzada previa

export async function initDatabase() {
  const db = await createRxDatabase({
    name: 'pos_pizzeria_v3',
    storage: getRxStorageDexie(),
    ignoreDuplicate: true
  });

  await db.addCollections({
    products: { schema: productSchema },
    customers: { schema: customerSchema },
    orders: { schema: orderSchema },
    // ... añade aquí las demás colecciones exactamente como estaban
    // users, roles, audit_logs, sync_queue
  });

  return db;
}