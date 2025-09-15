// Evalúa promociones sobre líneas (antes de descuentos manuales)
export class PromotionService {
  constructor(promoRepo) {
    this.promoRepo = promoRepo;
  }

  async applyPromotions(lines, branchId) {
    const nowIso = new Date().toISOString();
    const promos = await this.promoRepo.active(branchId, nowIso);
    // Clonar líneas para no mutar original
    const cloned = lines.map(l => ({ ...l }));
    const applied = [];
    let promoDiscountTotal = 0;

    for(const promo of promos) {
      const result = this._applyPromotion(cloned, promo);
      if(result && result.discount > 0) {
        applied.push({
          promoId: promo.id,
          description: promo.name,
          discountAmount: result.discount
        });
        promoDiscountTotal += result.discount;
      }
    }

    return {
      lines: cloned,
      appliedPromotions: applied,
      promotionDiscountTotal: +promoDiscountTotal.toFixed(2)
    };
  }

  _applyPromotion(lines, promo) {
    switch(promo.type) {
      case 'BUY_X_GET_Y':
        return this._applyBuyXGetY(lines, promo);
      case 'SECOND_DISCOUNT':
        return this._applySecondDiscount(lines, promo);
      case 'COMBO_FIXED':
        return this._applyComboFixed(lines, promo);
      case 'PERCENT_CART':
        return this._applyPercentCart(lines, promo);
      default:
        return null;
    }
  }

  _findProductLines(lines, productId) {
    return lines.filter(l => l.productId === productId);
  }

  _applyBuyXGetY(lines, promo) {
    const { buyQty, getQty, productId } = promo.config || {};
    if(!buyQty || !getQty || !productId) return null;
    const productLines = this._findProductLines(lines, productId);
    if(!productLines.length) return null;
    const totalQty = productLines.reduce((a,l)=>a+l.qty,0);
    if(totalQty < buyQty + getQty) return null;

    // Cantidad de bloques
    const block = buyQty + getQty;
    const blocks = Math.floor(totalQty / block);
    if(blocks < 1) return null;

    // Descuento = getQty * unitPrice * blocks
    // Tomamos unitPrice promedio (asumimos igual)
    const unitPrice = productLines[0].unitPrice;
    const discount = +(getQty * unitPrice * blocks).toFixed(2);
    // Aplicamos descuento repartido en líneas (simple: primera línea)
    productLines[0].lineTotal -= discount;
    if(productLines[0].lineTotal < 0) productLines[0].lineTotal = 0;
    return { discount };
  }

  _applySecondDiscount(lines, promo) {
    const { productId, secondPercent } = promo.config || {};
    if(!productId || !secondPercent) return null;
    const productLines = this._findProductLines(lines, productId);
    const totalQty = productLines.reduce((a,l)=>a+l.qty,0);
    if(totalQty < 2) return null;
    // Descuento sobre 1 unidad (segunda) por blocks
    const blocks = Math.floor(totalQty / 2);
    const unitPrice = productLines[0].unitPrice;
    const discount = +(blocks * unitPrice * (secondPercent/100)).toFixed(2);
    productLines[0].lineTotal -= discount;
    if(productLines[0].lineTotal < 0) productLines[0].lineTotal=0;
    return { discount };
  }

  _applyComboFixed(lines, promo) {
    const { comboProducts, comboPrice } = promo.config || {};
    if(!comboProducts || !comboProducts.length || !comboPrice) return null;
    // Revisar si todos están presentes al menos 1
    const present = comboProducts.every(pid => lines.some(l=>l.productId===pid));
    if(!present) return null;
    // Suma de sus totales originales
    const comboLines = lines.filter(l=> comboProducts.includes(l.productId));
    const sum = comboLines.reduce((a,l)=>a+l.lineTotal,0);
    if(sum <= comboPrice) return null;
    const discount = +(sum - comboPrice).toFixed(2);
    // Aplicar descuento en primera línea del combo
    comboLines[0].lineTotal -= discount;
    return { discount };
  }

  _applyPercentCart(lines, promo) {
    const { percent } = promo.config || {};
    if(!percent) return null;
    const sum = lines.reduce((a,l)=>a+l.lineTotal,0);
    const discount = +(sum * (percent/100)).toFixed(2);
    // Aplicar descuento a la primera línea
    if(lines.length) {
      lines[0].lineTotal -= discount;
      if(lines[0].lineTotal < 0) lines[0].lineTotal=0;
    }
    return { discount };
  }
}