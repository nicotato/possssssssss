import { RxJsonSchema } from 'rxdb';

export interface StockMovement {
  id: string;
  createdAt: string;
  type: 'CONSUMPTION' | 'ADJUSTMENT' | 'WASTE' | 'PURCHASE';
  ingredientId?: string;
  productId?: string;
  qty: number;
  unitCostBase?: number;
  branchId?: string;
  reference?: string;
  note?: string;
  source?: string;
}

export const stockMovementSchema: RxJsonSchema<StockMovement> = {
  title: 'stock movement schema',
  version: 0,
  primaryKey: { key: 'id', fields: ['id'], separator: '|' },
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 80 },
    createdAt: { type: 'string', format: 'date-time', maxLength: 40 },
    type: { type: 'string', enum: ['CONSUMPTION', 'ADJUSTMENT', 'WASTE', 'PURCHASE'] },
    ingredientId: { type: 'string', maxLength: 64 },
    productId: { type: 'string', maxLength: 64 },
    qty: { type: 'number', minimum: 0, multipleOf: 0.0001 },
    unitCostBase: { type: 'number', minimum: 0, multipleOf: 0.0001 },
    branchId: { type: 'string', maxLength: 64 },
    reference: { type: 'string', maxLength: 64 },
    note: { type: 'string', maxLength: 240 },
    source: { type: 'string', maxLength: 64 }
  },
  required: ['id', 'createdAt', 'type', 'qty']
};