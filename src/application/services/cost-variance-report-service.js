"use strict";
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
exports.CostVarianceReportService = void 0;
var CostVarianceReportService = /** @class */ (function () {
    function CostVarianceReportService(varianceRepo, productRepo) {
        this.varianceRepo = varianceRepo;
        this.productRepo = productRepo;
    }
    CostVarianceReportService.prototype.summary = function (fromIso, toIso) {
        return __awaiter(this, void 0, void 0, function () {
            var docs, rows, totalVariance, byProduct, enriched, _i, _a, _b, productId, variance, pDoc, name_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.varianceRepo.col.find().exec()];
                    case 1:
                        docs = _c.sent();
                        rows = docs.map(function (d) { return d.toJSON(); })
                            .filter(function (r) { return r.createdAt >= fromIso && r.createdAt <= toIso; });
                        totalVariance = rows.reduce(function (a, r) { return a + (r.totalVariance || 0); }, 0);
                        byProduct = new Map();
                        rows.forEach(function (r) {
                            byProduct.set(r.productId, (byProduct.get(r.productId) || 0) + r.totalVariance);
                        });
                        enriched = [];
                        _i = 0, _a = byProduct.entries();
                        _c.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        _b = _a[_i], productId = _b[0], variance = _b[1];
                        return [4 /*yield*/, this.productRepo.findById(productId)];
                    case 3:
                        pDoc = _c.sent();
                        name_1 = (pDoc === null || pDoc === void 0 ? void 0 : pDoc.toJSON) ? pDoc.toJSON().name : productId;
                        enriched.push({ productId: productId, name: name_1, variance: +variance.toFixed(2) });
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        enriched.sort(function (a, b) { return Math.abs(b.variance) - Math.abs(a.variance); });
                        return [2 /*return*/, {
                                count: rows.length,
                                totalVariance: +totalVariance.toFixed(2),
                                top: enriched.slice(0, 20)
                            }];
                }
            });
        });
    };
    return CostVarianceReportService;
}());
exports.CostVarianceReportService = CostVarianceReportService;
