// NOTA: Estas factorías deben ajustarse para usar repos reales,
// aquí se suministran mocks simplificados.

export function promotionServiceFactory() {
  return {
    applyPromotions: async (lines:any, _branchId:string) => ({
      lines,
      appliedPromotions: [],
      promotionDiscountTotal: 0
    })
  };
}
export function pricingServiceFactory() {
  return {
    calculate: (lines:any, _discounts:any[]) => {
      const subTotal = lines.reduce((a:number,l:any)=>a+l.lineTotal,0);
      const discountTotal = 0; // Ignora en mock
      return { subTotal, discountTotal, appliedDiscounts:[] };
    }
  };
}
export function taxServiceFactory() {
  return {
    calculate: async (_lines:any) => ({ taxLines:[], totalTax:0 })
  };
}
export function tipServiceFactory() {
  return {
    computeTip: (_sub:number, tipCfg:any) => {
      if(!tipCfg) return { tipAmount:0 };
      if(tipCfg.type==='PERCENT') return { tipAmount: +( _sub * (tipCfg.value/100)).toFixed(2) };
      if(tipCfg.type==='FIXED') return { tipAmount: +tipCfg.value };
      return { tipAmount:0 };
    }
  };
}
export function costCompServiceFactory() {
  return {
    computeCostsForLine: async (_pid:string,_qty:number) => ({
      stdUnit:0, realUnit:0, varianceUnit:0
    })
  };
}
export function currencyServiceFactory() {
  return {
    getRate: async (_c:string)=>1
  };
}