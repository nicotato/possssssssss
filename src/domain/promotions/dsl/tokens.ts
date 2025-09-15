import { createToken, Lexer } from 'chevrotain';

export const When = createToken({ name:'When', pattern:/WHEN/i });
export const Then = createToken({ name:'Then', pattern:/THEN/i });
export const And = createToken({ name:'And', pattern:/AND/i });
export const Or = createToken({ name:'Or', pattern:/OR/i });
export const Buy = createToken({ name:'Buy', pattern:/BUY/i });
export const Get = createToken({ name:'Get', pattern:/GET/i });
export const Of = createToken({ name:'Of', pattern:/OF/i });
export const Free = createToken({ name:'Free', pattern:/FREE/i });
export const Cart = createToken({ name:'Cart', pattern:/CART/i });
export const Percent = createToken({ name:'Percent', pattern:/PERCENT/i });
export const Fixed = createToken({ name:'Fixed', pattern:/FIXED/i });
export const Product = createToken({ name:'Product', pattern:/PRODUCT/i });
export const Category = createToken({ name:'Category', pattern:/CATEGORY/i });
export const LabelTok = createToken({ name:'LabelTok', pattern:/LABEL/i });

export const LParen = createToken({ name:'LParen', pattern:/\(/ });
export const RParen = createToken({ name:'RParen', pattern:/\)/ });
export const Comma = createToken({ name:'Comma', pattern:/,/ });
export const Dot = createToken({ name:'Dot', pattern:/\./ });

export const Gt = createToken({ name:'Gt', pattern:/>/ });
export const Lt = createToken({ name:'Lt', pattern:/</ });
export const Ge = createToken({ name:'Ge', pattern:/>=/ });
export const Le = createToken({ name:'Le', pattern:/<=/ });
export const Eq = createToken({ name:'Eq', pattern:/==/ });
export const Ne = createToken({ name:'Ne', pattern:/!=/ });

export const NumberLiteral = createToken({
  name:'NumberLiteral',
  pattern: /[0-9]+(\.[0-9]+)?/
});
export const StringLiteral = createToken({
  name:'StringLiteral',
  pattern: /"(?:[^"\\]|\\.)*"/
});
export const Ident = createToken({
  name:'Ident',
  pattern: /[a-zA-Z_][a-zA-Z0-9_-]*/
});
export const WS = createToken({
  name:'WS',
  pattern:/\s+/,
  group: Lexer.SKIPPED
});

export const allTokens = [
  WS,
  When, Then, And, Or,
  Buy, Get, Of, Free,
  Cart, Percent, Fixed,
  Product, Category, LabelTok,
  LParen, RParen, Comma, Dot,
  Ge, Le, Gt, Lt, Eq, Ne,
  NumberLiteral, StringLiteral, Ident
];

export const PromoDslLexer = new Lexer(allTokens);