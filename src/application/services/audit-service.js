import { generateId } from '../../domain/utils/id.js';
import { nowIso } from '../../domain/utils/time.js';

export class AuditService {
  constructor(auditRepository) {
    this.repo = auditRepository;
  }

  async log(action, details={}) {
    const entry = {
      id: generateId('audit_'),
      timestamp: nowIso(),
      action,
      user: details.user || details.admin || details.username || '',
      details
    };
    await this.repo.log(entry);
  }

  async list(limit=200) {
    return this.repo.list(limit);
  }
}