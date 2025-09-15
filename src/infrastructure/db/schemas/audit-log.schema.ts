import { RxJsonSchema } from 'rxdb';

export interface AuditLog {
  id: string;
  at: string;
  user?: string;
  action: string;
  entity?: string;
  entityId?: string;
  data?: any;
  ip?: string;
}

export const auditLogSchema: RxJsonSchema<AuditLog> = {
  title: 'audit log schema',
  version: 0,
  primaryKey: { key: 'id', fields: ['id'], separator: '|' },
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 80 },
    at: { type: 'string', format: 'date-time', maxLength: 40 },
    user: { type: 'string', maxLength: 64 },
    action: { type: 'string', maxLength: 64 },
    entity: { type: 'string', maxLength: 64 },
    entityId: { type: 'string', maxLength: 80 },
    data: { type: 'object', additionalProperties: true },
    ip: { type: 'string', maxLength: 64 }
  },
  required: ['id', 'at', 'action']
};