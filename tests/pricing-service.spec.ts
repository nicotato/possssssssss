import { describe, it, expect } from 'vitest';
import { PricingService } from '../src/application/services/pricing-service.js';

const ps = new PricingService();

describe('PricingService', () => {
  it('aplica descuentos percent y fixed en orden', () => {
    const lines = [ { lineTotal: 100 }, { lineTotal: 50 } ]; // subtotal 150
    const { subTotal, discountTotal, grandTotal, appliedDiscounts } = ps.calculate(lines, [
      { type:'PERCENT', value:10 }, // 10% de 150 = 15
      { type:'FIXED', value:20 } // luego 20 sobre 135
    ]);
    expect(subTotal).toBe(150);
    expect(appliedDiscounts[0].amount).toBe(15);
    expect(appliedDiscounts[1].amount).toBe(20);
    expect(discountTotal).toBe(35);
    expect(grandTotal).toBe(115);
  });

  it('calcula estado de pago parcial', () => {
    const status = ps.evaluatePaymentStatus(200, [ { method:'cash', amount:50 } ]);
    expect(status.paymentStatus).toBe('partial');
    expect(status.amountPaid).toBe(50);
    expect(status.changeDue).toBe(0);
  });

  it('calcula vuelto cuando pago excede total', () => {
    const status = ps.evaluatePaymentStatus(90, [ { method:'cash', amount:100 } ]);
    expect(status.paymentStatus).toBe('paid');
    expect(status.changeDue).toBe(10);
  });
});
