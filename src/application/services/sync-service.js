// Servicio de sincronización (push/pull) basado en adaptador remoto
// El adaptador remoto es inyectado (puerto).
export class SyncService {
  constructor(remoteAdapter, orderRepo, productRepo, userRepo, audit, queueRepo) {
    this.remote = remoteAdapter;
    this.orderRepo = orderRepo;
    this.productRepo = productRepo;
    this.userRepo = userRepo;
    this.audit = audit;
    this.queue = queueRepo;
    this.running = false;
  }

  async pushPending() {
    const items = await this.queue.pending(50);
    for (const item of items) {
      try {
        await this.remote.push(item);
        await this.queue.remove(item.id);
  await this.audit.log('SYNC_PUSH', { collection:item.entityCollection, docId:item.docId });
      } catch(e) {
        await this.queue.incrementTried(item.id);
      }
    }
  }

  async pull() {
    try {
      const { products, orders } = await this.remote.pull();
      // Merge demo (podrías hacer resoluciones de conflicto)
      for(const p of products) {
        const existing = await this.productRepo.findById(p.id);
        if(!existing) await this.productRepo.col.insert(p);
      }
      for(const o of orders) {
        const existing = await this.orderRepo.col.findOne(o.id).exec();
        if(!existing) await this.orderRepo.col.insert(o);
      }
      await this.audit.log('SYNC_PULL', { products: products.length, orders: orders.length });
    } catch(e) {
      console.error('Pull error', e);
    }
  }

  async runFullSync() {
    if(this.running) return;
    this.running = true;
    await this.pushPending();
    await this.pull();
    this.running = false;
  }
}