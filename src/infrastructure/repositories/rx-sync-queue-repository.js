export class RxSyncQueueRepository {
  constructor(db) {
    this.col = db.sync_queue;
  }
  async enqueue(item) {
    await this.col.insert(item);
  }
  async pending(limit=50) {
    return (await this.col.find().sort({ createdAt:'asc'}).limit(limit).exec()).map(d=>d.toJSON());
  }
  async remove(id) {
    const doc = await this.col.findOne(id).exec();
    if(doc) await doc.remove();
  }
  async incrementTried(id) {
    const doc = await this.col.findOne(id).exec();
    if(doc) await doc.incrementalPatch({ 
      retries: (doc.get('retries')||0)+1,
      lastAttemptAt: new Date().toISOString()
    });
  }
}