import jsonLogic from './vendor/jsonlogic-lite.js'; // Puedes crear un minimalista o usar import dinámico

export class PromotionRuleEngine {
  constructor() {}

  evaluate(promo, context) {
    // context: { lines:[...], categoryTotals:{}, cartTotal, appliedPromos:[], ... }
    // JSONLogic
    let events = [];
    if (promo.logic) {
      const result = jsonLogic.apply(promo.logic, context);
      if (result) {
        events = events.concat(this._normalizeLogicResult(result, promo));
      }
    }
    // DSL
    if (promo.dsl) {
      try {
        const ast = this._parseDSL(promo.dsl);
        const dslEvents = this._execDSL(ast, context, promo);
        events = events.concat(dslEvents);
      } catch(e) {
        console.warn('Error DSL promo', promo.id, e);
      }
    }
    return events;
  }

  _normalizeLogicResult(result, promo) {
    // result puede ser:
    // { discountPercentCart: 10 } o array de objetos
    const arr = Array.isArray(result) ? result : [result];
    return arr.map(r => ({
      promoId: promo.id,
      type: Object.keys(r)[0], // simplificado
      payload: r,
      description: promo.name
    }));
  }

  _parseDSL(dslText) {
    // STUB: retornar tokens simples. Implementar parser real según gramática
    return [{ type:'RULE', raw: dslText }];
  }

  _execDSL(ast, context, promo) {
    // STUB: no hace nada aun
    return [];
  }
}