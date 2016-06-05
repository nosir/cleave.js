var _ = require('underscore');
var should = require('should');
var CreditCardDetector = require('../src/shortcuts/CreditCardDetector');
var cards = require('./fixtures/credit-card.json');

describe('CreditCardDetector', function () {
    _.mapObject(cards, function (cardNumbers, key) {
        _.each(cardNumbers, function (cardNumber) {
            it('should detect card ' + cardNumber + ' as ' + key, function () {
                CreditCardDetector.getBlocksByPAN(cardNumber, true).should.eql(CreditCardDetector.blocks[key]);
            });
        });
    });
});
