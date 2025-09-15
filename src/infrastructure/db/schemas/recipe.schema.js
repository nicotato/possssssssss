"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recipeSchema = void 0;
exports.recipeSchema = {
    title: 'recipe schema',
    version: 0,
    primaryKey: { key: 'id', fields: ['id'], separator: '|' },
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 64 },
        productId: { type: 'string', maxLength: 64 },
        components: {
            type: 'array',
            minItems: 1,
            items: {
                type: 'object',
                properties: {
                    ingredientId: { type: 'string', maxLength: 64 },
                    qty: { type: 'number', minimum: 0, multipleOf: 0.0001 },
                    wastagePct: { type: 'number', minimum: 0, maximum: 100 }
                },
                required: ['ingredientId', 'qty']
            }
        },
        yield: { type: 'number', minimum: 0.0001 },
        createdAt: { type: 'string', format: 'date-time', maxLength: 40 },
        active: { type: 'boolean' }
    },
    required: ['id', 'productId', 'components', 'yield', 'createdAt', 'active']
};
