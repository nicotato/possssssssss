"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDiscountEvent = validateDiscountEvent;
var discount_types_1 = require("./discount-types");
function validateDiscountEvent(ev) {
    if (!ev || typeof ev !== 'object')
        throw new Error('Evento inválido');
    if (!Object.values(discount_types_1.DiscountEventTypes).includes(ev.type)) {
        throw new Error('Tipo de descuento no soportado: ' + ev.type);
    }
    return true;
}
