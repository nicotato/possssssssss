export class RxPromotionRepository {
  constructor(db){ this.col = db.promotions; }

  async active(branchId, nowIso = new Date().toISOString()) {
    const docs = await this.col.find({ selector:{ active:true } }).exec();
    return docs.map(d=>d.toJSON()).filter(p => {
      const inTime = (!p.validFrom || p.validFrom <= nowIso) && (!p.validTo || p.validTo >= nowIso);
      const inBranch = !p.appliesToBranchIds || p.appliesToBranchIds.length===0 || p.appliesToBranchIds.includes(branchId);
      return inTime && inBranch;
    }).sort((a,b)=> (a.priority||0)-(b.priority||0));
  }
}