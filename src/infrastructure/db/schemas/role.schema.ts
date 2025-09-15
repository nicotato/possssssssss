import { RxJsonSchema } from 'rxdb';

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  createdAt: string;
  updatedAt?: string;
}

export const roleSchema: RxJsonSchema<Role> = {
  title: 'role schema',
  version: 0,
  primaryKey: { key: 'id', fields: ['id'], separator: '|' },
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 64 },
    name: { type: 'string', maxLength: 64 },
    permissions: {
      type: 'array',
      items: { type: 'string', maxLength: 64 }
    },
    createdAt: { type: 'string', format: 'date-time', maxLength: 40 },
    updatedAt: { type: 'string', format: 'date-time', maxLength: 40 }
  },
  required: ['id', 'name', 'permissions', 'createdAt']
};