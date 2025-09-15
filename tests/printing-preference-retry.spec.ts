import { describe, it, expect, vi } from 'vitest';
import { PrintingService } from '../src/application/services/printing-service.ts';

const order = { id:'R1', createdAt:new Date().toISOString(), status:'NEW', lines:[], discounts:[], payments:[], total:0 } as any;

describe('PrintingService preference & retry', () => {
  it('falls back to window when escpos fails and mode auto', async () => {
    let attempts = 0;
    const escpos = {
      printOrder: vi.fn().mockImplementation(()=> { attempts++; throw new Error('fail'); }),
      printKitchen: vi.fn().mockResolvedValue(undefined)
    } as any;
    const ps = new PrintingService({ escpos, fallbackWindow:true });
    // override windowInvoice to track fallback
    let fallbackUsed = false;
    // @ts-ignore override private for test
    ps.windowInvoice = ()=> { fallbackUsed = true; };
    ps.printInvoice(order);
  // retries: 250 + 500 + 1000 = 1750ms plus scheduling overhead
  await new Promise(r=> setTimeout(r, 1900));
    expect(attempts).toBeGreaterThan(1);
    expect(fallbackUsed).toBe(true);
  });

  it('respects preferredMode window (will not use escpos)', async () => {
    const escpos = { printOrder: vi.fn(), printKitchen: vi.fn() } as any;
    const ps = new PrintingService({ escpos, fallbackWindow:true });
    ps.setPreferredMode('window');
    ps.printInvoice(order);
    await new Promise(r=> setTimeout(r, 100));
    expect(escpos.printOrder).not.toHaveBeenCalled();
  });
});
