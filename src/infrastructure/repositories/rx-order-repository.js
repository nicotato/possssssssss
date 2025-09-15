export class RxOrderRepository {
  constructor(db) {
    this.col = db.orders;
  }

  async create(order) {
    await this.col.insert(order);
    return order;
  }

  async list(limit = 50) {
    return this.col.find().sort({ createdAt: 'desc' }).limit(limit).exec();
  }

  async listRecent(limit = 100) {
    const docs = await this.col.find().sort({ createdAt: 'desc' }).limit(limit).exec();
    return docs.map(doc => doc.toJSON());
  }

  async findById(id) {
    const doc = await this.col.findOne(id).exec();
    return doc ? doc.toJSON() : null;
  }

  async updateStatus(id, status) {
    const doc = await this.col.findOne(id).exec();
    if (!doc) return null;
    await doc.incrementalPatch({ status });
    return doc.toJSON();
  }
}