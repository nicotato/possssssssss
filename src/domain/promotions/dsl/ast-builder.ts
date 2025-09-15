import { promoDslParserInstance } from './parser.js';
import { PromoDslLexer } from './tokens.js';

export interface PromoDslAst {
  rules: DslRule[];
}

export interface DslRule {
  condition: any;
  action: any;
  label?: string;
}

export function parsePromoDsl(input: string): PromoDslAst {
  const lex = PromoDslLexer.tokenize(input);
  if (lex.errors.length) {
    throw new Error('Lexer errors: '+ lex.errors.map(e=>e.message).join('; '));
  }
  promoDslParserInstance.input = lex.tokens;
  const cst = promoDslParserInstance.rulesEntry();
  if (promoDslParserInstance.errors.length) {
    throw new Error('Parser errors: '+ promoDslParserInstance.errors.map(e=>e.message).join('; '));
  }
  // Minimal CST walker → produce AST simplificado (demo)
  const rules: DslRule[] = [];
  const children: any = cst.children;
  // Pattern: ruleStatement (And ruleStatement)*
  const ruleStatements = [children.ruleStatement[0], ...(children.And||[]).map((_:any,i:number)=>children.ruleStatement[i+1])];
  ruleStatements.forEach((rs:any) => {
    const condNode = rs.children.condition[0];
    const actNode = rs.children.action[0];
    const labelNode = rs.children.labelValue ? rs.children.labelValue[0].children.StringLiteral[0] : null;
    rules.push({
      condition: extractCondition(condNode),
      action: extractAction(actNode),
      label: labelNode ? unquote(labelNode.image) : undefined
    });
  });
  return { rules };
}

function extractCondition(node:any) {
  // Distinguimos por presence
  if (node.children.categoryCondition) {
    const cc = node.children.categoryCondition[0];
    const parts = cc.children.StringLiteral[0].image;
    const metric = cc.children.Ident[0].image;
    const opTok = cc.children.comparisonOp[0].children;
    const op = Object.keys(opTok)[0];
    const value = cc.children.NumberLiteral[0].image;
    return {
      type:'categoryMetric',
      category: unquote(parts),
      metric,
      op: opSymbol(op),
      value: parseFloat(value)
    };
  }
  if (node.children.cartCondition) {
    const cc = node.children.cartCondition[0];
    const metric = cc.children.Ident[0].image;
    const opTok = cc.children.comparisonOp[0].children;
    const op = Object.keys(opTok)[0];
    const value = cc.children.NumberLiteral[0].image;
    return {
      type:'cartMetric',
      metric,
      op: opSymbol(op),
      value: parseFloat(value)
    };
  }
  return { type:'unknown' };
}

function extractAction(node:any) {
  if (node.children.cartPercentAction) {
    const n = node.children.cartPercentAction[0].children.NumberLiteral[0].image;
    return { type:'discountPercentCart', percent: parseFloat(n) };
  }
  if (node.children.cartFixedAction) {
    const n = node.children.cartFixedAction[0].children.NumberLiteral[0].image;
    return { type:'discountFixedCart', amount: parseFloat(n) };
  }
  if (node.children.buyGetAction) {
    const bga = node.children.buyGetAction[0];
    const buyQty = parseFloat(bga.children.NumberLiteral[0].image);
    const productId = bga.children.Ident[0].image;
    const getQty = parseFloat(bga.children.NumberLiteral[1].image);
    return { type:'buyXGetY', productId, buyQty, getQty };
  }
  return { type:'noop' };
}

function opSymbol(opKey: string) {
  switch(opKey) {
    case 'Gt': return '>';
    case 'Ge': return '>=';
    case 'Lt': return '<';
    case 'Le': return '<=';
    case 'Eq': return '==';
    case 'Ne': return '!=';
    default: return opKey;
  }
}

function unquote(s: string) {
  return s.replace(/^"/,'').replace(/"$/,'');
}