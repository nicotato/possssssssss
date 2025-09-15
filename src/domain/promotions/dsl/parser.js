"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.promoDslParserInstance = void 0;
var chevrotain_1 = require("chevrotain");
var tokens_1 = require("./tokens");
var PromoDslParser = /** @class */ (function (_super) {
    __extends(PromoDslParser, _super);
    function PromoDslParser() {
        var _this = _super.call(this, tokens_1.allTokens, { recoveryEnabled: true }) || this;
        _this.rulesEntry = _this.RULE('rulesEntry', function () {
            _this.SUBRULE(_this.ruleStatement);
            _this.MANY(function () {
                _this.CONSUME(tokens_1.And);
                _this.SUBRULE2(_this.ruleStatement);
            });
        });
        _this.ruleStatement = _this.RULE('ruleStatement', function () {
            _this.CONSUME(tokens_1.When);
            _this.SUBRULE(_this.condition);
            _this.CONSUME(tokens_1.Then);
            _this.SUBRULE(_this.action);
            _this.OPTION(function () {
                _this.CONSUME(tokens_1.LabelTok);
                _this.SUBRULE(_this.labelValue);
            });
        });
        _this.condition = _this.RULE('condition', function () {
            // Simple: category("Pizza").amount > 2000
            _this.OR([
                { ALT: function () { return _this.SUBRULE(_this.categoryCondition); } },
                { ALT: function () { return _this.SUBRULE(_this.cartCondition); } }
            ]);
        });
        _this.categoryCondition = _this.RULE('categoryCondition', function () {
            _this.CONSUME(tokens_1.Category);
            _this.CONSUME(tokens_1.LParen);
            _this.CONSUME(tokens_1.StringLiteral);
            _this.CONSUME(tokens_1.RParen);
            _this.CONSUME(tokens_1.Dot);
            _this.CONSUME(tokens_1.Ident); // amount / qty
            _this.SUBRULE(_this.comparisonOp);
            _this.CONSUME(tokens_1.NumberLiteral);
        });
        _this.cartCondition = _this.RULE('cartCondition', function () {
            _this.CONSUME(tokens_1.Cart);
            _this.CONSUME(tokens_1.Dot);
            _this.CONSUME(tokens_1.Ident);
            _this.SUBRULE(_this.comparisonOp);
            _this.CONSUME(tokens_1.NumberLiteral);
        });
        _this.comparisonOp = _this.RULE('comparisonOp', function () {
            _this.OR([
                { ALT: function () { return _this.CONSUME(tokens_1.Gt); } },
                { ALT: function () { return _this.CONSUME(tokens_1.Ge); } },
                { ALT: function () { return _this.CONSUME(tokens_1.Lt); } },
                { ALT: function () { return _this.CONSUME(tokens_1.Le); } },
                { ALT: function () { return _this.CONSUME(tokens_1.Eq); } },
                { ALT: function () { return _this.CONSUME(tokens_1.Ne); } }
            ]);
        });
        _this.action = _this.RULE('action', function () {
            _this.OR([
                { ALT: function () { return _this.SUBRULE(_this.cartPercentAction); } },
                { ALT: function () { return _this.SUBRULE(_this.cartFixedAction); } },
                { ALT: function () { return _this.SUBRULE(_this.buyGetAction); } }
            ]);
        });
        _this.cartPercentAction = _this.RULE('cartPercentAction', function () {
            _this.CONSUME(tokens_1.Cart);
            _this.CONSUME(tokens_1.Dot);
            _this.CONSUME(tokens_1.Percent);
            _this.CONSUME(tokens_1.NumberLiteral);
        });
        _this.cartFixedAction = _this.RULE('cartFixedAction', function () {
            _this.CONSUME(tokens_1.Cart);
            _this.CONSUME(tokens_1.Dot);
            _this.CONSUME(tokens_1.Fixed);
            _this.CONSUME(tokens_1.NumberLiteral);
        });
        _this.buyGetAction = _this.RULE('buyGetAction', function () {
            _this.CONSUME(tokens_1.Buy);
            _this.CONSUME(tokens_1.NumberLiteral);
            _this.CONSUME(tokens_1.Of);
            _this.CONSUME(tokens_1.Product);
            _this.CONSUME(tokens_1.Ident);
            _this.CONSUME(tokens_1.Get);
            _this.CONSUME(tokens_1.NumberLiteral);
            _this.CONSUME(tokens_1.Free);
        });
        _this.labelValue = _this.RULE('labelValue', function () {
            _this.CONSUME(tokens_1.StringLiteral);
        });
        _this.performSelfAnalysis();
        return _this;
    }
    return PromoDslParser;
}(chevrotain_1.CstParser));
exports.promoDslParserInstance = new PromoDslParser();
