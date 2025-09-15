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
exports.initDatabaseV7 = initDatabaseV7;
var rxdb_1 = require("rxdb");
var storage_dexie_1 = require("rxdb/plugins/storage-dexie");
var migration_schema_1 = require("rxdb/plugins/migration-schema");
var update_1 = require("rxdb/plugins/update");
var query_builder_1 = require("rxdb/plugins/query-builder");
// Schemas (importa todos)
var order_schema_ts_1 = require("./schemas/order.schema.ts");
var promotion_schema_ts_1 = require("./schemas/promotion.schema.ts");
var product_schema_ts_1 = require("./schemas/product.schema.ts");
var customer_schema_ts_1 = require("./schemas/customer.schema.ts");
var user_schema_ts_1 = require("./schemas/user.schema.ts");
var role_schema_ts_1 = require("./schemas/role.schema.ts");
var audit_log_schema_ts_1 = require("./schemas/audit-log.schema.ts");
var sync_queue_schema_ts_1 = require("./schemas/sync-queue.schema.ts");
var sync_queue_migrations_ts_1 = require("./migrations/sync-queue.migrations.ts");
var ingredient_schema_ts_1 = require("./schemas/ingredient.schema.ts");
var recipe_schema_ts_1 = require("./schemas/recipe.schema.ts");
var recipe_variant_schema_ts_1 = require("./schemas/recipe-variant.schema.ts");
var stock_movement_schema_ts_1 = require("./schemas/stock-movement.schema.ts");
var currency_price_history_schema_ts_1 = require("./schemas/currency-price-history.schema.ts");
var simulation_run_schema_ts_1 = require("./schemas/simulation-run.schema.ts");
var price_experiment_schema_ts_1 = require("./schemas/price-experiment.schema.ts");
// Migration strategies existentes
var order_migrations_ts_1 = require("./migrations/order.migrations.ts");
var promotion_migrations_ts_1 = require("./migrations/promotion.migrations.ts");
(0, rxdb_1.addRxPlugin)(migration_schema_1.RxDBMigrationSchemaPlugin);
(0, rxdb_1.addRxPlugin)(update_1.RxDBUpdatePlugin);
(0, rxdb_1.addRxPlugin)(query_builder_1.RxDBQueryBuilderPlugin);
function initDatabaseV7() {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, rxdb_1.createRxDatabase)({
                        name: 'pos_pizzeria_v7',
                        storage: (0, storage_dexie_1.getRxStorageDexie)()
                    })];
                case 1:
                    db = _a.sent();
                    return [4 /*yield*/, db.addCollections({
                            // Comerciales
                            products: { schema: product_schema_ts_1.productSchema },
                            customers: { schema: customer_schema_ts_1.customerSchema },
                            orders: {
                                schema: order_schema_ts_1.orderSchema,
                                migrationStrategies: order_migrations_ts_1.orderMigrationStrategies
                            },
                            promotions: {
                                schema: promotion_schema_ts_1.promotionSchema,
                                migrationStrategies: promotion_migrations_ts_1.promotionMigrationStrategies
                            },
                            // Seguridad / Usuarios
                            users: { schema: user_schema_ts_1.userSchema },
                            roles: { schema: role_schema_ts_1.roleSchema },
                            // Auditoría y sincronización
                            audit_logs: { schema: audit_log_schema_ts_1.auditLogSchema },
                            sync_queue: { schema: sync_queue_schema_ts_1.syncQueueSchema, migrationStrategies: sync_queue_migrations_ts_1.syncQueueMigrationStrategies },
                            // Inventario / Costos
                            ingredients: { schema: ingredient_schema_ts_1.ingredientSchema },
                            recipes: { schema: recipe_schema_ts_1.recipeSchema },
                            recipe_variants: { schema: recipe_variant_schema_ts_1.recipeVariantSchema },
                            stock_movements: { schema: stock_movement_schema_ts_1.stockMovementSchema },
                            // Multi-moneda / Precios históricos
                            product_price_history: { schema: currency_price_history_schema_ts_1.productPriceHistorySchema },
                            // Simulaciones / Experimentos
                            simulation_runs: { schema: simulation_run_schema_ts_1.simulationRunSchema },
                            price_experiments: { schema: price_experiment_schema_ts_1.priceExperimentSchema }
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, db];
            }
        });
    });
}
