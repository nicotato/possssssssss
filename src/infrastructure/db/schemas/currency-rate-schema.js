export const currencyRateSchema = {
  title: 'currency rate schema',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id:{type:'string'},                 // e.g. "UYU_USD_2025-09-12T15:00"
    base:{type:'string'},               // "UYU"
    quote:{type:'string'},              // "USD"
    rate:{type:'number'},               // 0.025
    timestamp:{type:'string', format:'date-time'}
  },
  required:['id','base','quote','rate','timestamp']
};