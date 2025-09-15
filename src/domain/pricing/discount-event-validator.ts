import { DiscountEventTypes } from './discount-types.js';

export function validateDiscountEvent(ev: any) {
  if (!ev || typeof ev !== 'object') throw new Error('Evento inválido');
  if (!Object.values(DiscountEventTypes).includes(ev.type)) {
    throw new Error('Tipo de descuento no soportado: ' + ev.type);
  }
  return true;
}