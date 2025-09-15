export class BranchService {
  constructor(branchRepo) {
    this.branchRepo = branchRepo;
    this.currentBranchId = null;
  }
  async initDefault() {
    const actives = await this.branchRepo.active();
    if(actives.length) this.currentBranchId = actives[0].id;
  }
  setBranch(id) { this.currentBranchId = id; }
  getBranch() { return this.currentBranchId; }
}