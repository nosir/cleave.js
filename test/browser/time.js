describe('Time input field', function () {
    var field = document.querySelector('.input-time');
    var cleave = new Cleave(field, {
        time: true
    });

    it('should format fully matched input value', function () {
        cleave.setRawValue('231515');
        assert.equal(field.value, '23:15:15');
    });

    it('should format partially matched input value', function () {
        cleave.setRawValue('2315');
        assert.equal(field.value, '23:15:');
    });

    it('should correct large time hour to 23', function () {
        cleave.setRawValue('25');
        assert.equal(field.value, '23:');
    });

    it('should correct large time hour to add leading 0', function () {
        cleave.setRawValue('4');
        assert.equal(field.value, '04:');
    });

    it('should correct large min to add leading 0', function () {
        cleave.setRawValue('147');
        assert.equal(field.value, '14:07:');
    });

    it('should correct large sec to add leading 0', function () {
        cleave.setRawValue('14147');
        assert.equal(field.value, '14:14:07');
    });
});

describe('Date input field with pattern', function () {
    var field = document.querySelector('.input-time');
    var cleave = new Cleave(field, {
        time:        true,
        timePattern: ['m', 's']
    });

    it('should format fully matched input value', function () {
        cleave.setRawValue('5555');
        assert.equal(field.value, '55:55');
    });
});

describe('ISO time', function () {
    var field = document.querySelector('.input-time');
    var cleave = new Cleave(field, {
        time:        true,
        timePattern: ['h', 'm', 's']
    });

    it('should get correct ISO time', function () {
        cleave.setRawValue('808080');
        assert.equal(cleave.getISOFormatTime(), '08:08:08');
    });
});
