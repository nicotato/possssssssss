export const stockMovementSchema = {
  title:'stock movement schema',
  version:0,
  primaryKey:'id',
  type:'object',
  properties:{
    id:{type:'string'},
    productId:{type:'string'},
    type:{type:'string'}, // sale|purchase|adjust
    qty:{type:'number'},  // positivo o negativo
    refId:{type:'string'}, // id de orden o compra
    timestamp:{type:'string', format:'date-time'},
    note:{type:'string'}
  },
  required:['id','productId','type','qty','timestamp']
};