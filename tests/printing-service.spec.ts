import { describe, it, expect, vi } from 'vitest';
import { PrintingService } from '../src/application/services/printing-service.ts';

const makeOrder = (id='o1') => ({ id, createdAt:new Date().toISOString(), status:'NEW', lines:[], discounts:[], payments:[], total:0 });

describe('PrintingService queue', () => {
  it('processes invoice then kitchen when both requested without escpos', async () => {
    const invCalls: string[] = [];
    const kitCalls: string[] = [];
    const invoice = { openInvoice: (o:any, cb?:()=>void)=> { invCalls.push(o.id); cb?.(); } } as any;
    const kitchen = { openTicket: (o:any)=> { kitCalls.push(o.id); } } as any;
    const ps = new PrintingService({ invoice, kitchen, fallbackWindow:false });
    ps.printBoth(makeOrder('A'));
    ps.printInvoice(makeOrder('B'));
    await new Promise(r=> setTimeout(r,50));
    expect(invCalls).toEqual(['A','B']);
    expect(kitCalls).toEqual(['A']);
  });

  it('uses escpos printer when provided', async () => {
    const orderCalls: string[] = [];
    const kitchenCalls: string[] = [];
    const escpos = { printOrder: (o:any)=> orderCalls.push(o.id), printKitchen:(o:any)=> kitchenCalls.push(o.id) } as any;
    const ps = new PrintingService({ escpos });
    ps.printBoth(makeOrder('X'));
  // allow batch window (50ms) + processing loop
  await new Promise(r=> setTimeout(r,120));
    expect(orderCalls).toEqual(['X']);
    expect(kitchenCalls).toEqual(['X']);
  });
});
