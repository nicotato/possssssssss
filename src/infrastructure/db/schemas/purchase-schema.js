export const purchaseSchema = {
  title:'purchase schema',
  version:0,
  primaryKey:'id',
  type:'object',
  properties:{
    id:{type:'string'},
    supplierId:{type:'string'},
    date:{type:'string', format:'date-time'},
    items:{
      type:'array',
      items:{
        type:'object',
        properties:{
          productId:{type:'string'},
          name:{type:'string'},
          qty:{type:'number'},
          unitCost:{type:'number'},
          lineCost:{type:'number'}
        },
        required:['productId','qty','unitCost','lineCost']
      }
    },
    totalCost:{type:'number'},
    notes:{type:'string'}
  },
  required:['id','supplierId','date','items','totalCost']
};