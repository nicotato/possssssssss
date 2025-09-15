export class RxAuditRepository {
  constructor(db) {
    this.col = db.audit_logs;
  }
  async log(entry) {
    await this.col.insert(entry);
  }
  async list(limit=200) {
    return (await this.col.find().sort({ timestamp:'desc'}).limit(limit).exec()).map(d=>d.toJSON());
  }
  async filterByAction(action, limit=100) {
    return (await this.col.find({ selector:{ action }}).limit(limit).exec()).map(d=>d.toJSON());
  }
}