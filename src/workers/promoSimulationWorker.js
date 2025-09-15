"use strict";
/// <reference lib="webworker" />
// Build con: esbuild/tsc separado o bundler.
// Mensaje de entrada: { type:'SIMULATE_BATCH', scenarios:[ { id, params } ] }
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
var promotion_simulation_service_1 = require("../application/services/promotion-simulation-service");
var worker_factories_1 = require("./worker-factories");
// Factorías livianas (mock / reales según bundle)
var promotionService = (0, worker_factories_1.promotionServiceFactory)();
var pricingService = (0, worker_factories_1.pricingServiceFactory)();
var taxService = (0, worker_factories_1.taxServiceFactory)();
var tipService = (0, worker_factories_1.tipServiceFactory)();
var costService = (0, worker_factories_1.costCompServiceFactory)();
var currencyService = (0, worker_factories_1.currencyServiceFactory)();
var simService = new promotion_simulation_service_1.PromotionSimulationService(promotionService, pricingService, taxService, tipService, costService, currencyService);
self.onmessage = function (ev) { return __awaiter(void 0, void 0, void 0, function () {
    var data, results, _i, _a, sc, r, e_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                data = ev.data;
                if (!((data === null || data === void 0 ? void 0 : data.type) === 'SIMULATE_BATCH')) return [3 /*break*/, 7];
                results = [];
                _i = 0, _a = data.scenarios;
                _b.label = 1;
            case 1:
                if (!(_i < _a.length)) return [3 /*break*/, 6];
                sc = _a[_i];
                _b.label = 2;
            case 2:
                _b.trys.push([2, 4, , 5]);
                return [4 /*yield*/, simService.simulate(sc.params)];
            case 3:
                r = _b.sent();
                results.push({ id: sc.id, ok: true, result: r });
                return [3 /*break*/, 5];
            case 4:
                e_1 = _b.sent();
                results.push({ id: sc.id, ok: false, error: String(e_1) });
                return [3 /*break*/, 5];
            case 5:
                _i++;
                return [3 /*break*/, 1];
            case 6:
                self.postMessage({ type: 'SIM_BATCH_RESULT', results: results });
                _b.label = 7;
            case 7: return [2 /*return*/];
        }
    });
}); };
