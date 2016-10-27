describe('Numeral input field', function () {
    var field = document.querySelector('.input-numeral');

    it('should add large number delimiter', function () {
        var cleave = new Cleave(field, {
            numeral: true
        });

        cleave.setRawValue('1234.56');
        assert.equal(field.value, '1,234.56');
    });

    it('should use defined decimal scale', function () {
        var cleave = new Cleave(field, {
            numeral:             true,
            numeralDecimalScale: 4
        });

        cleave.setRawValue('1.2345678');
        assert.equal(field.value, '1.2345');
    });

    it('should use defined decimal mark', function () {
        var cleave = new Cleave(field, {
            numeral:            true,
            numeralDecimalMark: ',',
            delimiter:          '.'
        });

        cleave.setRawValue('1234.56');
        assert.equal(field.value, '1.234,56');
    });

    it('should use defined group lakh style', function () {
        var cleave = new Cleave(field, {
            numeral:                    true,
            numeralThousandsGroupStyle: 'lakh'
        });

        cleave.setRawValue('12345678.90');
        assert.equal(field.value, '1,23,45,678.90');
    });

    it('should use defined group wan style', function () {
        var cleave = new Cleave(field, {
            numeral:                    true,
            numeralThousandsGroupStyle: 'wan'
        });

        cleave.setRawValue('123456789.01');
        assert.equal(field.value, '1,2345,6789.01');
    });

    it('should use defined positive only option', function () {
        var cleave = new Cleave(field, {
            numeral:             true,
            numeralPositiveOnly: true
        });

        cleave.setRawValue('-1234.56');
        assert.equal(field.value, '1,234.56');
    });
});
