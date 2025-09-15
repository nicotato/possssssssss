import { RxJsonSchema } from 'rxdb';

export interface Product {
  id: string;
  name: string;
  category?: string;
  sku?: string;
  barcode?: string;
  basePrice?: number;
  active: boolean;
  taxCategory?: string;
  recipeId?: string;
  variantsEnabled?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export const productSchema: RxJsonSchema<Product> = {
  title: 'product schema',
  version: 0,
  primaryKey: {
    key: 'id',
    fields: ['id'],
    separator: '|'
  },
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 64 },
    name: { type: 'string', maxLength: 160 },
    category: { type: 'string', maxLength: 64 },
    sku: { type: 'string', maxLength: 64 },
    barcode: { type: 'string', maxLength: 64 },
    basePrice: { type: 'number', minimum: 0, multipleOf: 0.0001 },
    active: { type: 'boolean' },
    taxCategory: { type: 'string', maxLength: 32 },
    recipeId: { type: 'string', maxLength: 64 },
    variantsEnabled: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time', maxLength: 40 },
    updatedAt: { type: 'string', format: 'date-time', maxLength: 40 }
  },
  required: ['id', 'name', 'active', 'createdAt']
};