import { describe, it, expect } from 'vitest';
import { PrintingService } from '../src/application/services/printing-service.ts';

const makeOrder = (id='o1') => ({ id, createdAt:new Date().toISOString(), status:'NEW', lines:[], discounts:[], payments:[], total:0 });

describe('PrintingService cancellation & metrics', () => {
  it('cancelJob removes a queued job', async () => {
    const ps = new PrintingService({ fallbackWindow:false });
    const id1 = ps.printInvoice(makeOrder('J1'));
    const id2 = ps.printInvoice(makeOrder('J2'));
    const cancelled = ps.cancelJob(id2);
    expect(cancelled).toBe(true);
    await new Promise(r=> setTimeout(r,60));
    const m = ps.getMetrics();
    expect(m.jobsProcessed).toBe(1);
  });

  it('cancelAll clears queue and batch buffer', async () => {
    const ps = new PrintingService({ fallbackWindow:false });
    ps.printInvoice(makeOrder('A'));
    ps.printInvoice(makeOrder('B'));
    const count = ps.cancelAll();
    expect(count).toBeGreaterThan(0);
    await new Promise(r=> setTimeout(r,60));
    const m = ps.getMetrics();
  // Depending on timing, first job may have started; ensure queue cleared (no further increments)
  expect(m.jobsProcessed).toBeLessThanOrEqual(1);
  });

  it('metrics increment for escpos batches', async () => {
    const orderCalls: string[] = [];
    const escpos = { printOrder: (o:any)=> orderCalls.push(o.id), printKitchen: (o:any)=> {} } as any;
    const ps = new PrintingService({ escpos });
    ps.printInvoice(makeOrder('X1'));
    ps.printInvoice(makeOrder('X2'));
    await new Promise(r=> setTimeout(r,140));
    const m = ps.getMetrics();
    // two jobs processed
    expect(m.jobsProcessed).toBe(2);
    // at least one batch
    expect(m.batchCount).toBeGreaterThanOrEqual(1);
  });
});
