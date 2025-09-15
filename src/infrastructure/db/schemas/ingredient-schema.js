export const ingredientSchema = {
  title:'ingredient schema',
  version:0,
  primaryKey:'id',
  type:'object',
  properties:{
    id:{type:'string'},
    name:{type:'string'},
    unit:{type:'string'},            // "kg", "g", "L", "un"
    avgCost:{type:'number'},         // costo promedio en moneda base
    lastCost:{type:'number'},
    current:{type:'number'},         // stock actual
    minThreshold:{type:'number'},
    active:{type:'boolean'}
  },
  required:['id','name','unit']
};