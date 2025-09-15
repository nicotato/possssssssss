import { generateId } from '../../domain/utils/id.js';

export class UserService {
  constructor(userRepo, authService, audit) {
    this.repo = userRepo;
    this.auth = authService;
    this.audit = audit;
  }

  async list() { return this.repo.list(); }

  async create({ username, roleId, tempPassword }) {
    // Solo quienes tengan permiso USER_CREATE
    if(!this.auth.hasPermission('USER_CREATE')) throw new Error('No autorizado');
    const hash = await this.auth._hash(tempPassword);
    const user = {
      id: generateId('u_'),
      username,
      passwordHash: hash,
      roleId,
      passwordChangedAt: null,
      active: true,
      mustChangePassword: true
    };
    await this.repo.create(user);
    await this.audit.log('USER_CREATE', { username, roleId, by: this.auth.getUsername() });
    return user;
  }

  async changeRole(userId, newRoleId) {
    if(!this.auth.hasPermission('USER_EDIT')) throw new Error('No autorizado');
    const updated = await this.repo.update(userId, { roleId: newRoleId });
    await this.audit.log('USER_UPDATE_ROLE', { userId, newRoleId, by: this.auth.getUsername() });
    return updated;
  }

  async deactivate(userId) {
    if(!this.auth.hasPermission('USER_EDIT')) throw new Error('No autorizado');
    const updated = await this.repo.update(userId, { active:false });
    await this.audit.log('USER_UPDATE_ROLE', { userId, deactivated:true, by: this.auth.getUsername() });
    return updated;
  }
}