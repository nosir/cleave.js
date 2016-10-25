var _ = require('underscore');
var CreditCardDetector = require('../../src/shortcuts/CreditCardDetector');
var cards = require('../fixtures/credit-card.json');

describe('CreditCardDetector', function () {
    _.mapObject(cards, function (cardNumbers, key) {
        describe('type: ' + key, function () {
            _.each(cardNumbers, function (cardNumber) {
                it('should match card ' + cardNumber, function () {
                    CreditCardDetector.getInfo(cardNumber).blocks.should.eql(CreditCardDetector.blocks[key]);
                });

                it('should match detected card type: ' + key, function () {
                    CreditCardDetector.getInfo(cardNumber).type.should.eql(key);
                });
            });
        });
    });
});
