export const branchSchema = {
  title: 'branch schema',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id:{type:'string'},
    code:{type:'string'},      // ej: MVD-CENTRO
    name:{type:'string'},
    address:{type:'string'},
    active:{type:'boolean'}
  },
  required:['id','code','name']
};