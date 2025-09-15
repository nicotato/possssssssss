export const taxSchema = {
  title: 'tax schema',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id:{type:'string'},
    code:{type:'string'},      // IVA10, IVA22, SERV, etc.
    name:{type:'string'},
    rate:{type:'number'},      // 0.1, 0.22
    scope:{type:'string'},     // line | global
    appliesToCategories:{ type:'array', items:{ type:'string' } },
    active:{type:'boolean'}
  },
  required:['id','code','rate','scope']
};