export class TaxService {
  constructor(taxRepo){ this.taxRepo = taxRepo; }

  async calculate(lines) {
    const taxes = await this.taxRepo.allActive();
    const taxLines = [];
    let totalTax = 0;
    for (const tax of taxes) {
      if (tax.scope === 'line') {
        for (const ln of lines) {
          if (this._appliesTo(tax, ln)) {
            const amount = +(ln.lineTotal * tax.rate).toFixed(2);
            if (amount > 0) {
              taxLines.push({
                code: tax.code,
                base: ln.lineTotal,
                rate: tax.rate,
                amount,
                scope: 'line'
              });
              totalTax += amount;
            }
          }
        }
      } else if (tax.scope === 'global') {
        const base = lines
          .filter(ln => this._appliesTo(tax, ln))
          .reduce((a, l) => a + l.lineTotal, 0);
        const amount = +(base * tax.rate).toFixed(2);
        if (amount > 0) {
          taxLines.push({
            code: tax.code,
            base,
            rate: tax.rate,
            amount,
            scope: 'global'
          });
          totalTax += amount;
        }
      }
    }
    return { taxLines, totalTax: +totalTax.toFixed(2) };
  }

  _appliesTo(tax, line) {
    if (!tax.appliesToCategories || tax.appliesToCategories.length === 0) return true;
    return tax.appliesToCategories.includes(line.category);
  }
}