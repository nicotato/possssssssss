import { generateId } from '../../domain/utils/id.js';
import { nowIso } from '../../domain/utils/time.js';

export class WasteService {
  constructor(wasteRepo, ingredientRepo, audit, auth) {
    this.wasteRepo = wasteRepo;
    this.ingredientRepo = ingredientRepo;
    this.audit = audit;
    this.auth = auth;
  }

  async reportWaste({ ingredientId, qty, reason, branchId }) {
    if(qty <= 0) throw new Error('La cantidad de merma debe ser > 0');
    const entry = {
      id: generateId('w_'),
      ingredientId,
      qty,
      reason: reason || '',
      branchId: branchId || '',
      reportedBy: this.auth.getUsername(),
      timestamp: nowIso()
    };
    await this.wasteRepo.col.insert(entry);
    // Ajuste stock (decrementar)
    const ingDoc = await this.ingredientRepo.col.findOne(ingredientId).exec();
    if(ingDoc) {
      const current = ingDoc.get('current') || 0;
      await ingDoc.incrementalPatch({ current: current - qty });
    }
    await this.audit.log('WASTE_REPORTED', { ingredientId, qty, reason });
    return entry;
  }
}