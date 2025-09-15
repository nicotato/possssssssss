export const promotionSchema = {
  title:'promotion schema',
  version:0,
  primaryKey:'id',
  type:'object',
  properties:{
    id:{type:'string'},
    name:{type:'string'},
    active:{type:'boolean'},
    priority:{type:'number'},
    type:{type:'string'},  // BUY_X_GET_Y, SECOND_DISCOUNT, COMBO_FIXED, PERCENT_CART
    config:{
      type:'object',
      properties:{
        buyQty:{type:'number'},
        getQty:{type:'number'},
        productId:{type:'string'},
        targetProductId:{type:'string'},
        percent:{type:'number'},
        comboProducts:{type:'array', items:{type:'string'}},
        comboPrice:{type:'number'},
        secondPercent:{type:'number'}
      },
      additionalProperties:true
    },
    appliesToBranchIds:{ type:'array', items:{type:'string'} },
    validFrom:{type:'string', format:'date-time'},
    validTo:{type:'string', format:'date-time'}
  },
  required:['id','name','type','active']
};