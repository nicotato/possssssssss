export interface MoneyFormatterOptions { locale?:string; currency?:string; minimumFractionDigits?:number; }

export function buildMoneyFormatter(opts: MoneyFormatterOptions = {}) {
  const { locale='es-AR', currency='ARS', minimumFractionDigits=2 } = opts;
  const fmt = new Intl.NumberFormat(locale,{ style:'currency', currency, minimumFractionDigits });
  return (value:number)=> fmt.format(value || 0);
}

export function formatDateTime(iso:string, locale='es-AR', options?: Intl.DateTimeFormatOptions) {
  const fmt = new Intl.DateTimeFormat(locale, options || { dateStyle:'short', timeStyle:'short' });
  return fmt.format(new Date(iso));
}
