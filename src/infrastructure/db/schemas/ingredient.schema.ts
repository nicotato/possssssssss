import { RxJsonSchema } from 'rxdb';

export interface Ingredient {
  id: string;
  name: string;
  category?: string;
  unit: string;          // g, ml, unit
  avgCost: number;
  lastCost?: number;
  updatedAt?: string;
  createdAt: string;
  active: boolean;
}

export const ingredientSchema: RxJsonSchema<Ingredient> = {
  title: 'ingredient schema',
  version: 0,
  primaryKey: { key: 'id', fields: ['id'], separator: '|' },
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 64 },
    name: { type: 'string', maxLength: 120 },
    category: { type: 'string', maxLength: 64 },
    unit: { type: 'string', maxLength: 16 },
    avgCost: { type: 'number', minimum: 0, multipleOf: 0.0001 },
    lastCost: { type: 'number', minimum: 0, multipleOf: 0.0001 },
    updatedAt: { type: 'string', format: 'date-time', maxLength: 40 },
    createdAt: { type: 'string', format: 'date-time', maxLength: 40 },
    active: { type: 'boolean' }
  },
  required: ['id', 'name', 'unit', 'avgCost', 'createdAt', 'active']
};