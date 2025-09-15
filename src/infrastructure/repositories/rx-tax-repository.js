export class RxTaxRepository {
  constructor(db) { this.col = db.taxes; }
  async allActive() {
    return (await this.col.find({ selector:{ active: true }}).exec()).map(d=>d.toJSON());
  }
  async all() { return (await this.col.find().exec()).map(d=>d.toJSON()); }
  async create(tax) { await this.col.insert(tax); return tax; }
  async update(id, patch) {
    const doc = await this.col.findOne(id).exec();
    if(!doc) return null;
    await doc.incrementalPatch(patch);
    return doc.toJSON();
  }
}