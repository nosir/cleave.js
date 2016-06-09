var _ = require('underscore');
var should = require('should');
var CreditCardDetector = require('../src/shortcuts/CreditCardDetector');
var cards = require('./fixtures/credit-card.json');

describe('CreditCardDetector', function () {
    _.mapObject(cards, function (cardNumbers, key) {
        describe('type' + key, function () {
            _.each(cardNumbers, function (cardNumber) {
                it('should match card ' + cardNumber, function () {
                    CreditCardDetector.getBlocksByPAN(cardNumber, true).should.eql(CreditCardDetector.blocks[key]);
                });
            });
        });
    });
});
