import { describe, it, expect, vi } from 'vitest';
import { OrderService } from '../src/application/services/order-service.ts';
import { PriceExperimentService } from '../src/application/services/price-experiment-service.ts';
import { PromotionSimulationService } from '../src/application/services/promotion-simulation-service.ts';
import { CostVarianceReportService } from '../src/application/services/cost-variance-report-service.ts';
import { PriceHistoryService } from '../src/application/services/price-history-service.ts';

// Simple stub helpers
function makeRepo(initial:any[] = []){
  const arr = [...initial];
  return {
    create: async (doc:any)=> { const id = doc.id || ('id_'+(arr.length+1)); const full = { ...doc, id }; arr.push(full); return full; },
    recent: async (limit:number)=> arr.slice(-limit),
    col: { find: ()=> ({ exec: async ()=> arr.map(d=> ({ toJSON:()=>d })) }), findOne: (id:string)=> ({ exec: async ()=> { const found = arr.find(d=>d.id===id); return found ? { incrementalPatch: async(p:any)=> Object.assign(found,p) } : null; } }) },
  } as any;
}

function makeOrderRepo(){
  const docs:any[] = [];
  return {
    create: async (doc:any)=> { docs.push(doc); return doc; },
    col: { findOne: (id:string)=> ({ exec: async ()=> docs.find(d=>d.id===id) ? { incrementalPatch: async(p:any)=> Object.assign(docs.find(d=>d.id===id), p) } : null }) }
  };
}

function makeCart(lines:any[]){
  return {
    isEmpty: ()=> lines.length===0,
    toArray: ()=> lines,
    clear: ()=> { lines.length=0; }
  };
}

function makePricing(){
  return {
    calculate: (lines:any, discounts:any)=> ({ subTotal: lines.reduce((a:number,l:any)=>a+l.unitPrice*l.qty,0), discountTotal:0, grandTotal: lines.reduce((a:number,l:any)=>a+l.unitPrice*l.qty,0), appliedDiscounts:[] }),
    evaluatePaymentStatus: (total:number, payments:any[])=> ({ amountPaid: total, changeDue:0, paymentStatus:'paid' })
  };
}

const audit = { log: async()=>{} };
const auth = { getUsername: ()=> 'tester' };
const queue = { enqueue: async()=>{} };

// Stubs for simulation pipeline
const promotionService = { applyPromotions: async (lines:any)=> ({ lines, promotionDiscountTotal:0, appliedPromotions:[] }) };
const pricingService = makePricing();
const taxService = { calculate: async ()=> ({ taxLines:[], totalTax:0 }) };
const tipService = { computeTip: ()=> ({ tipAmount:0 }) };
const costComputationService = { computeCostsForLine: async ()=> ({ stdUnit:1, realUnit:1.2, varianceUnit:0.2 }) };
const currencyService = { getRate: async ()=> 1 };
const simulationRunService = { persistSimulation: async ()=>{} };

const varianceRepo = { col:{ find: ()=> ({ exec: async ()=> [{ toJSON:()=> ({ createdAt:'2024-01-01T00:00:00.000Z', totalVariance:5, productId:'p1' }) }] }) } };
const productRepo = { findById: async ()=> ({ toJSON: ()=> ({ name:'Prod1' }) }) };
const priceHistoryRepo = { add: async (e:any)=> e, currentPrice: async ()=> ({ price: 123, currency:'USD' }) };

describe('Services smoke', () => {
  it('OrderService finalizeSale crea orden', async () => {
    const orderSvc = new OrderService(makeOrderRepo(), makeCart([{ productId:'p1', unitPrice:10, qty:2 }]), audit, auth, queue, makePricing());
    const order = await orderSvc.finalizeSale({ customerData:null, discounts:[], payments:[{ method:'cash', amount:20 }] } as any);
    expect(order.total).toBe(20);
  });

  it('PriceExperimentService record y listRecent', async () => {
    const repo:any = { create: async (d:any)=> ({ ...d, id:'exp1' }), recent: async (n:number)=> [{ id:'exp1' }] };
    const svc = new PriceExperimentService(repo, auth, audit);
    const created = await svc.recordExperiment({ productId:'p1', base:{ price:10 }, scenarios:[] });
    expect(created.id).toBe('exp1');
    const recent = await svc.listRecent(10);
    expect(recent.length).toBeGreaterThan(0);
  });

  it('PromotionSimulationService simulate pipeline', async () => {
    const sim = new PromotionSimulationService(promotionService, pricingService, taxService, tipService, costComputationService, currencyService, simulationRunService);
    const out = await sim.simulate({ lines:[{ productId:'p1', unitPrice:10, qty:2 }], branchId:'b1', discounts:[], tipConfig:null, currency:'BASE', persist:true });
    expect(out.grandTotalBase).toBeDefined();
  });

  it('CostVarianceReportService summary', async () => {
    const svc = new CostVarianceReportService(varianceRepo, productRepo);
    const rep = await svc.summary('2024-01-01T00:00:00.000Z','2024-12-31T23:59:59.999Z');
    expect(rep.count).toBeGreaterThanOrEqual(1);
  });

  it('PriceHistoryService setPrice y resolvePrice', async () => {
    const svc = new PriceHistoryService(priceHistoryRepo);
    const set = await svc.setPrice('p1','USD',99,'manual','note');
    expect(set.price).toBe(99);
    const current = await svc.resolvePrice('p1','USD');
    expect(current.price).toBe(123);
  });
});
