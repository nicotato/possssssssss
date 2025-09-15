export class RxProductStockRepository {
  constructor(db){ this.col = db.product_stocks; }

  async forProductBranch(productId, branchId) {
    const id = productId + '_' + branchId;
    const doc = await this.col.findOne(id).exec();
    return doc?.toJSON()||null;
  }

  async ensure(productId, branchId) {
    const id = productId + '_' + branchId;
    const doc = await this.col.findOne(id).exec();
    if(doc) return doc.toJSON();
    const init = { id, productId, branchId, current:0, minThreshold:0, avgCost:0, lastCost:0 };
    await this.col.insert(init);
    return init;
  }

  async adjust(productId, branchId, qtyDelta, newCost=null) {
    const id = productId + '_' + branchId;
    const doc = await this.col.findOne(id).exec();
    if(!doc) {
      const created = { id, productId, branchId, current:qtyDelta, minThreshold:0, avgCost:newCost||0, lastCost:newCost||0 };
      await this.col.insert(created);
      return created;
    }
    const data = doc.toJSON();
    let { current, avgCost, lastCost } = data;
    current += qtyDelta;
    if(newCost != null && qtyDelta > 0) {
      // promedio ponderado sencillo
      const totalValue = (data.current * avgCost) + (qtyDelta * newCost);
      const totalQty = data.current + qtyDelta;
      avgCost = totalQty > 0 ? +(totalValue / totalQty).toFixed(4) : 0;
      lastCost = newCost;
    }
    await doc.incrementalPatch({ current, avgCost, lastCost });
    return doc.toJSON();
  }

  async setThreshold(productId, branchId, minThreshold) {
    const id = productId + '_' + branchId;
    const doc = await this.col.findOne(id).exec();
    if(!doc) {
      const init = { id, productId, branchId, current:0, minThreshold, avgCost:0, lastCost:0 };
      await this.col.insert(init);
      return init;
    }
    await doc.incrementalPatch({ minThreshold });
    return doc.toJSON();
  }

  async lowStock(branchId) {
    const all = await this.col.find({ selector:{ branchId } }).exec();
    return all.map(d=>d.toJSON()).filter(s => s.minThreshold>0 && s.current <= s.minThreshold);
  }
}