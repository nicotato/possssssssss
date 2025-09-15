"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = void 0;
exports.userSchema = {
    title: 'user schema',
    version: 0,
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
        lastLoginAt: { type: 'string', format: 'date-time', maxLength: 40 }
    },
    required: ['id', 'username', 'active', 'createdAt']
};
