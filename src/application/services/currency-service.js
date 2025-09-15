export class CurrencyService {
  constructor(rateRepo, baseCurrency='UYU') {
    this.rateRepo = rateRepo;
    this.baseCurrency = baseCurrency;
  }

  async getRate(quote) {
    if(quote === this.baseCurrency) return 1;
    const docs = await this.rateRepo.col.find({ selector:{ quote, base:this.baseCurrency } })
      .sort({ timestamp:'desc'}).limit(1).exec();
    const latest = docs[0]?.toJSON();
    return latest ? latest.rate : 1;
  }

  async convertToBase(amount, currency) {
    const rate = await this.getRate(currency);
    return +(amount * (1/rate)).toFixed(4);
  }

  async convertFromBase(amountBase, currency) {
    const rate = await this.getRate(currency);
    return +(amountBase * rate).toFixed(2);
  }
}