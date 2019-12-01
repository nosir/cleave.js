describe('Custom input field', function () {
    var field = document.querySelector('.input-custom');

    it('should use custom blocks', function () {
        var cleave = new Cleave(field, {
            blocks: [3, 3, 3]
        });

        cleave.setRawValue('123456789');
        assert.equal(field.value, '123 456 789');
    });

    it('should use modified custom blocks', function () {
        var cleave = new Cleave(field, {
            blocks: [2, 3, 4]
        });

        cleave.modify({
            blocks: [4, 3, 2]
        });

        cleave.setRawValue('123456789');
        assert.equal(field.value, '1234 567 89');
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

    it('should use modified lazy show mode for delimiter', function () {
        var cleave = new Cleave(field, {
            blocks:    [3, 3, 3],
            delimiterLazyShow: true,
            delimiter: '|'
        });

        cleave.modify({
            delimiterLazyShow: false
        });

        cleave.setRawValue('123456');
        assert.equal(field.value, '123|456|');
    });

    it('should use custom delimiter', function () {
        var cleave = new Cleave(field, {
            blocks:    [3, 3, 3],
            delimiter: '|'
        });

        cleave.setRawValue('123456789');
        assert.equal(field.value, '123|456|789');
    });

    it('should use modified custom delimiter', function () {
        var cleave = new Cleave(field, {
            blocks:    [3, 3, 3],
            delimiter: '|'
        });

        cleave.modify({
            delimiter: ':'
        });

        cleave.setRawValue('123456789');
        assert.equal(field.value, '123:456:789');
    });

    it('should use custom multiple delimiters', function () {
        var cleave = new Cleave(field, {
            blocks:     [3, 3, 3, 3],
            delimiters: ['-', '-', '~']
        });

        cleave.setRawValue('123456789000');
        assert.equal(field.value, '123-456-789~000');
    });

    it('should use modified custom multiple delimiters', function () {
        var cleave = new Cleave(field, {
            blocks:     [3, 3, 3, 3],
            delimiters: ['-', '-', '~']
        });

        cleave.modify({
            delimiters: ['-', '~', '-']
        });

        cleave.setRawValue('123456789000');
        assert.equal(field.value, '123-456~789-000');
    });

    it('should use custom multiple delimiters with more than one letter', function () {
        var cleave = new Cleave(field, {
            blocks:     [0, 3, 3, 3],
            delimiters: ['(', ') ', ' - ']
        });

        cleave.setRawValue('123456789000');
        assert.equal(field.value, '(123) 456 - 789');
    });

    it('should use modified custom multiple delimiters with more than one letter', function () {
        var cleave = new Cleave(field, {
            blocks:     [0, 3, 3, 3],
            delimiters: ['(', ') ', ' - ']
        });

        cleave.modify({
            delimiters: ['[', ']:', ' -- ']
        });

        cleave.setRawValue('123456789000');
        assert.equal(field.value, '[123]:456 -- 789');
    });

    it('should use custom multiple delimiters with default value', function () {
        var cleave = new Cleave(field, {
            blocks:     [3, 3, 3, 3],
            delimiters: ['-', '~']
        });

        cleave.setRawValue('123456789000');
        assert.equal(field.value, '123-456~789~000');
    });

    it('should use modified custom multiple delimiters with default value', function () {
        var cleave = new Cleave(field, {
            blocks:     [3, 3, 3, 3],
            delimiters: ['-', '~']
        });

        cleave.modify({
            delimiters: ['~', ':']
        });

        cleave.setRawValue('123456789000');
        assert.equal(field.value, '123~456:789:000');
    });

    it('should use empty delimiter', function () {
        var cleave = new Cleave(field, {
            blocks:    [3, 3, 3],
            delimiter: ''
        });

        cleave.setRawValue('123456789');
        assert.equal(field.value, '123456789');
    });

    it('should use modified empty delimiter', function () {
        var cleave = new Cleave(field, {
            blocks:    [3, 3, 3],
            delimiter: '|'
        });

        cleave.modify({
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

    it('should use modified defined prefix', function () {
        var cleave = new Cleave(field, {
            prefix:    'UFO',
            blocks:    [3, 3],
            delimiter: '-'
        });

        cleave.modify({
            prefix: 'PRO'
        });

        cleave.setRawValue('PRO123');
        assert.equal(field.value, 'PRO-123');
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

    it('should trim prefix when rawValueTrimPrefix is changed from not enabled to enabled', function () {
        var cleave = new Cleave(field, {
            prefix:  '$',
            numeral: true
        });

        cleave.modify({
            rawValueTrimPrefix: true
        });

        cleave.setRawValue('1234.56');
        assert.equal(cleave.getRawValue(), '1234.56');
    });

    it('should not trim prefix when rawValueTrimPrefix is changed from enabled to not enabled', function () {
        var cleave = new Cleave(field, {
            prefix:  '$',
            rawValueTrimPrefix: true,
            numeral: true
        });

        cleave.modify({
            rawValueTrimPrefix: false
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

    it('should not use numeric only option on modification', function () {
        var cleave = new Cleave(field, {
            numericOnly: true,
            blocks:      [3, 3, 3]
        });

        cleave.modify({
            numericOnly: false
        });

        cleave.setRawValue('12a3b4c5');
        assert.equal(field.value, '12a 3b4 c5');
    });

    it('should use uppercase option', function () {
        var cleave = new Cleave(field, {
            uppercase: true,
            blocks:    [3, 3, 3]
        });

        cleave.setRawValue('abcdef');
        assert.equal(field.value, 'ABC DEF ');
    });

    it('should not use uppercase option on modification', function () {
        var cleave = new Cleave(field, {
            uppercase: true,
            blocks:    [3, 3, 3]
        });

        cleave.modify({
            uppercase: false
        });

        cleave.setRawValue('abcdef');
        assert.equal(field.value, 'abc def ');
    });

    it('should use lowercase option', function () {
        var cleave = new Cleave(field, {
            lowercase: true,
            blocks:    [3, 3, 3]
        });

        cleave.setRawValue('ABCDEF');
        assert.equal(field.value, 'abc def ');
    });

    it('should not use lowercase option on modification', function () {
        var cleave = new Cleave(field, {
            lowercase: true,
            blocks:    [3, 3, 3]
        });

        cleave.modify({
            lowercase: false
        });

        cleave.setRawValue('ABCDEF');
        assert.equal(field.value, 'ABC DEF ');
    });
});
