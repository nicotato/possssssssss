// Servicio para reportes
export class ReportService {
  constructor(orderRepo) {
    this.orderRepo = orderRepo;
  }

  async salesByDateRange(fromIso, toIso) {
    const all = await this.orderRepo.col.find().exec();
    const orders = all.map(d=>d.toJSON())
      .filter(o => o.createdAt >= fromIso && o.createdAt <= toIso && o.status !== 'canceled');
    const total = orders.reduce((a,o)=>a+o.total,0);
    return { count: orders.length, total, orders };
  }

  async topProducts(fromIso, toIso, limit=5) {
    const { orders } = await this.salesByDateRange(fromIso, toIso);
    const map = new Map();
    orders.forEach(o => {
      o.lines.forEach(l => {
        const entry = map.get(l.productId) || { productId:l.productId, name:l.name, qty:0, revenue:0 };
        entry.qty += l.qty;
        entry.revenue += l.lineTotal;
        map.set(l.productId, entry);
      });
    });
    return Array.from(map.values())
      .sort((a,b)=> b.qty - a.qty)
      .slice(0, limit);
  }

  async totalsByCategory(fromIso, toIso) {
    const { orders } = await this.salesByDateRange(fromIso, toIso);
    const catMap = new Map();
    orders.forEach(o=>{
      o.lines.forEach(l=>{
        const entry = catMap.get(l.category) || { category:l.category, qty:0, revenue:0 };
        entry.qty += l.qty;
        entry.revenue += l.lineTotal;
        catMap.set(l.category, entry);
      });
    });
    return Array.from(catMap.values());
  }
}