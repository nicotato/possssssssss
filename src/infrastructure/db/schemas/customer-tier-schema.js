export const customerTierSchema = {
  title:'customer tier schema',
  version:0,
  primaryKey:'id',
  type:'object',
  properties:{
    id:{type:'string'},          // customerId
    tier:{type:'string'},        // GOLD | SILVER | BRONZE
    ltv:{type:'number'},
    updatedAt:{type:'string', format:'date-time'}
  },
  required:['id','tier','ltv','updatedAt']
};