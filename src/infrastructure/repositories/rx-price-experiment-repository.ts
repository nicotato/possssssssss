import { generateId } from '../../domain/utils/id.js';
import { nowIso } from '../../domain/utils/time.js';

export class RxPriceExperimentRepository {
  constructor(public col:any) {}

  async create(data:any) {
    const id = data.id || generateId('pexp_');
    const doc = { ...data, id, createdAt: data.createdAt || nowIso() };
    await this.col.insert(doc);
    return doc;
  }

  async recent(limit=50) {
    const docs:any[] = await this.col.find().sort({ createdAt:'desc'}).limit(limit).exec();
    return docs.map((d:any)=>d.toJSON());
  }

  async byProduct(productId:string, limit=50) {
    const docs:any[] = await this.col.find({ selector: { productId } })
      .sort({ createdAt:'desc'})
      .limit(limit)
      .exec();
    return docs.map((d:any)=>d.toJSON());
  }
}