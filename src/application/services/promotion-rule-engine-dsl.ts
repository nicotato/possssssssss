import { DslAstCache, fastHash } from '../../domain/promotions/dsl/ast-cache.js';
import { defaultDslParser, DslParser } from '../../domain/promotions/dsl/parser-adapter.ts';

export class PromotionRuleEngine {
  constructor(
    private jsonLogic?: any,
    private astCache: DslAstCache = new DslAstCache(),
    private dslParser: DslParser = defaultDslParser
  ) {}

  evaluate(promo: any, context: any) {
    let events: any[] = [];
    // JSONLogic
    if (promo.logic && this.jsonLogic) {
      try {
        const res = this.jsonLogic.apply(promo.logic, context);
        if (res) events = events.concat(this._normalizeLogicResult(res, promo));
      } catch(e) {
        // log soft
      }
    }
    // DSL con cache
    if (promo.dsl) {
      const key = fastHash(promo.id + ':' + promo.dsl);
      let ast = this.astCache.get(key);
      if (!ast) {
        try {
          ast = this.dslParser.parse(promo.dsl);
          this.astCache.set(key, ast);
        } catch(e) {
          // fallo de parseo, no detiene ejecución total
          ast = null;
        }
      }
      if (ast) {
        const dslEvents = this._execDslAst(ast, context, promo);
        events = events.concat(dslEvents);
      }
    }
    return events;
  }

  _normalizeLogicResult(result:any, promo:any) {
    const arr = Array.isArray(result)? result : [result];
    return arr.map((r:any) => ({
      promoId: promo.id,
      type: Object.keys(r)[0],
      payload: r,
      description: promo.name
    }));
  }

  _execDslAst(ast:any, context:any, promo:any) {
    const out: any[] = [];
    for (const rule of ast.rules as any[]) {
      if (this._conditionPass(rule.condition, context)) {
        const ev = this._actionToEvent(rule.action, promo, rule.label);
        if(ev) out.push(ev);
      }
    }
    return out;
  }

  _conditionPass(cond:any, ctx:any) {
    if (cond.type === 'categoryMetric') {
      const ct = ctx.categoryTotals || {};
      const current = cond.metric === 'amount'
        ? (ct[cond.category] || 0)
        : 0;
      return compareOp(current, cond.op, cond.value);
    }
    if (cond.type === 'cartMetric') {
  const cartTotal = ctx.lines.reduce((a:number,l:any)=>a+l.lineTotal,0);
      if(cond.metric === 'total') return compareOp(cartTotal, cond.op, cond.value);
      return false;
    }
    return false;
  }

  _actionToEvent(action:any, promo:any, label?:string) {
    if(!action) return null;
    switch(action.type) {
      case 'discountPercentCart':
        return {
          promoId: promo.id,
          type:'discountPercentCart',
          payload:{ discountPercentCart: action.percent, label }
        };
      case 'discountFixedCart':
        return {
          promoId: promo.id,
          type:'discountFixedCart',
          payload:{ discountFixedCart: action.amount, label }
        };
      case 'buyXGetY':
        return {
          promoId: promo.id,
          type:'buyXGetY',
          payload: action
        };
      default:
        return null;
    }
  }
}

function compareOp(a:number, op:string, b:number) {
  switch(op) {
    case '>': return a > b;
    case '>=': return a >= b;
    case '<': return a < b;
    case '<=': return a <= b;
    case '==': return a === b;
    case '!=': return a !== b;
    default: return false;
  }
}