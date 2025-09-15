export class RxStockMovementRepository {
  constructor(db){ this.col = db.stock_movements; }
  async record(mov){ await this.col.insert(mov); return mov; }
  async forProduct(productId, limit=100){
    return (await this.col.find({ selector:{ productId } }).sort({ timestamp:'desc'}).limit(limit).exec()).map(d=>d.toJSON());
  }
}