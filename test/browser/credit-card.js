describe('Credit card input field', function () {
    var field = document.querySelector('.input-credit-card');
    var cleave = new Cleave(field, {
        creditCard: true
    });

    it('should format fully matched input value', function () {
        cleave.setRawValue('340000000012345');
        assert.equal(field.value, '3400 000000 12345');
    });

    it('should format partially matched input value', function () {
        cleave.setRawValue('3400000');
        assert.equal(field.value, '3400 000');
    });

    it('should strip over length value', function () {
        cleave.setRawValue('34000000001234567890');
        assert.equal(field.value, '3400 000000 12345');
    });

    it('should strip non-numeric characters', function () {
        cleave.setRawValue('34o012x34');
        assert.equal(field.value, '3401 234');
    });

    it('should allow 19-digit PANs for visa credit card', function () {
        var cleave = new Cleave(field, {
            creditCard:           true,
            creditCardStrictMode: true
        });

        cleave.setRawValue('4000123400001234567');
        assert.equal(field.value, '4000 1234 0000 1234 567');
    });
});

describe('Credit card type change', function () {
    var field = document.querySelector('.input-credit-card');
    var cardType = '';
    var cleave = new Cleave(field, {
        creditCard:              true,
        onCreditCardTypeChanged: function (type) {
            cardType = type;
        }
    });

    it('should identify uatp', function () {
        cleave.setRawValue('1000');
        assert.equal(cardType, 'uatp');
    });

    it('should identify amex', function () {
        cleave.setRawValue('3400');
        assert.equal(cardType, 'amex');
    });

    it('should identify discover', function () {
        cleave.setRawValue('6011');
        assert.equal(cardType, 'discover');
    });

    it('should identify diners', function () {
        cleave.setRawValue('300');
        assert.equal(cardType, 'diners');
    });

    it('should identify mastercard', function () {
        cleave.setRawValue('5100');
        assert.equal(cardType, 'mastercard');
    });

    it('should identify dankort', function () {
        cleave.setRawValue('5019');
        assert.equal(cardType, 'dankort');
    });

    it('should identify instapayment', function () {
        cleave.setRawValue('637');
        assert.equal(cardType, 'instapayment');
    });

    it('should identify jcb', function () {
        cleave.setRawValue('2131');
        assert.equal(cardType, 'jcb15');
    });

    it('should identify jcb', function () {
        cleave.setRawValue('35');
        assert.equal(cardType, 'jcb');
    });

    it('should identify maestro', function () {
        cleave.setRawValue('5000');
        assert.equal(cardType, 'maestro');
    });

    it('should identify visa', function () {
        cleave.setRawValue('400');
        assert.equal(cardType, 'visa');
    });

    it('should identify mir', function () {
        cleave.setRawValue('2204');
        assert.equal(cardType, 'mir');
    });

    it('should identify unionPay', function () {
        cleave.setRawValue('6288');
        assert.equal(cardType, 'unionPay');
    });
});
