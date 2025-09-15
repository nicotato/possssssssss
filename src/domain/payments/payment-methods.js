export const PAYMENT_METHODS = [
  { code: 'CASH', label: 'Efectivo' },
  { code: 'CARD', label: 'Tarjeta' },
  { code: 'QR', label: 'Billetera QR' },
  { code: 'ONLINE', label: 'Online' }
];

export function getPaymentLabel(code) {
  return PAYMENT_METHODS.find(p => p.code === code)?.label || code;
}