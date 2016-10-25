var _ = require('underscore');
var PhoneFormatter = require('../../src/shortcuts/PhoneFormatter');

// this one exports the module for CommonJS mode
// which is different from the prod ones
var PhoneTypeFormatter = require('../addons/phone-type-formatter.i18n.js');

var phones = require('../fixtures/phone.json');

describe('PhoneFormatter', function () {
    describe('format', function () {
        _.mapObject(phones.format, function (formats, key) {
            var phoneNumberFormatter = new PhoneFormatter(new PhoneTypeFormatter.Cleave.AsYouTypeFormatter(key));

            _.each(formats, function (format) {
                it('should format ' + key + ' phone number ' + format[0] + ' to ' + format[1], function () {
                    phoneNumberFormatter.format(format[0]).should.eql(format[1]);
                });
            });
        });
    });

    describe('delimiter', function () {
        var delimiter = phones.delimiter;

        var phoneNumberFormatter = new PhoneFormatter(new PhoneTypeFormatter.Cleave.AsYouTypeFormatter(delimiter.region), delimiter.sign);

        _.each(delimiter.format, function (format) {
            it('should format ' + delimiter.region + ' phone number ' + format[0] + ' to ' + format[1], function () {
                phoneNumberFormatter.format(format[0]).should.eql(format[1]);
            });
        });
    });

    describe('delimiter off', function () {
        var delimiter = phones.delimiterOff;

        var phoneNumberFormatter = new PhoneFormatter(new PhoneTypeFormatter.Cleave.AsYouTypeFormatter(delimiter.region), delimiter.sign);

        _.each(delimiter.format, function (format) {
            it('should format ' + delimiter.region + ' phone number ' + format[0] + ' to ' + format[1], function () {
                phoneNumberFormatter.format(format[0]).should.eql(format[1]);
            });
        });
    });
});
