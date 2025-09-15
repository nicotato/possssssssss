import { fastHash } from '../../domain/promotions/dsl/ast-cache.js';

export class RxSimulationRunRepository {
  constructor(public col:any){}

  async create(run:any) {
    await this.col.insert(run);
    return run;
  }

  async findByHash(hash:string, limit=10) {
    const docs = await this.col.find({ selector:{ scenarioHash: hash } })
      .sort({ createdAt:'desc' })
      .limit(limit)
      .exec();
  return docs.map((d:any)=>d.toJSON());
  }

  computeHash(input:any) {
    return fastHash(JSON.stringify(input));
  }

  async recent(limit=50) {
    const docs = await this.col.find().sort({ createdAt:'desc'}).limit(limit).exec();
  return docs.map((d:any)=>d.toJSON());
  }
}