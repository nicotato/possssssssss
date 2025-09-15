"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncQueueSchema = void 0;
exports.syncQueueSchema = {
    title: 'sync queue schema',
    version: 1,
    primaryKey: { key: 'id', fields: ['id'], separator: '|' },
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 90 },
        createdAt: { type: 'string', format: 'date-time', maxLength: 40 },
    entityCollection: { type: 'string', maxLength: 64 },
        docId: { type: 'string', maxLength: 80 },
        op: { type: 'string', enum: ['INSERT', 'UPDATE', 'DELETE'] },
        payload: { type: 'object', additionalProperties: true },
        retries: { type: 'number', minimum: 0 },
        lastAttemptAt: { type: 'string', format: 'date-time', maxLength: 40 },
        status: { type: 'string', enum: ['pending', 'sent', 'failed'] }
    },
    required: ['id', 'createdAt', 'entityCollection', 'docId', 'op']
};
