import { describe, it, expect } from 'vitest';
import { PrintingService } from '../src/application/services/printing-service.ts';

function makeOrder(id:string){ return { id, createdAt:new Date().toISOString(), lines:[{ qty:1, name:'Pizza', lineTotal:1000, productId:'p1', unitPrice:1000 }], total:1000, status:'OPEN', discounts:[], payments:[] }; }

// Minimal invoice adapter capturing opens
class InvoiceAdapter { opens:number=0; openInvoice(order:any, cb?:()=>void){ this.opens++; cb&&cb(); } }

// Fake escpos that never gets used in window mode test
class EscPosAdapter { printed:number=0; async printOrder(){ this.printed++; } async printKitchen(){ this.printed++; } }

describe('PrintingService edge', () => {
  it('cancelJob evita impresión si se cancela antes de procesar', async () => {
    const invoice = new InvoiceAdapter();
    const svc = new PrintingService({ invoice });
    const id = svc.printInvoice(makeOrder('o1'));
    // cancel immediately in same tick
    const cancelled = svc.cancelJob(id);
    // Depending on event loop, run() may have started but not shifted queue yet; allow a tiny delay then assert
    await new Promise(r=> setTimeout(r, 5));
    if(cancelled) {
      expect(invoice.opens).toBe(0);
      expect(svc.getMetrics().jobsProcessed).toBe(0);
    } else {
      // Job already taken by runner; then it must have printed exactly once
      await new Promise(r=> setTimeout(r, 30));
      expect(invoice.opens).toBe(1);
    }
  });

  it('cancelAll elimina todos los trabajos pendientes y buffer batch', async () => {
    const invoice = new InvoiceAdapter();
    const svc = new PrintingService({ invoice });
    const a = svc.printInvoice(makeOrder('a'));
    const b = svc.printInvoice(makeOrder('b'));
    const removed = svc.cancelAll();
    // If run loop already drained one, removed could be 1; assert bounds
    expect(removed).toBeGreaterThanOrEqual(1);
    await new Promise(r=> setTimeout(r, 25));
    if(removed>=2) {
      expect(invoice.opens).toBe(0);
      expect(svc.getMetrics().jobsProcessed).toBe(0);
    } else {
      // one printed before cancellation; second prevented
      expect(invoice.opens).toBe(1);
    }
  });
});
