"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recipeVariantSchema = void 0;
exports.recipeVariantSchema = {
    title: 'recipe variant schema',
    version: 0,
    primaryKey: { key: 'id', fields: ['id'], separator: '|' },
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 64 },
        recipeId: { type: 'string', maxLength: 64 },
        name: { type: 'string', maxLength: 120 },
        active: { type: 'boolean' },
        components: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    ingredientId: { type: 'string', maxLength: 64 },
                    qty: { type: 'number', minimum: 0, multipleOf: 0.0001 }
                },
                required: ['ingredientId', 'qty']
            }
        },
        createdAt: { type: 'string', format: 'date-time', maxLength: 40 }
    },
    required: ['id', 'recipeId', 'name', 'active', 'components', 'createdAt']
};
