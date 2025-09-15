"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.priceExperimentSchema = void 0;
exports.priceExperimentSchema = {
    title: 'price experiment schema',
    version: 0,
    primaryKey: {
        key: 'id',
        fields: ['id'],
        separator: '|'
    },
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 80 },
        productId: { type: 'string', maxLength: 64 },
        createdAt: { type: 'string', format: 'date-time', maxLength: 40 },
        base: {
            type: 'object',
            properties: {
                price: { type: 'number', minimum: 0 },
                quantity: { type: 'number', minimum: 0 },
                elasticity: { type: 'number' }
            },
            required: ['price', 'quantity', 'elasticity']
        },
        scenarios: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string', maxLength: 64 },
                    price: { type: 'number', minimum: 0 },
                    estQuantity: { type: 'number', minimum: 0 },
                    estRevenue: { type: 'number', minimum: 0 }
                },
                required: ['id', 'price', 'estQuantity', 'estRevenue']
            }
        },
        modelVersion: { type: 'string', maxLength: 32 },
        tags: { type: 'array', items: { type: 'string', maxLength: 48 } },
        notes: { type: 'string', maxLength: 240 },
        user: { type: 'string', maxLength: 64 }
    },
    required: ['id', 'productId', 'createdAt', 'base', 'scenarios']
};
