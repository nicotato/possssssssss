"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePromoDsl = parsePromoDsl;
var parser_1 = require("./parser");
var tokens_1 = require("./tokens");
function parsePromoDsl(input) {
    var lex = tokens_1.PromoDslLexer.tokenize(input);
    if (lex.errors.length) {
        throw new Error('Lexer errors: ' + lex.errors.map(function (e) { return e.message; }).join('; '));
    }
    parser_1.promoDslParserInstance.input = lex.tokens;
    var cst = parser_1.promoDslParserInstance.rulesEntry();
    if (parser_1.promoDslParserInstance.errors.length) {
        throw new Error('Parser errors: ' + parser_1.promoDslParserInstance.errors.map(function (e) { return e.message; }).join('; '));
    }
    // Minimal CST walker → produce AST simplificado (demo)
    var rules = [];
    var children = cst.children;
    // Pattern: ruleStatement (And ruleStatement)*
    var ruleStatements = __spreadArray([children.ruleStatement[0]], (children.And || []).map(function (_, i) { return children.ruleStatement[i + 1]; }), true);
    ruleStatements.forEach(function (rs) {
        var condNode = rs.children.condition[0];
        var actNode = rs.children.action[0];
        var labelNode = rs.children.labelValue ? rs.children.labelValue[0].children.StringLiteral[0] : null;
        rules.push({
            condition: extractCondition(condNode),
            action: extractAction(actNode),
            label: labelNode ? unquote(labelNode.image) : undefined
        });
    });
    return { rules: rules };
}
function extractCondition(node) {
    // Distinguimos por presence
    if (node.children.categoryCondition) {
        var cc = node.children.categoryCondition[0];
        var parts = cc.children.StringLiteral[0].image;
        var metric = cc.children.Ident[0].image;
        var opTok = cc.children.comparisonOp[0].children;
        var op = Object.keys(opTok)[0];
        var value = cc.children.NumberLiteral[0].image;
        return {
            type: 'categoryMetric',
            category: unquote(parts),
            metric: metric,
            op: opSymbol(op),
            value: parseFloat(value)
        };
    }
    if (node.children.cartCondition) {
        var cc = node.children.cartCondition[0];
        var metric = cc.children.Ident[0].image;
        var opTok = cc.children.comparisonOp[0].children;
        var op = Object.keys(opTok)[0];
        var value = cc.children.NumberLiteral[0].image;
        return {
            type: 'cartMetric',
            metric: metric,
            op: opSymbol(op),
            value: parseFloat(value)
        };
    }
    return { type: 'unknown' };
}
function extractAction(node) {
    if (node.children.cartPercentAction) {
        var n = node.children.cartPercentAction[0].children.NumberLiteral[0].image;
        return { type: 'discountPercentCart', percent: parseFloat(n) };
    }
    if (node.children.cartFixedAction) {
        var n = node.children.cartFixedAction[0].children.NumberLiteral[0].image;
        return { type: 'discountFixedCart', amount: parseFloat(n) };
    }
    if (node.children.buyGetAction) {
        var bga = node.children.buyGetAction[0];
        var buyQty = parseFloat(bga.children.NumberLiteral[0].image);
        var productId = bga.children.Ident[0].image;
        var getQty = parseFloat(bga.children.NumberLiteral[1].image);
        return { type: 'buyXGetY', productId: productId, buyQty: buyQty, getQty: getQty };
    }
    return { type: 'noop' };
}
function opSymbol(opKey) {
    switch (opKey) {
        case 'Gt': return '>';
        case 'Ge': return '>=';
        case 'Lt': return '<';
        case 'Le': return '<=';
        case 'Eq': return '==';
        case 'Ne': return '!=';
        default: return opKey;
    }
}
function unquote(s) {
    return s.replace(/^"/, '').replace(/"$/, '');
}
