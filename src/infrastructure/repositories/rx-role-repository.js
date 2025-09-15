export class RxRoleRepository {
  constructor(db) {
    this.col = db.roles;
  }
  async getAll() { return (await this.col.find().exec()).map(d=>d.toJSON()); }
  async findById(id) { const d= await this.col.findOne(id).exec(); return d?.toJSON()||null; }
  async findByName(name) {
    const d = await this.col.findOne({ selector:{ name } }).exec();
    return d?.toJSON()||null;
  }
  async create(role) { await this.col.insert(role); return role; }
  async update(id, patch) {
    const doc = await this.col.findOne(id).exec();
    if(!doc) return null;
    await doc.incrementalPatch(patch);
    return doc.toJSON();
  }
}