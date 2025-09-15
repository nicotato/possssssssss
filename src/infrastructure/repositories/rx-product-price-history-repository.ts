export class RxProductPriceHistoryRepository {
  constructor(private col: any) {}

  async add(entry:any) {
    await this.col.insert(entry);
    return entry;
  }

  async currentPrice(productId: string, currency: string, atIso = new Date().toISOString()) {
    const docs:any[] = await this.col.find({
      selector:{
        productId,
        currency
      }
    }).exec();
    const list = docs.map((d:any)=>d.toJSON()).filter((p:any) =>
      p.validFrom <= atIso && (!p.validTo || p.validTo >= atIso)
    ).sort((a:any,b:any)=> b.validFrom.localeCompare(a.validFrom));
    return list[0] || null;
  }

  async history(productId: string, currency: string, limit=50) {
  const docs:any[] = await this.col.find({
      selector:{ productId, currency }
    }).sort({ validFrom:'desc' }).limit(limit).exec();
  return docs.map((d:any)=>d.toJSON());
  }
}