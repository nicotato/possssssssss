"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogSchema = void 0;
exports.auditLogSchema = {
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
