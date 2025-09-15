export const recipeVariantSchema = {
  title:'recipe variant schema',
  version:0,
  primaryKey:'id',
  type:'object',
  properties:{
    id:{type:'string'},
    productId:{type:'string'},
    name:{type:'string'},
    reason:{type:'string'},
    activeFrom:{type:'string', format:'date-time'},
    activeTo:{type:'string', format:'date-time'},
    components:{
      type:'array',
      items:{
        type:'object',
        properties:{
          ingredientId:{type:'string'},
          qty:{type:'number'}  // misma unidad que ingrediente
        },
        required:['ingredientId','qty']
      }
    },
    yield:{type:'number'},
    active:{type:'boolean'},
    priority:{type:'number'} // mayor prioridad = se evalúa antes
  },
  required:['id','productId','components','yield']
};