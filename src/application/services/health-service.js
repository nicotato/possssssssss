export class HealthService {
  constructor(orderRepo, productStockRepo, ingredientRepo, forecastingService, currencyService) {
    this.orderRepo = orderRepo;
    this.productStockRepo = productStockRepo;
    this.ingredientRepo = ingredientRepo;
    this.forecasting = forecastingService;
    this.currency = currencyService;
  }

  async grossMargin(fromIso, toIso) {
    const docs = await this.orderRepo.col.find().exec();
    const orders = docs.map(d=>d.toJSON())
      .filter(o=> o.createdAt>=fromIso && o.createdAt<=toIso && o.status!=='canceled');
    let revenue = 0;
    let cost = 0;
    for(const o of orders) {
      revenue += (o.grandTotalBase || o.grossTotal || o.total || 0);
      cost += (o.costOfGoodsEstimateBase || o.costOfGoodsEstimate || 0);
    }
    return {
      revenue: +revenue.toFixed(2),
      cost: +cost.toFixed(2),
      marginValue: +(revenue - cost).toFixed(2),
      marginPercent: revenue ? +(((revenue - cost)/revenue)*100).toFixed(2) : 0
    };
  }

  // Rotación simple (coste ventas / inventario promedio)
  async inventoryTurnover(fromIso, toIso) { /* stub */ }

  async daysOfStock(productId, branchId) { /* stub usando forecasting */ }
}