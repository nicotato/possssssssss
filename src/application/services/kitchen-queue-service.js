export class KitchenQueueService {
  constructor(orderRepo, audit) {
    this.orderRepo = orderRepo;
    this.audit = audit;
  }

  async listPending(limit=100) {
    const docs = await this.orderRepo.col
      .find({ selector:{ kitchenStatus: { $in:['pending','in_progress'] } } })
      .sort({ createdAt:'asc' })
      .limit(limit)
      .exec();
    return docs.map(d=>d.toJSON());
  }

  async startTicket(orderId) {
    const doc = await this.orderRepo.col.findOne(orderId).exec();
    if(!doc) return null;
    await doc.incrementalPatch({ kitchenStatus:'in_progress' });
    return doc.toJSON();
  }

  async completeTicket(orderId) {
    const doc = await this.orderRepo.col.findOne(orderId).exec();
    if(!doc) return null;
    await doc.incrementalPatch({ kitchenStatus:'done' });
    return doc.toJSON();
  }

  async updateItemProgress(orderId, lineId, doneQty) {
    const doc = await this.orderRepo.col.findOne(orderId).exec();
    if(!doc) return null;
    const data = doc.toJSON();
    const items = data.kitchenItems || [];
    const target = items.find(i=> i.lineId===lineId);
    if(target) {
      target.doneQty = doneQty;
      const allDone = items.every(i=> i.doneQty >= i.qty);
      const patch = { kitchenItems: items };
      if(allDone) patch.kitchenStatus='done';
      await doc.incrementalPatch(patch);
    }
    return doc.toJSON();
  }
}