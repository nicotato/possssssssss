/// <reference lib="webworker" />
// Build con: esbuild/tsc separado o bundler.
// Mensaje de entrada: { type:'SIMULATE_BATCH', scenarios:[ { id, params } ] }

import { PromotionSimulationService } from '../application/services/promotion-simulation-service.js';
import { promotionServiceFactory, pricingServiceFactory, taxServiceFactory,
  tipServiceFactory, costCompServiceFactory, currencyServiceFactory } from './worker-factories.js';

// Factorías livianas (mock / reales según bundle)
const promotionService = promotionServiceFactory();
const pricingService = pricingServiceFactory();
const taxService = taxServiceFactory();
const tipService = tipServiceFactory();
const costService = costCompServiceFactory();
const currencyService = currencyServiceFactory();

const simService = new PromotionSimulationService(
  promotionService, pricingService, taxService, tipService, costService, currencyService
);

self.onmessage = async (ev: MessageEvent) => {
  const data = ev.data;
  if (data?.type === 'SIMULATE_BATCH') {
    const results = [];
    for (const sc of data.scenarios) {
      try {
        const r = await simService.simulate(sc.params);
        results.push({ id: sc.id, ok:true, result: r });
      } catch(e) {
        results.push({ id: sc.id, ok:false, error: String(e) });
      }
    }
    (self as any).postMessage({ type:'SIM_BATCH_RESULT', results });
  }
};