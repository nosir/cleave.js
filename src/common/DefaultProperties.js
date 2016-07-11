'use strict';

/**
 * Props Assignment
 *
 * Separate this, so react module can share the usage
 */
var DefaultProperties = {
    mode: {
        creditCard: 'creditCard',
        phone:      'phone',
        date:       'date',
        numeral:    'numeral',
        custom:     'custom'
    },

    // Maybe change to object-assign
    // for now just keep it as simple
    assign: function (target, opts) {
        target = target || {};
        opts = opts || {};

        target.mode = opts.mode || DefaultProperties.mode.custom;

        // credit card
        target.creditCard = (target.mode === DefaultProperties.mode.creditCard);
        target.creditCardStrictMode = !!opts.creditCardStrictMode;
        target.creditCardType = '';
        target.onCreditCardTypeChanged = opts.onCreditCardTypeChanged || (function () {
            });

        // phone
        target.phone = (target.mode === DefaultProperties.mode.phone);
        target.phoneRegionCode = opts.phoneRegionCode || 'AU';
        target.phoneFormatter = {};

        // date
        target.date = (target.mode === DefaultProperties.mode.date);
        target.datePattern = opts.datePattern || ['d', 'm', 'Y'];
        target.dateFormatter = {};

        // numeral
        target.numeral = (target.mode === DefaultProperties.mode.numeral);
        target.numeralDecimalScale = opts.numeralDecimalScale || 2;
        target.numeralDecimalMark = opts.numeralDecimalMark || '.';
        target.numeralThousandsGroupStyle = opts.numeralThousandsGroupStyle || 'thousand';

        // others
        target.initValue = opts.initValue || '';

        target.numericOnly = target.creditCard || target.date || !!opts.numericOnly;

        target.uppercase = !!opts.uppercase;
        target.lowercase = !!opts.lowercase;

        target.prefix = (target.creditCard || target.phone || target.date) ? '' : (opts.prefix || '');

        target.delimiter = opts.delimiter || (target.date ? '/' : (target.numeral ? ',' : ' '));
        target.delimiterRE = new RegExp(target.delimiter, 'g');

        target.blocks = opts.blocks || [];
        target.blocksLength = target.blocks.length;

        target.maxLength = 0;

        target.backspace = false;
        target.result = '';

        return target;
    }
};

if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = exports = DefaultProperties;
}
