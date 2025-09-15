"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionRuleEngine = void 0;
var ast_builder_1 = require("../../domain/promotions/dsl/ast-builder");
var ast_cache_1 = require("../../domain/promotions/dsl/ast-cache");
var PromotionRuleEngine = /** @class */ (function () {
    function PromotionRuleEngine(jsonLogic, astCache) {
        if (astCache === void 0) { astCache = new ast_cache_1.DslAstCache(); }
        this.jsonLogic = jsonLogic;
        this.astCache = astCache;
    }
    PromotionRuleEngine.prototype.evaluate = function (promo, context) {
        var events = [];
        // JSONLogic
        if (promo.logic && this.jsonLogic) {
            try {
                var res = this.jsonLogic.apply(promo.logic, context);
                if (res)
                    events = events.concat(this._normalizeLogicResult(res, promo));
            }
            catch (e) {
                // log soft
            }
        }
        // DSL con cache
        if (promo.dsl) {
            var key = (0, ast_cache_1.fastHash)(promo.id + ':' + promo.dsl);
            var ast = this.astCache.get(key);
            if (!ast) {
                try {
                    ast = (0, ast_builder_1.parsePromoDsl)(promo.dsl);
                    this.astCache.set(key, ast);
                }
                catch (e) {
                    // fallo de parseo, no detiene ejecución total
                    ast = null;
                }
            }
            if (ast) {
                var dslEvents = this._execDslAst(ast, context, promo);
                events = events.concat(dslEvents);
            }
        }
        return events;
    };
    PromotionRuleEngine.prototype._normalizeLogicResult = function (result, promo) {
        var arr = Array.isArray(result) ? result : [result];
        return arr.map(function (r) { return ({
            promoId: promo.id,
            type: Object.keys(r)[0],
            payload: r,
            description: promo.name
        }); });
    };
    PromotionRuleEngine.prototype._execDslAst = function (ast, context, promo) {
        var out = [];
        for (var _i = 0, _a = ast.rules; _i < _a.length; _i++) {
            var rule = _a[_i];
            if (this._conditionPass(rule.condition, context)) {
                var ev = this._actionToEvent(rule.action, promo, rule.label);
                if (ev)
                    out.push(ev);
            }
        }
        return out;
    };
    PromotionRuleEngine.prototype._conditionPass = function (cond, ctx) {
        if (cond.type === 'categoryMetric') {
            var ct = ctx.categoryTotals || {};
            var current = cond.metric === 'amount'
                ? (ct[cond.category] || 0)
                : 0;
            return compareOp(current, cond.op, cond.value);
        }
        if (cond.type === 'cartMetric') {
            var cartTotal = ctx.lines.reduce(function (a, l) { return a + l.lineTotal; }, 0);
            if (cond.metric === 'total')
                return compareOp(cartTotal, cond.op, cond.value);
            return false;
        }
        return false;
    };
    PromotionRuleEngine.prototype._actionToEvent = function (action, promo, label) {
        if (!action)
            return null;
        switch (action.type) {
            case 'discountPercentCart':
                return {
                    promoId: promo.id,
                    type: 'discountPercentCart',
                    payload: { discountPercentCart: action.percent, label: label }
                };
            case 'discountFixedCart':
                return {
                    promoId: promo.id,
                    type: 'discountFixedCart',
                    payload: { discountFixedCart: action.amount, label: label }
                };
            case 'buyXGetY':
                return {
                    promoId: promo.id,
                    type: 'buyXGetY',
                    payload: action
                };
            default:
                return null;
        }
    };
    return PromotionRuleEngine;
}());
exports.PromotionRuleEngine = PromotionRuleEngine;
function compareOp(a, op, b) {
    switch (op) {
        case '>': return a > b;
        case '>=': return a >= b;
        case '<': return a < b;
        case '<=': return a <= b;
        case '==': return a === b;
        case '!=': return a !== b;
        default: return false;
    }
}
