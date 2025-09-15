import { generateId } from '../../domain/utils/id.js';

export class RoleService {
  constructor(roleRepo, audit) {
    this.roleRepo = roleRepo;
    this.audit = audit;
  }
  async list() { return this.roleRepo.getAll(); }
  async updateRole(id, patch, actor) {
    const updated = await this.roleRepo.update(id, patch);
    await this.audit.log('ROLE_UPDATE', { id, patch, actor });
    return updated;
  }
  async createRole(data, actor) {
    const role = { id: generateId('role_'), ...data };
    await this.roleRepo.create(role);
    await this.audit.log('ROLE_UPDATE', { create: role.id, actor });
    return role;
  }
}