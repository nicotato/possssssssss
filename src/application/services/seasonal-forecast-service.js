export class SeasonalForecastService {
  constructor(orderRepo, profileRepo) {
    this.orderRepo = orderRepo;
    this.profileRepo = profileRepo;
  }

  async forecastForDate(productId, date = new Date()) {
    const weekday = date.getDay(); // 0..6
    const profileDoc = await this.profileRepo.col.findOne(productId + '_default').exec();
    if(!profileDoc) return 0;
    const profile = profileDoc.toJSON();
    const factor = profile.weekdayFactors[weekday] || 1;
    return +(profile.baseDailyAvg * factor).toFixed(2);
  }

  async recalcProfile(productId, days=60) {
    const cutoff = new Date(Date.now() - days*86400000).toISOString();
    const docs = await this.orderRepo.col.find().exec();
    const orders = docs.map(d=>d.toJSON()).filter(o=>o.createdAt >= cutoff && o.status!=='canceled');
    const dailyMap = new Map(); // key=yyyy-mm-dd => qty
    orders.forEach(o=>{
      o.lines.filter(l=>l.productId===productId).forEach(l=>{
        const d = o.createdAt.slice(0,10);
        dailyMap.set(d, (dailyMap.get(d)||0)+l.qty);
      });
    });
    if(!dailyMap.size) return null;
    const arr = Array.from(dailyMap.entries());
    const avg = arr.reduce((a,[,q])=>a+q,0)/arr.length;

    // weekday factors
    const weekdayTotals = Array(7).fill(0);
    const weekdayCounts = Array(7).fill(0);
    arr.forEach(([dayString, qty])=>{
      const wd = new Date(dayString).getDay();
      weekdayTotals[wd]+=qty;
      weekdayCounts[wd]+=1;
    });
    const factors = weekdayTotals.map((tot,i)=> {
      const wdAvg = weekdayCounts[i] ? tot/weekdayCounts[i] : 0;
      return avg ? +(wdAvg/avg).toFixed(3) : 1;
    });

    const id = productId + '_default';
    const existing = await this.profileRepo.col.findOne(id).exec();
    if(existing) {
      await existing.incrementalPatch({ weekdayFactors: factors, baseDailyAvg: +avg.toFixed(3), updatedAt: new Date().toISOString() });
    } else {
      await this.profileRepo.col.insert({
        id, productId,
        weekdayFactors: factors,
        baseDailyAvg: +avg.toFixed(3),
        updatedAt: new Date().toISOString()
      });
    }
    return { baseDailyAvg: avg, weekdayFactors: factors };
  }
}