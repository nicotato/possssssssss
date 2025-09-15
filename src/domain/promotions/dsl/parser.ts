import { CstParser } from 'chevrotain';
import { allTokens, When, Then, And, Buy, Get, Of, Free, Cart, Percent, Fixed,
  Product, Category, LabelTok,
  LParen, RParen, Dot,
  NumberLiteral, StringLiteral, Ident,
  Gt, Lt, Ge, Le, Eq, Ne } from './tokens.js';

class PromoDslParser extends CstParser {
  constructor() {
    super(allTokens, { recoveryEnabled:true });
    this.performSelfAnalysis();
  }

  public rulesEntry = this.RULE('rulesEntry', () => {
    this.SUBRULE(this.ruleStatement);
    this.MANY(() => {
      this.CONSUME(And);
      this.SUBRULE2(this.ruleStatement);
    });
  });

  private ruleStatement = this.RULE('ruleStatement', () => {
    this.CONSUME(When);
    this.SUBRULE(this.condition);
    this.CONSUME(Then);
    this.SUBRULE(this.action);
    this.OPTION(() => {
      this.CONSUME(LabelTok);
      this.SUBRULE(this.labelValue);
    });
  });

  private condition = this.RULE('condition', () => {
    // Simple: category("Pizza").amount > 2000
    this.OR([
      { ALT: () => this.SUBRULE(this.categoryCondition) },
      { ALT: () => this.SUBRULE(this.cartCondition) }
    ]);
  });

  private categoryCondition = this.RULE('categoryCondition', () => {
    this.CONSUME(Category);
    this.CONSUME(LParen);
    this.CONSUME(StringLiteral);
    this.CONSUME(RParen);
    this.CONSUME(Dot);
    this.CONSUME(Ident); // amount / qty
    this.SUBRULE(this.comparisonOp);
    this.CONSUME(NumberLiteral);
  });

  private cartCondition = this.RULE('cartCondition', () => {
    this.CONSUME(Cart);
    this.CONSUME(Dot);
    this.CONSUME(Ident);
    this.SUBRULE(this.comparisonOp);
    this.CONSUME(NumberLiteral);
  });

  private comparisonOp = this.RULE('comparisonOp', () => {
    this.OR([
      { ALT: () => this.CONSUME(Gt) },
      { ALT: () => this.CONSUME(Ge) },
      { ALT: () => this.CONSUME(Lt) },
      { ALT: () => this.CONSUME(Le) },
      { ALT: () => this.CONSUME(Eq) },
      { ALT: () => this.CONSUME(Ne) }
    ]);
  });

  private action = this.RULE('action', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.cartPercentAction) },
      { ALT: () => this.SUBRULE(this.cartFixedAction) },
      { ALT: () => this.SUBRULE(this.buyGetAction) }
    ]);
  });

  private cartPercentAction = this.RULE('cartPercentAction', () => {
    this.CONSUME(Cart);
    this.CONSUME(Dot);
    this.CONSUME(Percent);
    this.CONSUME(NumberLiteral);
  });

  private cartFixedAction = this.RULE('cartFixedAction', () => {
    this.CONSUME(Cart);
    this.CONSUME(Dot);
    this.CONSUME(Fixed);
    this.CONSUME(NumberLiteral);
  });

  private buyGetAction = this.RULE('buyGetAction', () => {
    this.CONSUME(Buy);
    this.CONSUME(NumberLiteral);
    this.CONSUME(Of);
    this.CONSUME(Product);
    this.CONSUME(Ident);
    this.CONSUME(Get);
    this.CONSUME(NumberLiteral);
    this.CONSUME(Free);
  });

  private labelValue = this.RULE('labelValue', () => {
    this.CONSUME(StringLiteral);
  });
}

export const promoDslParserInstance = new PromoDslParser();