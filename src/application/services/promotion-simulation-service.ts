// (Versión extendida: añade persist optional)
export class PromotionSimulationService {
  constructor(
    private promotionService: any,
    private pricingService: any,
    private taxService: any,
    private tipService: any,
    private costComputationService: any,
    private currencyService: any,
    private simulationRunService?: any // opcional
  ) {}

  async simulate(params: any) {
    // ... (igual que versión anterior)
    // (Código omitido por brevedad, integra lo ya implementado anteriormente)
    // Supongamos que al final tenemos objeto "out"
    const out = await this._doPipeline(params);
    if (params.persist && this.simulationRunService) {
      await this.simulationRunService.persistSimulation(params, out, params.tags || []);
    }
    return out;
  }

  private async _doPipeline(params:any) {
    const now = new Date().toISOString();
  const lines = params.lines.map((l:any) => ({ ...l, lineTotal: +(l.unitPrice * l.qty).toFixed(2) }));
  const netBeforePromotions = lines.reduce((a:number,l:any)=>a+l.lineTotal,0);

    for (const line of lines) {
      const cost = await this.costComputationService.computeCostsForLine(line.productId, line.qty);
      line.stdUnitCost = cost.stdUnit;
      line.realUnitCost = cost.realUnit;
      line.varianceUnit = cost.varianceUnit;
    }

    const promoResult = await this.promotionService.applyPromotions(lines, params.branchId);
    const afterPromoLines = promoResult.lines;
  const netAfterPromotions = afterPromoLines.reduce((a:number,l:any)=>a+l.lineTotal,0);
    const promotionDiscountTotal = promoResult.promotionDiscountTotal;

    const { subTotal, discountTotal, appliedDiscounts } =
      this.pricingService.calculate(afterPromoLines, params.discounts || []);

    const netAfterDiscount = subTotal;
    const taxResult = await this.taxService.calculate(afterPromoLines);
    const { tipAmount } = this.tipService.computeTip(netAfterDiscount, params.tipConfig);

    const grandTotalBase = +(netAfterDiscount + taxResult.totalTax + tipAmount).toFixed(2);
    const currency = params.currency || 'BASE';
    let fxRate = 1;
    let grandTotalTx = grandTotalBase;
    if (currency !== 'BASE') {
      fxRate = await this.currencyService.getRate(currency);
      grandTotalTx = +(grandTotalBase * fxRate).toFixed(2);
    }

  const costStdTotalBase = afterPromoLines.reduce((a:number,l:any)=> a + (l.stdUnitCost||0)*l.qty,0);
  const costRealTotalBase = afterPromoLines.reduce((a:number,l:any)=> a + (l.realUnitCost||0)*l.qty,0);
    const costVarianceBase = +(costRealTotalBase - costStdTotalBase).toFixed(2);

    return {
      timestamp: now,
      currency,
      fxRate,
      lines: afterPromoLines,
      netBeforePromotions,
      netAfterPromotions,
      promotionDiscountTotal,
      discountsApplied: appliedDiscounts,
      discountTotal,
      subTotal,
      taxLines: taxResult.taxLines,
      taxTotal: taxResult.totalTax,
      tipAmount,
      grandTotalBase,
      grandTotalTx,
      costStdTotalBase: +costStdTotalBase.toFixed(2),
      costRealTotalBase: +costRealTotalBase.toFixed(2),
      costVarianceBase,
      appliedPromotions: promoResult.appliedPromotions
    };
  }
}