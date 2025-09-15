import { describe, it, expect } from 'vitest';

// Simple smoke to ensure calling optional printers does not throw when undefined.

describe('printing adapters smoke', () => {
  it('should allow optional chaining without throwing', () => {
    const services: any = { printer: undefined, kitchenPrinter: undefined };
    expect(() => {
      services.printer?.openInvoice({ id:'1', createdAt:new Date().toISOString(), status:'NEW', lines:[], discounts:[], payments:[], total:0 }, ()=>{});
      services.kitchenPrinter?.openTicket({ id:'1', createdAt:new Date().toISOString(), status:'NEW', lines:[], discounts:[], payments:[], total:0 });
    }).not.toThrow();
  });
});
