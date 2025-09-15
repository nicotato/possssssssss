import { generateId } from '../../domain/utils/id.js';
import { nowIso } from '../../domain/utils/time.js';

export class CustomerTierService {
  constructor(orderRepo, tierRepo, audit) {
    this.orderRepo = orderRepo;
    this.tierRepo = tierRepo; // collection customer_tiers
    this.audit = audit;
    this.tiers = [
      { name:'GOLD', min: 10000 },
      { name:'SILVER', min: 3000 },
      { name:'BRONZE', min: 0 }
    ];
  }

  async recalcCustomer(customer) {
    const docs = await this.orderRepo.col.find({ selector:{ customerPhone: customer.phone } }).exec();
    const orders = docs.map(d=>d.toJSON()).filter(o=> o.status !== 'canceled');
    const ltv = orders.reduce((a,o)=> a + (o.grossTotal || o.total || 0), 0);
    const tier = this.tiers.find(t => ltv >= t.min) || this.tiers[this.tiers.length-1];
    const existing = await this.tierRepo.col.findOne(customer.id).exec();
    if(existing) {
      await existing.incrementalPatch({ tier: tier.name, ltv, updatedAt: nowIso() });
    } else {
      await this.tierRepo.col.insert({
        id: customer.id,
        tier: tier.name,
        ltv,
        updatedAt: nowIso()
      });
    }
    await this.audit.log('CUSTOMER_TIER_UPDATE', { customerId: customer.id, tier: tier.name, ltv });
    return { tier: tier.name, ltv };
  }

  async getTier(customerId) {
    const doc = await this.tierRepo.col.findOne(customerId).exec();
    return doc?.toJSON()||null;
  }
}