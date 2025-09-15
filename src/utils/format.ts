// Currency / formatting helpers
export function formatMoney(value:number, currencySymbol='$') {
  if(Number.isNaN(value)) return currencySymbol + '0.00';
  return currencySymbol + value.toFixed(2);
}
