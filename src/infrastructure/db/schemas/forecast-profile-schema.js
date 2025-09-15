export const forecastProfileSchema = {
  title:'forecast profile schema',
  version:0,
  primaryKey:'id',
  type:'object',
  properties:{
    id:{type:'string'},           // e.g. productId + '_default'
    productId:{type:'string'},
    // factor por día de la semana (0=Domingo ... 6=Sábado)
    weekdayFactors:{
      type:'array',
      items:{type:'number'},      // longitud 7
      minItems:7,
      maxItems:7
    },
    baseDailyAvg:{type:'number'}, // se recalcula a partir de histórico
    updatedAt:{type:'string', format:'date-time'}
  },
  required:['id','productId','weekdayFactors','baseDailyAvg']
};