// Servicio para aplicar descuentos y calcular totales
export class PricingService {
  calculate(lines, discounts = []) {
    const subTotal = lines.reduce((a, l) => a + l.lineTotal, 0);
    let running = subTotal;
    const applied = [];
    discounts.forEach(d => {
      let amount = 0;
      if (d.type === 'PERCENT') {
        amount = +(running * (d.value / 100)).toFixed(2);
      } else if (d.type === 'FIXED') {
        amount = Math.min(running, d.value);
      }
      running -= amount;
      applied.push({
        type: d.type,
        value: d.value,
        label: d.label || (d.type === 'PERCENT' ? `${d.value}%` : `$${d.value}`),
        amount
      });
    });
    const discountTotal = applied.reduce((a, d) => a + d.amount, 0);
    const grandTotal = +(subTotal - discountTotal).toFixed(2);
    return { subTotal, discountTotal, grandTotal, appliedDiscounts: applied };
  }

  evaluatePaymentStatus(grandTotal, payments) {
    const amountPaid = payments.reduce((a, p) => a + p.amount, 0);
    const changeDue = +(amountPaid - grandTotal).toFixed(2);
    const paymentStatus =
      amountPaid === 0 ? 'unpaid' :
      amountPaid + 0.0001 < grandTotal ? 'partial' : 'paid';
    return { amountPaid, changeDue: changeDue > 0 ? changeDue : 0, paymentStatus };
  }
}