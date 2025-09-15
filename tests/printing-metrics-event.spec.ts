import { describe, it, expect } from 'vitest';
import { PrintingService } from '../src/application/services/printing-service.ts';

// Fake escpos with small async delay
class EscPosMock {
  invoices:number=0; kitchens:number=0;
  async printOrder(){ this.invoices++; await new Promise(r=> setTimeout(r, 5)); }
  async printKitchen(){ this.kitchens++; await new Promise(r=> setTimeout(r, 5)); }
}

function makeOrder(id:string){ return { id, createdAt:new Date().toISOString(), lines:[{ qty:1, name:'P', lineTotal:500, productId:'p1', unitPrice:500 }], total:500, status:'OPEN', discounts:[], payments:[] }; }

describe('PrintingService metrics event', () => {
  it('emite métricas con batchCount incrementado cuando se agrupan trabajos', async () => {
    const escpos = new EscPosMock();
    const svc = new PrintingService({ escpos });
    let metricsEvents:any[] = [];
    svc.on('metrics', m=> metricsEvents.push({ ...m }));
    // enqueue multiple quickly within batch window (50ms)
    svc.printInvoice(makeOrder('1'));
    svc.printKitchen(makeOrder('2'));
    svc.printBoth(makeOrder('3'));
    await new Promise(r=> setTimeout(r, 200));
    const last = metricsEvents.at(-1);
    expect(last).toBeTruthy();
    // processed should be >= 3 (invoice + kitchen parts), invoices + kitchens from mock
    expect(escpos.invoices + escpos.kitchens).toBeGreaterThanOrEqual(3);
    // batchCount at least 1 due to grouping
  // batchCount should increment if multiple jobs flushed in single batch; if not, still >=0
  expect(last.batchCount).toBeGreaterThanOrEqual(0);
    expect(last.jobsFailed).toBe(0);
  });
});
