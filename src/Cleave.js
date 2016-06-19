/* jslint node: true */
/* global window: true, document: true */

'use strict';

/**
 * Construct a new Cleave instance by passing the configuration object
 *
 * @param {Object} opts
 * @param {String / HTMLElement} element
 */
var Cleave = function (element, opts) {
    var owner = this;

    // selector
    if (typeof element === 'string') {
        owner.element = document.querySelector(element);
    }
    // nothing
    else if (typeof element.length === 'undefined') {
        return;
    }
    // first element
    else {
        owner.element = element.length > 0 ? element[0] : element;
    }

    opts = opts || {};

    // credit card
    owner.creditCard = !!opts.creditCard;
    owner.creditCardStrictMode = !!opts.creditCardStrictMode;

    // phone
    owner.phone = !!opts.phone;
    owner.phoneRegionCode = opts.phoneRegionCode || '';
    owner.phoneFormatter = {};

    // date
    owner.date = !!opts.date;
    owner.datePattern = opts.datePattern || ['d', 'm', 'Y'];
    owner.dateFormatter = {};

    // numeral
    owner.numeral = !!opts.numeral;
    owner.numeralDecimalScale = opts.numeralDecimalScale || 2;
    owner.numeralDecimalMark = opts.numeralDecimalMark || '.';
    owner.numeralThousandsGroupStyle = opts.numeralThousandsGroupStyle || 'thousand';

    owner.numericOnly = owner.creditCard || owner.date || !!opts.numericOnly;

    owner.prefix = (owner.creditCard || owner.phone || owner.date) ? '' : (opts.prefix || '');
    owner.prefixLength = owner.prefix.length;

    owner.delimiter = opts.delimiter || (owner.date ? '/' : (owner.numeral ? ',' : ' '));
    owner.delimiterRE = new RegExp(owner.delimiter, "g");

    owner.blocks = opts.blocks || [];
    owner.blocksLength = owner.blocks.length;

    owner.maxLength = owner.getMaxLength();

    owner.backspace = false;
    owner.result = '';

    owner.init();
};

Cleave.utils = {
    strip: function (value, re) {
        return value.replace(re, '');
    },

    headStr: function (str, length) {
        return str.slice(0, length);
    }
};

