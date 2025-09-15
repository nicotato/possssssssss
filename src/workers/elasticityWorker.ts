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

self.onmessage = (ev: MessageEvent) => {
  const data = ev.data;
  if (data?.type === 'ELASTICITY_BATCH') {
    const { productId, base, scenarios } = data;
    const { price: P0, quantity: Q0, elasticity: E } = base;
  const results = scenarios.map((s:any) => {
      const P = s.price;
      const pctChange = (P - P0) / P0;
      const estQuantity = Math.max(0, Q0 * (1 + E * pctChange));
      const estRevenue = P * estQuantity;
      return {
        id: s.id,
        price: P,
        estQuantity: +estQuantity.toFixed(2),
        estRevenue: +estRevenue.toFixed(2)
      };
    });
    (self as any).postMessage({
      type:'ELASTICITY_RESULT',
      productId,
      results
    });
  }
};