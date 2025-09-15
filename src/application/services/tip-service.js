export class TipService {
  computeTip(netAfterDiscount, tipConfig) {
    if(!tipConfig) return { tipAmount:0 };
    if(tipConfig.type === 'PERCENT') {
      return { tipAmount: +(netAfterDiscount * (tipConfig.value/100)).toFixed(2) };
    } else if (tipConfig.type === 'FIXED') {
      return { tipAmount: +tipConfig.value.toFixed(2) };
    }
    return { tipAmount:0 };
  }
}