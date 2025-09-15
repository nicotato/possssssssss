export const productStockSchema = {
  title: 'product stock schema',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id:{type:'string'},            // productId + '_' + branchId
    productId:{type:'string'},
    branchId:{type:'string'},
    current:{type:'number'},
    minThreshold:{type:'number'},  // alerta si current <= minThreshold
    avgCost:{type:'number'},       // costo promedio ponderado
    lastCost:{type:'number'}
  },
  required:['id','productId','branchId','current']
};