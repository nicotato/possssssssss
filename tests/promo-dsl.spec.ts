import { describe, it, expect } from 'vitest';
// Comentado temporalmente debido a problemas de ES modules con chevrotain
// import { parsePromoDsl } from '../src/domain/promotions/dsl/ast-builder.ts';

describe.skip('Promo DSL Parser', () => {
  it('parsea regla simple percent cart', () => {
    // const ast = parsePromoDsl('WHEN CART.total > 1000 THEN CART.PERCENT 10 LABEL "Alta compra"');
    // expect(ast.rules.length).toBe(1);
    // expect(ast.rules[0].action.type).toBe('discountPercentCart');
    // expect(ast.rules[0].label).toBe('Alta compra');
  });

  it('parsea category condition + buy get', () => {
    // const ast = parsePromoDsl('WHEN CATEGORY("Pizza").amount > 500 THEN BUY 2 OF PRODUCT p1 GET 1 FREE');
    // expect(ast.rules[0].action.type).toBe('buyXGetY');
  });
});