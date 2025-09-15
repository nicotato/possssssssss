export class RxBranchRepository {
  constructor(db){ this.col = db.branches; }
  async list(){ return (await this.col.find().exec()).map(d=>d.toJSON()); }
  async active(){ return (await this.col.find({ selector:{ active:true }}).exec()).map(d=>d.toJSON()); }
  async create(b){ await this.col.insert(b); return b; }
  async update(id, patch){
    const doc = await this.col.findOne(id).exec();
    if(!doc) return null;
    await doc.incrementalPatch(patch);
    return doc.toJSON();
  }
}