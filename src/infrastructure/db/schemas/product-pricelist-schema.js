export const productPriceListSchema = {
  title:'product price list schema',
  version:0,
  primaryKey:'id',
  type:'object',
  properties:{
    id:{type:'string'},              // productId + '_' + currency
    productId:{type:'string'},
    currency:{type:'string'},        // "USD"
    price:{type:'number'},
    active:{type:'boolean'}
  },
  required:['id','productId','currency','price']
};