// Adapter to decouple PromotionRuleEngine from direct CJS ast-builder import
// and simplify mocking in tests.

import { parsePromoDsl } from './ast-builder.js';

export interface DslParser {
  parse(dsl: string): any; // returns { rules: [...] }
}

export class RealDslParser implements DslParser {
  parse(dsl: string) {
    return parsePromoDsl(dsl);
  }
}

export const defaultDslParser: DslParser = new RealDslParser();
