"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulationRunSchema = void 0;
exports.simulationRunSchema = {
    title: 'simulation run schema',
    version: 0,
    primaryKey: {
        key: 'id',
        fields: ['id'],
        separator: '|'
    },
    type: 'object',
    properties: {
        id: { type: 'string', maxLength: 80 },
        createdAt: { type: 'string', format: 'date-time', maxLength: 40 },
        scenarioHash: { type: 'string', maxLength: 64 },
        scenarioInput: { type: 'object', additionalProperties: true },
        result: { type: 'object', additionalProperties: true },
        metrics: {
            type: 'object',
            properties: {
                grandTotalBase: { type: 'number' },
                discountTotal: { type: 'number' },
                promotionDiscountTotal: { type: 'number' },
                taxTotal: { type: 'number' },
                tipAmount: { type: 'number' },
                costVarianceBase: { type: 'number' }
            }
        },
        tags: {
            type: 'array',
            items: { type: 'string', maxLength: 48 }
        },
        user: { type: 'string', maxLength: 64 }
    },
    required: ['id', 'createdAt', 'scenarioHash', 'scenarioInput', 'result']
};
