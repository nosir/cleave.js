describe('Custom input field', function () {
    var field = document.querySelector('.input-custom');

    beforeEach(function(){ field.value = ''; });

    it('should use custom blocks', function () {
        var cleave = new Cleave(field, {
            blocks: [3, 3, 3]
        });

        cleave.setRawValue('123456789');
        assert.equal(field.value, '123 456 789');
    });

    it('should use lazy show mode for delimiter', function () {
        var cleave = new Cleave(field, {
            blocks:    [3, 3, 3],
            delimiterLazyShow: true,
            delimiter: '|'
        });

        cleave.setRawValue('123456');
        assert.equal(field.value, '123|456');
    });

    it('should use custom delimiter', function () {
        var cleave = new Cleave(field, {
            blocks:    [3, 3, 3],
            delimiter: '|'
        });

        cleave.setRawValue('123456789');
        assert.equal(field.value, '123|456|789');
    });

    it('should use custom multiple delimiters', function () {
        var cleave = new Cleave(field, {
            blocks:     [3, 3, 3, 3],
            delimiters: ['-', '-', '~']
        });

        cleave.setRawValue('123456789000');
        assert.equal(field.value, '123-456-789~000');
    });

    it('should use custom multiple delimiters with more than one letter', function () {
        var cleave = new Cleave(field, {
            blocks:     [0, 3, 3, 3],
            delimiters: ['(', ') ', ' - ']
        });

        cleave.setRawValue('123456789000');
        assert.equal(field.value, '(123) 456 - 789');
    });

    it('should use custom multiple delimiters with default value', function () {
        var cleave = new Cleave(field, {
            blocks:     [3, 3, 3, 3],
            delimiters: ['-', '~']
        });

        cleave.setRawValue('123456789000');
        assert.equal(field.value, '123-456~789~000');
    });

    it('should use empty delimiter', function () {
        var cleave = new Cleave(field, {
            blocks:    [3, 3, 3],
            delimiter: ''
        });

        cleave.setRawValue('123456789');
        assert.equal(field.value, '123456789');
    });

    it('should use defined prefix', function () {
        var cleave = new Cleave(field, {
            prefix:    'UFO',
            blocks:    [3, 3],
            delimiter: '-'
        });

        cleave.setRawValue('UFO123');
        assert.equal(field.value, 'UFO-123');
    });

    it('should use defined prefix with noImmediatePrefix enabled', function() {
        var cleave = new Cleave(field, {
            prefix: 'GTM-',
            noImmediatePrefix: true
        });

        cleave.setRawValue('1001');
        assert.equal(cleave.getFormattedValue(), 'GTM-1001');
    });

    it('should use defined prefix with noImmediatePrefix enabled', function() {
        var cleave = new Cleave(field, {
            prefix: 'GTM-',
            noImmediatePrefix: true
        });

        cleave.setRawValue('');
        assert.equal(cleave.getFormattedValue(), 'GTM-');
    });

    it('should not trim prefix when rawValueTrimPrefix is not enabled', function () {
        var cleave = new Cleave(field, {
            prefix:             '$',
            rawValueTrimPrefix: true,
            numeral:            true
        });

        cleave.setRawValue('1234.56');
        assert.equal(cleave.getRawValue(), '1234.56');
    });

    it('should trim prefix when rawValueTrimPrefix is enabled', function () {
        var cleave = new Cleave(field, {
            prefix:  '$',
            numeral: true
        });

        cleave.setRawValue('1234.56');
        assert.equal(cleave.getRawValue(), '$1234.56');
    });

    it('should use numeric only option', function () {
        var cleave = new Cleave(field, {
            numericOnly: true,
            blocks:      [3, 3, 3]
        });

        cleave.setRawValue('12a3b4c5');
        assert.equal(field.value, '123 45');
    });

    it('should use uppercase option', function () {
        var cleave = new Cleave(field, {
            uppercase: true,
            blocks:    [3, 3, 3]
        });

        cleave.setRawValue('abcdef');
        assert.equal(field.value, 'ABC DEF ');
    });

    it('should use lowercase option', function () {
        var cleave = new Cleave(field, {
            lowercase: true,
            blocks:    [3, 3, 3]
        });

        cleave.setRawValue('ABCDEF');
        assert.equal(field.value, 'abc def ');
    });
});
