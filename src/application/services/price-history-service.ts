import { generateId } from '../../domain/utils/id.js';

export class PriceHistoryService {
  constructor(private priceHistoryRepo: any) {}

  async setPrice(productId: string, currency: string, price: number, source:'manual'|'sync'|'import'='manual', note='') {
    const id = `${productId}|${currency}|${Date.now()}`;
    const entry = {
      id,
      productId,
      currency,
      price,
      validFrom: new Date().toISOString(),
      source,
      note
    };
    return this.priceHistoryRepo.add(entry);
  }

  async resolvePrice(productId: string, currency: string) {
    return this.priceHistoryRepo.currentPrice(productId, currency);
  }
}