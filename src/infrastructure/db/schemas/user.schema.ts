import { RxJsonSchema } from 'rxdb';

export interface User {
  id: string;
  username: string;
  name?: string;
  roleId?: string;
  branchId?: string;
  active: boolean;
  createdAt: string;
  passwordHash?: string;
  lastLoginAt?: string;
  mustChangePassword?: boolean;
  passwordChangedAt?: string;
}

export const userSchema: RxJsonSchema<User> = {
  title: 'user schema',
  version: 1, // Incrementar versión para migración
  primaryKey: { key: 'id', fields: ['id'], separator: '|' },
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 64 },
    username: { type: 'string', maxLength: 64 },
    name: { type: 'string', maxLength: 120 },
    roleId: { type: 'string', maxLength: 64 },
    branchId: { type: 'string', maxLength: 64 },
    active: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time', maxLength: 40 },
    passwordHash: { type: 'string', maxLength: 128 },
    lastLoginAt: { type: 'string', format: 'date-time', maxLength: 40 },
    mustChangePassword: { type: 'boolean' },
    passwordChangedAt: { type: 'string', format: 'date-time', maxLength: 40 }
  },
  required: ['id', 'username', 'active', 'createdAt']
};