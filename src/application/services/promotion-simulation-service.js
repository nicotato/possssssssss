"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionSimulationService = void 0;
// (Versión extendida: añade persist optional)
var PromotionSimulationService = /** @class */ (function () {
    function PromotionSimulationService(promotionService, pricingService, taxService, tipService, costComputationService, currencyService, simulationRunService // opcional
    ) {
        this.promotionService = promotionService;
        this.pricingService = pricingService;
        this.taxService = taxService;
        this.tipService = tipService;
        this.costComputationService = costComputationService;
        this.currencyService = currencyService;
        this.simulationRunService = simulationRunService;
    }
    PromotionSimulationService.prototype.simulate = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var out;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._doPipeline(params)];
                    case 1:
                        out = _a.sent();
                        if (!(params.persist && this.simulationRunService)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.simulationRunService.persistSimulation(params, out, params.tags || [])];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, out];
                }
            });
        });
    };
    PromotionSimulationService.prototype._doPipeline = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var now, lines, netBeforePromotions, _i, lines_1, line, cost, promoResult, afterPromoLines, netAfterPromotions, promotionDiscountTotal, _a, subTotal, discountTotal, appliedDiscounts, netAfterDiscount, taxResult, tipAmount, grandTotalBase, currency, fxRate, grandTotalTx, costStdTotalBase, costRealTotalBase, costVarianceBase;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        now = new Date().toISOString();
                        lines = params.lines.map(function (l) { return (__assign(__assign({}, l), { lineTotal: +(l.unitPrice * l.qty).toFixed(2) })); });
                        netBeforePromotions = lines.reduce(function (a, l) { return a + l.lineTotal; }, 0);
                        _i = 0, lines_1 = lines;
                        _b.label = 1;
                    case 1:
                        if (!(_i < lines_1.length)) return [3 /*break*/, 4];
                        line = lines_1[_i];
                        return [4 /*yield*/, this.costComputationService.computeCostsForLine(line.productId, line.qty)];
                    case 2:
                        cost = _b.sent();
                        line.stdUnitCost = cost.stdUnit;
                        line.realUnitCost = cost.realUnit;
                        line.varianceUnit = cost.varianceUnit;
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [4 /*yield*/, this.promotionService.applyPromotions(lines, params.branchId)];
                    case 5:
                        promoResult = _b.sent();
                        afterPromoLines = promoResult.lines;
                        netAfterPromotions = afterPromoLines.reduce(function (a, l) { return a + l.lineTotal; }, 0);
                        promotionDiscountTotal = promoResult.promotionDiscountTotal;
                        _a = this.pricingService.calculate(afterPromoLines, params.discounts || []), subTotal = _a.subTotal, discountTotal = _a.discountTotal, appliedDiscounts = _a.appliedDiscounts;
                        netAfterDiscount = subTotal;
                        return [4 /*yield*/, this.taxService.calculate(afterPromoLines)];
                    case 6:
                        taxResult = _b.sent();
                        tipAmount = this.tipService.computeTip(netAfterDiscount, params.tipConfig).tipAmount;
                        grandTotalBase = +(netAfterDiscount + taxResult.totalTax + tipAmount).toFixed(2);
                        currency = params.currency || 'BASE';
                        fxRate = 1;
                        grandTotalTx = grandTotalBase;
                        if (!(currency !== 'BASE')) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.currencyService.getRate(currency)];
                    case 7:
                        fxRate = _b.sent();
                        grandTotalTx = +(grandTotalBase * fxRate).toFixed(2);
                        _b.label = 8;
                    case 8:
                        costStdTotalBase = afterPromoLines.reduce(function (a, l) { return a + (l.stdUnitCost || 0) * l.qty; }, 0);
                        costRealTotalBase = afterPromoLines.reduce(function (a, l) { return a + (l.realUnitCost || 0) * l.qty; }, 0);
                        costVarianceBase = +(costRealTotalBase - costStdTotalBase).toFixed(2);
                        return [2 /*return*/, {
                                timestamp: now,
                                currency: currency,
                                fxRate: fxRate,
                                lines: afterPromoLines,
                                netBeforePromotions: netBeforePromotions,
                                netAfterPromotions: netAfterPromotions,
                                promotionDiscountTotal: promotionDiscountTotal,
                                discountsApplied: appliedDiscounts,
                                discountTotal: discountTotal,
                                subTotal: subTotal,
                                taxLines: taxResult.taxLines,
                                taxTotal: taxResult.totalTax,
                                tipAmount: tipAmount,
                                grandTotalBase: grandTotalBase,
                                grandTotalTx: grandTotalTx,
                                costStdTotalBase: +costStdTotalBase.toFixed(2),
                                costRealTotalBase: +costRealTotalBase.toFixed(2),
                                costVarianceBase: costVarianceBase,
                                appliedPromotions: promoResult.appliedPromotions
                            }];
                }
            });
        });
    };
    return PromotionSimulationService;
}());
exports.PromotionSimulationService = PromotionSimulationService;
