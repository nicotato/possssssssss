"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromoDslLexer = exports.allTokens = exports.WS = exports.Ident = exports.StringLiteral = exports.NumberLiteral = exports.Ne = exports.Eq = exports.Le = exports.Ge = exports.Lt = exports.Gt = exports.Dot = exports.Comma = exports.RParen = exports.LParen = exports.LabelTok = exports.Category = exports.Product = exports.Fixed = exports.Percent = exports.Cart = exports.Free = exports.Of = exports.Get = exports.Buy = exports.Or = exports.And = exports.Then = exports.When = void 0;
var chevrotain_1 = require("chevrotain");
exports.When = (0, chevrotain_1.createToken)({ name: 'When', pattern: /WHEN/i });
exports.Then = (0, chevrotain_1.createToken)({ name: 'Then', pattern: /THEN/i });
exports.And = (0, chevrotain_1.createToken)({ name: 'And', pattern: /AND/i });
exports.Or = (0, chevrotain_1.createToken)({ name: 'Or', pattern: /OR/i });
exports.Buy = (0, chevrotain_1.createToken)({ name: 'Buy', pattern: /BUY/i });
exports.Get = (0, chevrotain_1.createToken)({ name: 'Get', pattern: /GET/i });
exports.Of = (0, chevrotain_1.createToken)({ name: 'Of', pattern: /OF/i });
exports.Free = (0, chevrotain_1.createToken)({ name: 'Free', pattern: /FREE/i });
exports.Cart = (0, chevrotain_1.createToken)({ name: 'Cart', pattern: /CART/i });
exports.Percent = (0, chevrotain_1.createToken)({ name: 'Percent', pattern: /PERCENT/i });
exports.Fixed = (0, chevrotain_1.createToken)({ name: 'Fixed', pattern: /FIXED/i });
exports.Product = (0, chevrotain_1.createToken)({ name: 'Product', pattern: /PRODUCT/i });
exports.Category = (0, chevrotain_1.createToken)({ name: 'Category', pattern: /CATEGORY/i });
exports.LabelTok = (0, chevrotain_1.createToken)({ name: 'LabelTok', pattern: /LABEL/i });
exports.LParen = (0, chevrotain_1.createToken)({ name: 'LParen', pattern: /\(/ });
exports.RParen = (0, chevrotain_1.createToken)({ name: 'RParen', pattern: /\)/ });
exports.Comma = (0, chevrotain_1.createToken)({ name: 'Comma', pattern: /,/ });
exports.Dot = (0, chevrotain_1.createToken)({ name: 'Dot', pattern: /\./ });
exports.Gt = (0, chevrotain_1.createToken)({ name: 'Gt', pattern: />/ });
exports.Lt = (0, chevrotain_1.createToken)({ name: 'Lt', pattern: /</ });
exports.Ge = (0, chevrotain_1.createToken)({ name: 'Ge', pattern: />=/ });
exports.Le = (0, chevrotain_1.createToken)({ name: 'Le', pattern: /<=/ });
exports.Eq = (0, chevrotain_1.createToken)({ name: 'Eq', pattern: /==/ });
exports.Ne = (0, chevrotain_1.createToken)({ name: 'Ne', pattern: /!=/ });
exports.NumberLiteral = (0, chevrotain_1.createToken)({
    name: 'NumberLiteral',
    pattern: /[0-9]+(\.[0-9]+)?/
});
exports.StringLiteral = (0, chevrotain_1.createToken)({
    name: 'StringLiteral',
    pattern: /"(?:[^"\\]|\\.)*"/
});
exports.Ident = (0, chevrotain_1.createToken)({
    name: 'Ident',
    pattern: /[a-zA-Z_][a-zA-Z0-9_-]*/
});
exports.WS = (0, chevrotain_1.createToken)({
    name: 'WS',
    pattern: /\s+/,
    group: chevrotain_1.Lexer.SKIPPED
});
exports.allTokens = [
    exports.WS,
    exports.When, exports.Then, exports.And, exports.Or,
    exports.Buy, exports.Get, exports.Of, exports.Free,
    exports.Cart, exports.Percent, exports.Fixed,
    exports.Product, exports.Category, exports.LabelTok,
    exports.LParen, exports.RParen, exports.Comma, exports.Dot,
    exports.Ge, exports.Le, exports.Gt, exports.Lt, exports.Eq, exports.Ne,
    exports.NumberLiteral, exports.StringLiteral, exports.Ident
];
exports.PromoDslLexer = new chevrotain_1.Lexer(exports.allTokens);
