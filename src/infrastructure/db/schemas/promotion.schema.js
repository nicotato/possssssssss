"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promotionSchema = void 0;
exports.promotionSchema = {
    title: 'promotion schema v2',
    version: 2,
    primaryKey: {
        key: 'id',
        fields: ['id'],
        separator: '|'
    },
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 64 },
        name: { type: 'string', maxLength: 160 },
        type: { type: 'string', enum: ['BUY_X_GET_Y', 'SECOND_DISCOUNT', 'COMBO_FIXED', 'PERCENT_CART', 'CUSTOM'] },
        active: { type: 'boolean' },
        priority: { type: 'number', minimum: 0 },
        stackable: { type: 'boolean' },
        excludes: {
            type: 'array',
            items: { type: 'string', maxLength: 64 }
        },
        config: { type: 'object', additionalProperties: true },
        appliesToBranchIds: {
            type: 'array',
            items: { type: 'string', maxLength: 64 }
        },
        validFrom: { type: 'string', format: 'date-time', maxLength: 40 },
        validTo: { type: 'string', format: 'date-time', maxLength: 40 },
        logic: { type: 'object', additionalProperties: true },
        dsl: { type: 'string', maxLength: 4000 }
    },
    required: ['id', 'name', 'type', 'active']
};
