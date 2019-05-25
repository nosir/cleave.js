var _ = require('underscore');
var NumeralFormatter = require('../../src/shortcuts/NumeralFormatter');
var numerals = require('../fixtures/numeral.json');

describe('NumeralFormatter', function () {
    _.each(numerals, function (numeral) {
        var title = [];

        if (numeral.thousandsGroupStyle) {
            title.push('Thousands Group Style: ' + numeral.thousandsGroupStyle);
        }

        if (numeral.numeralIntegerScale) {
            title.push('Integer Scale: ' + numeral.numeralIntegerScale);
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

        if (numeral.stripLeadingZeroes) {
            title.push('Strip leading zeroes:' + numeral.stripLeadingZeroes);
        }

        if (numeral.prefix) {
            title.push('Prefix:' + numeral.prefix);
        }

        if (numeral.signBeforePrefix) {
            title.push('Sign before prefix:' + numeral.signBeforePrefix);
        }

        describe(title.join(', '), function () {
            var numeralFormatter = new NumeralFormatter(
                numeral.numeralDecimalMark,
                numeral.numeralIntegerScale,
                numeral.numeralDecimalScale,
                numeral.thousandsGroupStyle,
                numeral.numeralPositiveOnly,
                numeral.stripLeadingZeroes,
                numeral.prefix,
                numeral.signBeforePrefix,
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
