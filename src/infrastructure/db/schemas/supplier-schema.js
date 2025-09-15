export const supplierSchema = {
  title:'supplier schema',
  version:0,
  primaryKey:'id',
  type:'object',
  properties:{
    id:{type:'string'},
    name:{type:'string'},
    contact:{type:'string'},
    phone:{type:'string'},
    email:{type:'string'},
    active:{type:'boolean'}
  },
  required:['id','name']
};