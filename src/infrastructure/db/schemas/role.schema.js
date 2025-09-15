"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleSchema = void 0;
exports.roleSchema = {
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
