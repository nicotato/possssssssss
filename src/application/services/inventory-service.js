import { generateId } from '../../domain/utils/id.js';
import { nowIso } from '../../domain/utils/time.js';

export class InventoryService {
  constructor(stockRepo, productRepo, audit) {
    this.stockRepo = stockRepo;
    this.productRepo = productRepo;
    this.audit = audit;
  }

  async applySale(order) {
    for (const line of order.lines) {
      await this.stockRepo.record({
        id: generateId('mov_'),
        productId: line.productId,
        type: 'sale',
        qty: -line.qty,
        refId: order.id,
        timestamp: nowIso()
      });
    }
  }

  async applyPurchase(purchase) {
    for (const item of purchase.items) {
      await this.stockRepo.record({
        id: generateId('mov_'),
        productId: item.productId,
        type: 'purchase',
        qty: item.qty,
        refId: purchase.id,
        timestamp: nowIso()
      });
    }
  }

  async adjust(productId, qtyDelta, note='ajuste manual', refId='') {
    await this.stockRepo.record({
      id: generateId('mov_'),
      productId,
      type: 'adjust',
      qty: qtyDelta,
      refId,
      note,
      timestamp: nowIso()
    });
    await this.audit.log('INVENTORY_ADJUST', { productId, qtyDelta });
  }
}