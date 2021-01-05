describe('Datetime input field', function () {
    var field = document.querySelector('.input-datetime');
    var cleave = new Cleave(field, {
        date: true,
        time: true,
        delimiters: ['/', '/', ' ', ':', ':']
    });

    it('should format fully matched input value', function () {
        cleave.setRawValue('11041965220457');
        assert.equal(field.value, '11/04/1965 22:04:57');
    });

    it('should format partially matched date input value', function () {
        cleave.setRawValue('1207');
        assert.equal(field.value, '12/07/');
    });

    it('should format partially matched time input value', function () {
        cleave.setRawValue('1207201111');
        assert.equal(field.value, '12/07/2011 11:');
    });
});

describe('Datetime input field with pattern and delimiter', function () {
    var field = document.querySelector('.input-datetime');
    var cleave = new Cleave(field, {
        date:        true,
        datePattern: ['Y', 'm', 'd'],
        time:        true,
        timePattern: ['h', 'm', 's'],
        delimiters: ['-', '/', ' && ', ':', '.']
    });

    it('should format fully matched input value', function () {
        cleave.setRawValue('19650430113359');
        assert.equal(field.value, '1965-04/30 && 11:33.59');
    });
});

describe('ISO date', function () {
    var field = document.querySelector('.input-datetime');
    var cleave = new Cleave(field, {
        date:        true,
        datePattern: ['m', 'Y', 'd'],
        time:        true,
        timePattern: ['h', 's', 'm'],
        delimiters: ['/', '/', ' ', ':', ':']
    });

    it('should get correct ISO date', function () {
        cleave.setRawValue('04196511185502');
        assert.equal(cleave.getISOFormatDateTime(), '1965-04-11T18:02:55');
    });
});
