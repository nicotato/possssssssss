export class AnalyticsService {
  constructor(orderRepo, productRepo) {
    this.orderRepo = orderRepo;
    this.productRepo = productRepo;
  }

  async salesSummary(fromIso, toIso) {
    const docs = await this.orderRepo.col.find().exec();
    const orders = docs.map(d=>d.toJSON())
      .filter(o=> o.createdAt >= fromIso && o.createdAt <= toIso && o.status !== 'canceled');
    const total = orders.reduce((a,o)=> a + (o.grossTotal || o.total || 0), 0);
    const tax = orders.reduce((a,o)=> a + (o.taxTotal || 0), 0);
    const tip = orders.reduce((a,o)=> a + (o.tipAmount || 0), 0);
    return {
      count: orders.length,
      total,
      avgTicket: orders.length ? +(total/orders.length).toFixed(2) : 0,
      tax,
      tip
    };
  }

  async bestSellers(fromIso, toIso, limit = 10) {
    const { orders } = await this._filteredOrders(fromIso, toIso);
    const map = new Map();
    orders.forEach(o => {
      o.lines.forEach(l => {
        const entry = map.get(l.productId) || { productId:l.productId, name:l.name, qty:0, revenue:0 };
        entry.qty += l.qty;
        entry.revenue += l.lineTotal;
        map.set(l.productId, entry);
      });
    });
    return Array.from(map.values()).sort((a,b)=> b.qty - a.qty).slice(0,limit);
  }

  async notSoldProducts(fromIso, toIso) {
    const allProducts = await this.productRepo.getAll();
    const { orders } = await this._filteredOrders(fromIso, toIso);
    const soldSet = new Set();
    orders.forEach(o => o.lines.forEach(l => soldSet.add(l.productId)));
    return allProducts.filter(p => !soldSet.has(p.id)).map(p => p.toJSON ? p.toJSON() : p);
  }

  async customerPerformance(fromIso, toIso) {
    const { orders } = await this._filteredOrders(fromIso, toIso);
    const map = new Map();
    orders.forEach(o => {
      const key = o.customerPhone || 'SIN_CLIENTE';
      const entry = map.get(key) || { phone:key, name:o.customerName||'', orders:0, total:0 };
      entry.orders += 1;
      entry.total += o.grossTotal || o.total || 0;
      map.set(key, entry);
    });
    return Array.from(map.values()).sort((a,b)=> b.total - a.total);
  }

  async _filteredOrders(fromIso, toIso) {
    const docs = await this.orderRepo.col.find().exec();
    const orders = docs.map(d=>d.toJSON())
      .filter(o => o.createdAt >= fromIso && o.createdAt <= toIso && o.status !== 'canceled');
    return { orders };
  }
}