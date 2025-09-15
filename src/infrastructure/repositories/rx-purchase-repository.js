export class RxPurchaseRepository {
  constructor(db){ this.col = db.purchases; }
  async list(limit=100){ return (await this.col.find().sort({ date:'desc'}).limit(limit).exec()).map(d=>d.toJSON()); }
  async create(purchase){ await this.col.insert(purchase); return purchase; }
}