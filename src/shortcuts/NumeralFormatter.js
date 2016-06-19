/*jslint node: true */
/* global module: true, exports: true */

'use strict';

var NumeralFormatter = function (numeralDecimalMark,
                                 numeralDecimalScale,
                                 numeralThousandsGroupStyle,
                                 delimiter) {
    var owner = this;

    owner.numeralDecimalMark = numeralDecimalMark;
    owner.numeralDecimalScale = numeralDecimalScale;
    owner.numeralThousandsGroupStyle = numeralThousandsGroupStyle;
    owner.delimiter = delimiter;
};

NumeralFormatter.groupStyle = {
    thousand: 'thousand',
    lakh:     'lakh',
    wan:      'wan'
};

NumeralFormatter.prototype = {
    format: function (value) {
        var owner = this, parts, partInteger, partDecimal = '';

        // strip alphabet letters
        value = value.replace(/[A-Za-z]/g, '')

            // replace the first decimal mark with reserved placeholder
            .replace(owner.numeralDecimalMark, 'M')

            // strip the non numeric letters except M
            .replace(/[^\dM]/g, '')

            // replace mark
            .replace('M', owner.numeralDecimalMark);

        partInteger = value;

        if (value.indexOf(owner.numeralDecimalMark) >= 0) {
            parts = value.split(owner.numeralDecimalMark);
            partInteger = parts[0];
            partDecimal = owner.numeralDecimalMark + parts[1].slice(0, owner.numeralDecimalScale);
        }

        switch (owner.numeralThousandsGroupStyle) {
        case NumeralFormatter.groupStyle.lakh:
            partInteger = partInteger.replace(/(\d)(?=(\d\d)+\d$)/g, '$1' + owner.delimiter);

            break;

        case NumeralFormatter.groupStyle.wan:
            partInteger = partInteger.replace(/(\d)(?=(\d{4})+$)/g, '$1' + owner.delimiter);

            break;

        default:
            partInteger = partInteger.replace(/(\d)(?=(\d{3})+$)/g, '$1' + owner.delimiter);
        }

        return partInteger.toString() + partDecimal.toString();
    }
};

if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = exports = NumeralFormatter;
}
