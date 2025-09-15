export const costVarianceSchema = {
  title:'cost variance schema',
  version:0,
  primaryKey:'id',
  type:'object',
  properties:{
    id:{type:'string'},
    orderId:{type:'string'},
    productId:{type:'string'},
    qty:{type:'number'},
    stdCostUnit:{type:'number'},
    realCostUnit:{type:'number'},
    varianceUnit:{type:'number'},
    totalVariance:{type:'number'},
    createdAt:{type:'string', format:'date-time'}
  },
  required:['id','orderId','productId','qty','stdCostUnit','realCostUnit']
};