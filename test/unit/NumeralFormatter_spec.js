var _ = require('underscore');
var NumeralFormatter = require('../../src/shortcuts/NumeralFormatter');
var numerals = require('../fixtures/numeral.json');

describe('NumeralFormatter', function () {
    _.each(numerals, function (numeral) {
        var title = [];

        if (numeral.thousandsGroupStyle) {
            title.push('Thousands Group Style: ' + numeral.thousandsGroupStyle);
        }

        if (numeral.numeralDecimalScale || numeral.numeralDecimalScale === 0) {
            title.push('Decimal Scale: ' + numeral.numeralDecimalScale);
        }

        if (numeral.numeralDecimalMark) {
            title.push('Decimal Mark: ' + numeral.numeralDecimalMark);
        }

        if (numeral.delimiter) {
            title.push('Delimiter: ' + numeral.delimiter);
        }

        if (numeral.delimiterOff) {
            title.push('Delimiter Off: ' + numeral.delimiterOff);
        }

        if (numeral.numeralPositiveOnly) {
            title.push('Positive Only: ' + numeral.numeralPositiveOnly);
        }

        describe(title.join(', '), function () {
            var numeralFormatter = new NumeralFormatter(
                numeral.numeralDecimalMark,
                numeral.numeralDecimalScale,
                numeral.thousandsGroupStyle,
                numeral.numeralPositiveOnly,
                numeral.delimiter
            );

            _.each(numeral.numbers, function (number) {
                it('should convert number ' + number[0] + ' to ' + number[1], function () {
                    numeralFormatter.format(number[0]).should.eql(number[1]);
                });
            });
        });
    });
});