Cleave.prototype = {
    init: function () {
        var owner = this;

        // so no need for this lib at all
        if (!owner.numeral && !owner.phone && !owner.creditCard && !owner.date && owner.blocks.length === 0) {
            return;
        }

        owner.element.addEventListener('input', owner.onInput.bind(owner));
        owner.element.addEventListener('keydown', owner.onKeydown.bind(owner));

        owner.element.value = owner.prefix;

        owner.initPhoneFormatter();
        owner.initDateFormatter();
        owner.initNumeralFormatter();

        owner.onInput();
    },

    initNumeralFormatter: function () {
        var owner = this;

        if (!owner.numeral) {
            return;
        }

        owner.numeralFormatter = new Cleave.NumeralFormatter(
            owner.numeralDecimalMark,
            owner.numeralDecimalScale,
            owner.numeralThousandsGroupStyle,
            owner.delimiter
        );
    },

    initDateFormatter: function () {
        var owner = this;

        if (!owner.date) {
            return;
        }

        owner.dateFormatter = new Cleave.DateFormatter(owner.datePattern);
        owner.blocks = owner.dateFormatter.getBlocks();
        owner.blocksLength = owner.blocks.length;
        owner.maxLength = owner.getMaxLength();
    },

    initPhoneFormatter: function () {
        var owner = this;

        if (!owner.phone) {
            return;
        }

        // Cleave.AsYouTypeFormatter should be provided by
        // external google closure lib
        try {
            owner.phoneFormatter = new Cleave.PhoneFormatter(
                new window.Cleave.AsYouTypeFormatter(owner.phoneRegionCode),
                owner.delimiter
            );
        } catch (ex) {
            throw new Error('Please include phone-type-formatter.{country}.js lib');
        }
    },

    onKeydown: function (event) {
        var owner = this,
            charCode = event.which || event.keyCode;

        // hit backspace when last character is delimiter
        if (charCode === 8 && owner.element.value.slice(-1) === owner.delimiter) {
            owner.backspace = true;

            return;
        }

        owner.backspace = false;
    },

    getMaxLength: function () {
        return this.blocks.reduce(function (previous, current) {
            return previous + current;
        }, 0);
    },

    onInput: function () {
        var owner = this,
            value = owner.element.value,
            prev = value,
            prefixLengthValue;

        // case 1: delete one more character "4"
        // 1234*| -> hit backspace -> 123|
        // case 2: last character is not delimiter which is:
        // 12|34* -> hit backspace -> 1|34*

        if (owner.backspace && value.slice(-1) !== owner.delimiter) {
            value = Cleave.utils.headStr(value, value.length - 1);
        }

        // phone formatter
        if (owner.phone) {
            owner.element.value = owner.phoneFormatter.format(value);

            return;
        }

        // numeral formatter
        if (owner.numeral) {
            owner.element.value = owner.numeralFormatter.format(value);

            return;
        }

        // date
        if (owner.date) {
            value = owner.dateFormatter.getValidatedDate(value);
        }

        // strip delimiters
        value = Cleave.utils.strip(value, owner.delimiterRE);

        // prefix
        if (owner.prefix.length > 0) {
            prefixLengthValue = Cleave.utils.headStr(value, owner.prefixLength);

            if (prefixLengthValue.length < owner.prefixLength) {
                value = owner.prefix;
            } else if (prefixLengthValue !== owner.prefix) {
                value = owner.prefix + value.slice(owner.prefixLength);
            }
        }

        // strip non-numeric characters
        if (owner.numericOnly) {
            value = Cleave.utils.strip(value, /[^\d]/g);
        }

        // update credit card blocks
        // and at least one of first 4 characters has changed
        if (owner.creditCard && Cleave.utils.headStr(owner.result, 4) !== Cleave.utils.headStr(value, 4)) {
            owner.blocks = Cleave.CreditCardDetector.getBlocksByPAN(value, owner.creditCardStrictMode);
            owner.blocksLength = owner.blocks.length;
            owner.maxLength = owner.getMaxLength();
        }

        // strip over length characters
        value = Cleave.utils.headStr(value, owner.maxLength);

        // apply blocks
        owner.result = '';

        owner.blocks.forEach(function (length, index) {
            if (value.length > 0) {
                var sub = value.slice(0, length),
                    rest = value.slice(length);

                owner.result += sub;

                if (sub.length === length && index < owner.blocksLength - 1) {
                    owner.result += owner.delimiter;
                }

                // update remaining string
                value = rest;
            }
        });

        if (prev === owner.result) {
            return;
        }

        owner.element.value = owner.result;
    },

    setPhoneRegionCode: function (phoneRegionCode) {
        var owner = this;

        owner.phoneRegionCode = phoneRegionCode;
        owner.initPhoneFormatter();
        owner.onInput();
    },

    setValue: function (value) {
        var owner = this;

        owner.element.value = value;
        owner.onInput();
    },

    getValue: function () {
        return Cleave.utils.strip(this.element.value, this.delimiterRE);
    },

    destroy: function () {
        var owner = this;

        owner.element.removeEventListener('input', owner.onInput.bind(owner));
        owner.element.removeEventListener('keydown', owner.onKeydown.bind(owner));
    },

    toString: function () {
        return '[Cleave Object]';
    }
};

if (typeof module === 'object' && typeof module.exports === 'object') {
    Cleave.NumeralFormatter = require('./shortcuts/NumeralFormatter');
    Cleave.DateFormatter = require('./shortcuts/DateFormatter');
    Cleave.PhoneFormatter = require('./shortcuts/PhoneFormatter');
    Cleave.CreditCardDetector = require('./shortcuts/CreditCardDetector');

    // CommonJS
    module.exports = exports = Cleave;
}
