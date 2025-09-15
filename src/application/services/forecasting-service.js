// Modelo simple: Moving Average y Weighted Moving Average (WMA)
export class ForecastingService {
  constructor(orderRepo) {
    this.orderRepo = orderRepo;
  }

  async movingAverage(productId, days=7) {
    const cutoff = new Date(Date.now() - days*86400000).toISOString();
    const docs = await this.orderRepo.col.find().exec();
    const orders = docs.map(d=>d.toJSON()).filter(o=> o.status!=='canceled' && o.createdAt >= cutoff);
    let totalQty = 0;
    orders.forEach(o => {
      o.lines.filter(l=>l.productId===productId).forEach(l=> totalQty += l.qty);
    });
    return +(totalQty / days).toFixed(2);
  }

  async weightedMovingAverage(productId, weights = [0.5, 0.3, 0.2]) {
    // weights length = number of recent segments (e.g., 3 * 7-day periods)
    // sum weights = 1
    const segmentDays = 7;
    let forecast = 0;
    for(let i=0;i<weights.length;i++) {
      const start = new Date(Date.now() - (i+1)*segmentDays*86400000);
      const end = new Date(Date.now() - i*segmentDays*86400000);
      const docs = await this.orderRepo.col.find().exec();
      const orders = docs.map(d=>d.toJSON()).filter(o=> 
        o.status!=='canceled' && o.createdAt >= start.toISOString() && o.createdAt <= end.toISOString()
      );
      let qty = 0;
      orders.forEach(o=>{
        o.lines.filter(l=>l.productId===productId).forEach(l=> qty += l.qty);
      });
      const avgSegment = qty / segmentDays;
      forecast += avgSegment * weights[i];
    }
    return +forecast.toFixed(2);
  }
}