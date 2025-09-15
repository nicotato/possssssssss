export const recipeSchema = {
  title:'recipe schema',
  version:0,
  primaryKey:'id',
  type:'object',
  properties:{
    id:{type:'string'},               // productId
    productId:{type:'string'},
    components:{
      type:'array',
      items:{
        type:'object',
        properties:{
          ingredientId:{type:'string'},
          qty:{type:'number'}         // en unidad del ingrediente
        },
        required:['ingredientId','qty']
      }
    },
    yield:{type:'number'},            // rendimiento (por unidad de producto final)
    lastCostCalc:{type:'number'},     // costo estándar calculado
    updatedAt:{type:'string', format:'date-time'}
  },
  required:['id','productId','components','yield']
};