export class PromotionService {
  constructor(promoRepo, ruleEngine) {
    this.promoRepo = promoRepo;
    this.ruleEngine = ruleEngine;
  }

  async applyPromotions(lines, branchId) {
    const nowIso = new Date().toISOString();
    const promos = await this.promoRepo.active(branchId, nowIso);
    const categoryTotals = this._categoryTotals(lines);
    let applied = [];
    let discountTotal = 0;

    const linesMutable = lines.map(l=>({...l}));

    for(const promo of promos) {
      // Check exclusiones
      if(!promo.stackable && applied.length) continue;
      if(promo.excludes && promo.excludes.some(e => applied.find(a=>a.promoId===e))) {
        continue;
      }

      // Obtener eventos de regla
      const context = {
        lines: linesMutable,
        cartTotal: linesMutable.reduce((a,l)=>a+l.lineTotal,0),
        categoryTotals,
        appliedPromos: applied.map(a=>a.promoId)
      };
      const events = this.ruleEngine.evaluate(promo, context);
      if(!events.length) continue;

      let promoDiscount = 0;
      for(const ev of events) {
        const d = this._applyEvent(ev, linesMutable);
        promoDiscount += d;
      }
      if(promoDiscount > 0) {
        applied.push({
          promoId: promo.id,
          description: promo.name,
          discountAmount: +promoDiscount.toFixed(2)
        });
        discountTotal += promoDiscount;
      }
    }

    return {
      lines: linesMutable,
      appliedPromotions: applied,
      promotionDiscountTotal: +discountTotal.toFixed(2)
    };
  }

  _categoryTotals(lines) {
    const map = {};
    for(const l of lines) {
      map[l.category] = (map[l.category]||0) + l.lineTotal;
    }
    return map;
  }

  _applyEvent(event, lines) {
    // Ejemplos de event.type: discountPercentCart, discountFixedCart, discountPercentLine, freeItem
    let discountAccum = 0;
    if(event.type === 'discountPercentCart') {
      const cartTotal = lines.reduce((a,l)=>a+l.lineTotal,0);
      const pct = event.payload.discountPercentCart;
      const discount = +(cartTotal * (pct/100)).toFixed(2);
      if(lines.length) {
        lines[0].lineTotal = Math.max(0, lines[0].lineTotal - discount);
        discountAccum += discount;
      }
    }
    // EXTENDER con más tipos
    return discountAccum;
  }
}