"use strict";
/**
 * Tipos de eventos de descuento/promoción soportados por el pipeline.
 * Centraliza las constantes para evitar errores de tipeo.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscountEventTypes = void 0;
exports.DiscountEventTypes = {
    DiscountPercentCart: 'discountPercentCart',
    DiscountFixedCart: 'discountFixedCart',
    DiscountPercentLine: 'discountPercentLine',
    DiscountFixedLine: 'discountFixedLine',
    BuyXGetY: 'buyXGetY',
    FreeItem: 'freeItem',
    ComboFixedPrice: 'comboFixedPrice'
};
