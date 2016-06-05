/* jslint node: true */
/* global window: true, module: true, exports: true */

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

    owner.prefix = opts.prefix || '';

    owner.delimiter = opts.delimiter || ' ';
    owner.delimiterRE = new RegExp(owner.delimiter, "g");

    owner.regionCode = opts.regionCode || '';

    owner.creditCard = !!opts.creditCard;
    owner.creditCardStrictMode = !!opts.creditCardStrictMode;

    owner.numericOnly = owner.creditCard || !!owner.numericOnly;

    owner.phone = !!opts.phone;

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
        if (!owner.phone && !owner.creditCard && owner.blocks.length === 0) {
            return;
        }

        owner.element.addEventListener('input', owner.onInput.bind(owner));
        owner.element.addEventListener('keydown', owner.onKeydown.bind(owner));

        owner.element.value = owner.prefix;

        owner.initPhoneNumberFormatter();

        owner.onInput();
    },

    initPhoneNumberFormatter: function () {
        var owner = this;

        if (!owner.phone) {
            return;
        }

        // Cleave.AsYouTypeFormatter should be provided by
        // external google closure lib
        try {
            owner.phoneNumberFormatter = new Cleave.PhoneNumberFormatter(
                new window.Cleave.AsYouTypeFormatter(owner.regionCode),
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
            prev = value;

        // case 1: delete one more character "4"
        // 1234*| -> hit backspace -> 123|
        // case 2: last character is not delimiter which is:
        // 12|34* -> hit backspace -> 1|34*

        if (owner.backspace && value.slice(-1) !== owner.delimiter) {
            value = Cleave.utils.headStr(value, value.length - 1);
        }

        // phone formatter
        if (owner.phone) {
            owner.element.value = owner.phoneNumberFormatter.format(value);

            return;
        }

        // strip delimiters
        value = Cleave.utils.strip(value, owner.delimiterRE);

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

    setRegionCode: function (regionCode) {
        var owner = this;

        owner.regionCode = regionCode;
        owner.initPhoneNumberFormatter();
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
    // CommonJS
    Cleave.CreditCardDetector = require('./shortcuts/CreditCardDetector');
    Cleave.PhoneNumberFormatter = require('./shortcuts/PhoneNumberFormatter');

    module.exports = exports = Cleave;

} else if (typeof window === 'object') {
    // normal way
    window.Cleave = Cleave;
}
