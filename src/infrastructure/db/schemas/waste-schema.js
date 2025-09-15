export const wasteSchema = {
  title:'waste schema',
  version:0,
  primaryKey:'id',
  type:'object',
  properties:{
    id:{type:'string'},
    ingredientId:{type:'string'},
    qty:{type:'number'}, // negativo conceptual, se guarda positivo y se deduce
    reason:{type:'string'},
    timestamp:{type:'string', format:'date-time'},
    branchId:{type:'string'},
    reportedBy:{type:'string'}
  },
  required:['id','ingredientId','qty','timestamp']
};