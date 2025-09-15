export class RxUserRepository {
  constructor(db) {
    this.col = db.users;
  }

  async findByUsername(username) {
    const doc = await this.col.findOne({ selector: { username } }).exec();
    return doc?.toJSON() || null;
  }
  async findById(id) {
    const doc = await this.col.findOne(id).exec();
    return doc?.toJSON() || null;
  }
  async list() {
    return (await this.col.find().exec()).map(d=>d.toJSON());
  }
  async create(user) {
    await this.col.insert(user);
    return user;
  }
  async update(id, patch) {
    const doc = await this.col.findOne(id).exec();
    if(!doc) return null;
    await doc.incrementalPatch(patch);
    return doc.toJSON();
  }
  async setPassword(id, passwordHash) {
    const doc = await this.col.findOne(id).exec();
    if(!doc) return null;
    await doc.incrementalPatch({
      passwordHash,
      passwordChangedAt: new Date().toISOString(),
      mustChangePassword: false
    });
    return doc.toJSON();
  }
}