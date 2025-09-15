import { RxJsonSchema } from 'rxdb';

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  segment?: string;
  createdAt: string;
  updatedAt?: string;
  totalSpendBase?: number;
  visits?: number;
}

export const customerSchema: RxJsonSchema<Customer> = {
  title: 'customer schema',
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
    phone: { type: 'string', maxLength: 32 },
    email: { type: 'string', maxLength: 120, pattern: '^.+@.+\\..+$' },
    segment: { type: 'string', maxLength: 32 },
    createdAt: { type: 'string', format: 'date-time', maxLength: 40 },
    updatedAt: { type: 'string', format: 'date-time', maxLength: 40 },
    totalSpendBase: { type: 'number', minimum: 0 },
    visits: { type: 'number', minimum: 0 }
  },
  required: ['id', 'name', 'createdAt']
};