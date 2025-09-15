/// <reference lib="webworker" />
/**
 * Mensaje de entrada:
 * {
 *   type:'ELASTICITY_BATCH',
 *   productId:string,
 *   base: { price:number, quantity:number, elasticity:number },
 *   scenarios:[ { id:string, price:number } ]
 * }
 * Salida:
 * {
 *   type:'ELASTICITY_RESULT',
 *   productId,
 *   results:[ { id, price, estQuantity, estRevenue } ]
 * }
 */
self.onmessage = function (ev) {
    var data = ev.data;
    if ((data === null || data === void 0 ? void 0 : data.type) === 'ELASTICITY_BATCH') {
        var productId = data.productId, base = data.base, scenarios = data.scenarios;
        var P0_1 = base.price, Q0_1 = base.quantity, E_1 = base.elasticity;
        var results = scenarios.map(function (s) {
            var P = s.price;
            var pctChange = (P - P0_1) / P0_1;
            var estQuantity = Math.max(0, Q0_1 * (1 + E_1 * pctChange));
            var estRevenue = P * estQuantity;
            return {
                id: s.id,
                price: P,
                estQuantity: +estQuantity.toFixed(2),
                estRevenue: +estRevenue.toFixed(2)
            };
        });
        self.postMessage({
            type: 'ELASTICITY_RESULT',
            productId: productId,
            results: results
        });
    }
};
