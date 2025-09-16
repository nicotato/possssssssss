/**
 * Archivo agregado para mantener compatibilidad con importaciones existentes.
 * Si ya migraste a pricing/discount-types puedes re-exportar desde allí.
 * Ajusta según tus necesidades reales.
 */

export const DISCOUNT_TYPES = [
  { code: 'PERCENT', label: 'Descuento %' },
  { code: 'FIXED', label: 'Descuento Fijo' }
];

/**
 * (Opcional) Validación rápida
 */
export function isDiscountType(value) {
  return DISCOUNT_TYPES.some(dt => dt.code === value);
}