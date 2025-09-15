import { generateId } from '../../domain/utils/id.js';
import { nowIso } from '../../domain/utils/time.js';

export class PurchaseService {
  constructor(purchaseRepo, inventoryService, audit, auth) {
    this.purchaseRepo = purchaseRepo;
    this.inventory = inventoryService;
    this.audit = audit;
    this.auth = auth;
  }

  async create({ supplierId, items, notes }) {
    if(!this.auth.hasPermission('PURCHASE_CREATE')) throw new Error('No autorizado');
    const totalCost = items.reduce((a,i)=>a + (i.qty * i.unitCost), 0);
    const purchase = {
      id: generateId('pu_'),
      supplierId,
      date: nowIso(),
      items: items.map(i => ({
        ...i,
        lineCost: +(i.qty * i.unitCost).toFixed(2)
      })),
      totalCost: +totalCost.toFixed(2),
      notes: notes || ''
    };
    await this.purchaseRepo.create(purchase);
    await this.inventory.applyPurchase(purchase);
    await this.audit.log('PURCHASE_CREATE', { purchaseId: purchase.id, totalCost: purchase.totalCost });
    return purchase;
  }
}