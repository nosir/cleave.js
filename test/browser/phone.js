describe('Phone number input field', function () {
    var field = document.querySelector('.input-phone');
    var cleave = new Cleave(field, {
        phone:           true,
        phoneRegionCode: 'AU'
    });

    it('should format fully matched input value', function () {
        cleave.setRawValue('0416123456');
        assert.equal(field.value, '0416 123 456');
    });

    it('should format partially matched input value', function () {
        cleave.setRawValue('0416123');
        assert.equal(field.value, '0416 123');
    });

    it('should format input value with country code', function () {
        cleave.setRawValue('+61416123');
        assert.equal(field.value, '+61 416 123');
    });
});
