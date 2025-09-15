export class CostVarianceReportService {
  constructor(private varianceRepo:any, private productRepo:any) {}

  async summary(fromIso:string, toIso:string) {
    type VarianceDoc = { createdAt:string; totalVariance:number; productId:string };
    const docs: any[] = await this.varianceRepo.col.find().exec();
    const rows: VarianceDoc[] = docs.map(d=>d.toJSON() as VarianceDoc)
      .filter((r:VarianceDoc)=> r.createdAt >= fromIso && r.createdAt <= toIso);
    const totalVariance = rows.reduce((a:number,r:VarianceDoc)=>a + (r.totalVariance||0),0);
    const byProduct = new Map<string, number>();
    rows.forEach((r:VarianceDoc) => {
      byProduct.set(r.productId, (byProduct.get(r.productId)||0) + (r.totalVariance||0));
    });
    const enriched = [];
    for (const [productId, variance] of byProduct.entries()) {
      const pDoc = await this.productRepo.findById(productId);
      const name = pDoc?.toJSON ? pDoc.toJSON().name : productId;
      enriched.push({ productId, name, variance:+variance.toFixed(2) });
    }
    enriched.sort((a,b)=> Math.abs(b.variance) - Math.abs(a.variance));
    return {
      count: rows.length,
      totalVariance: +totalVariance.toFixed(2),
      top: enriched.slice(0,20)
    };
  }
}