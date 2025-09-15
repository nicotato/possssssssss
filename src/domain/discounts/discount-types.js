/**
 * Archivo agregado para mantener compatibilidad con importaciones existentes.
 * Si ya migraste a pricing/discount-types puedes re-exportar desde allí.
 * Ajusta según tus necesidades reales.
 */

export const DISCOUNT_TYPES = [
  { PERCENT: 'PERCENT' },        // Descuento manual porcentual
  { FIXED: 'FIXED' },            // Descuento manual fijo
  { PROMO_PERCENT_CART: 'discountPercentCart' },  // Evento promo: % carrito
  { PROMO_FIXED_CART: 'discountFixedCart' },      // Evento promo: fijo carrito
  { PROMO_PERCENT_LINE: 'discountPercentLine' },  // (si implementas)
  { PROMO_FIXED_LINE: 'discountFixedLine' },
  { PROMO_BUY_X_GET_Y: 'buyXGetY' },
  { PROMO_FREE_ITEM: 'freeItem' },
  { PROMO_COMBO_FIXED: 'comboFixedPrice' }
];

/**
 * (Opcional) Validación rápida
 */
export function isDiscountType(value) {
  return Object.values(DISCOUNT_TYPES).includes(value);
}