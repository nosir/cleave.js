'use strict';

/**
 * Construct a new Cleave instance by passing the configuration object
 *
 * @param {Object} opts
 * @param {String / HTMLElement} element
 */
var Cleave = function (element, opts) {
    var owner = this;

    if (typeof element === 'string') {
        owner.element = document.querySelector(element);
    } else {
        owner.element = ((typeof element.length !== 'undefined') && element.length > 0) ? element[0] : element;
    }

    opts.initValue = owner.element.value;

    owner.properties = Cleave.DefaultProperties.assign({}, opts);

    owner.init();
};

Cleave.prototype = {
    init: function () {
        var owner = this, pps = owner.properties;
        
        // make sure that prefix has a value, even if it's an empty string
        pps.prefix = (!pps.prefix) ? '' : pps.prefix;

        // no need to use this lib
        if (!pps.numeral && !pps.phone && !pps.creditCard && !pps.date && pps.blocks.length === 0 && pps.prefix === '') {
            return;
        }

        if(pps.blocks.length) {
            pps.maxLength = Cleave.Util.getMaxLength(pps.blocks);
        }

        owner.element.addEventListener('input', owner.onChange.bind(owner));
        owner.element.addEventListener('keydown', owner.onKeyDown.bind(owner));

        owner.initPhoneFormatter();
        owner.initDateFormatter();
        owner.initNumeralFormatter();

        owner.onInput(pps.initValue);
    },

    initNumeralFormatter: function () {
        var owner = this, pps = owner.properties;

        if (!pps.numeral) {
            return;
        }

        pps.numeralFormatter = new Cleave.NumeralFormatter(
            pps.numeralDecimalMark,
            pps.numeralDecimalScale,
            pps.numeralThousandsGroupStyle,
            pps.delimiter,
            pps.prefix
        );
    },

    initDateFormatter: function () {
        var owner = this, pps = owner.properties;

        if (!pps.date) {
            return;
        }

        pps.dateFormatter = new Cleave.DateFormatter(pps.datePattern);
        pps.blocks = pps.dateFormatter.getBlocks();
        pps.blocksLength = pps.blocks.length;
        pps.maxLength = Cleave.Util.getMaxLength(pps.blocks);
    },

    initPhoneFormatter: function () {
        var owner = this, pps = owner.properties;

        if (!pps.phone) {
            return;
        }

        // Cleave.AsYouTypeFormatter should be provided by
        // external google closure lib
        try {
            pps.phoneFormatter = new Cleave.PhoneFormatter(
                new window.Cleave.AsYouTypeFormatter(pps.phoneRegionCode),
                pps.delimiter
            );
        } catch (ex) {
            throw new Error('Please include phone-type-formatter.{country}.js lib');
        }
    },

    onKeyDown: function (event) {
        var owner = this, pps = owner.properties,
            charCode = event.which || event.keyCode;

        // hit backspace when last character is delimiter
        if (charCode === 8 && owner.element.value.slice(-1) === pps.delimiter) {
            pps.backspace = true;

            return;
        }

        pps.backspace = false;
    },

    onChange: function () {
        this.onInput(this.element.value);
    },

    onInput: function (value) {
        var owner = this, pps = owner.properties,
            prev = value,
            Util = Cleave.Util;

        // case 1: delete one more character "4"
        // 1234*| -> hit backspace -> 123|
        // case 2: last character is not delimiter which is:
        // 12|34* -> hit backspace -> 1|34*

        if (pps.backspace && value.slice(-1) !== pps.delimiter) {
            value = Util.headStr(value, value.length - 1);
        }

        // phone formatter
        if (pps.phone) {
            pps.result = pps.phoneFormatter.format(value);
            owner.updateValueState();

            return;
        }

        // numeral formatter
        if (pps.numeral) {
            var formattedNumber= pps.numeralFormatter.format(value);
            pps.result = Util.getPrefixAppliedValue(formattedNumber, pps.prefix);
            owner.updateValueState();

            return;
        }

        // date
        if (pps.date) {
            value = pps.dateFormatter.getValidatedDate(value);
        }

        // strip delimiters
        value = Util.strip(value, pps.delimiterRE);

        // prefix
        value = Util.getPrefixAppliedValue(value, pps.prefix);

        // strip non-numeric characters but preserve prefix
        if (pps.numericOnly) {
            var prefixRegExp = new RegExp('[^\\d' + pps.prefix + ']', 'g');
            value = Util.strip(value, prefixRegExp);
        }

        // update credit card props
        if (pps.creditCard) {
            owner.updateCreditCardPropsByValue(value);
        }

        // strip over length characters
        if(pps.maxLength) {
            value = Util.headStr(value, pps.maxLength);
        }

        // convert case
        value = pps.uppercase ? value.toUpperCase() : value;
        value = pps.lowercase ? value.toLowerCase() : value;

        // apply blocks
        pps.result = Util.getFormattedValue(value, pps.blocks, pps.blocksLength, pps.delimiter);

        // nothing changed
        // prevent update value to avoid caret position change
        if (prev === pps.result) {
            return;
        }

        owner.updateValueState();
    },

    updateCreditCardPropsByValue: function (value) {
        var owner = this, pps = owner.properties,
            Util = Cleave.Util,
            creditCardInfo;

        // At least one of the first 4 characters has changed
        if (Util.headStr(pps.result, 4) === Util.headStr(value, 4)) {
            return;
        }

        creditCardInfo = Cleave.CreditCardDetector.getInfo(value, pps.creditCardStrictMode);

        pps.blocks = creditCardInfo.blocks;
        pps.blocksLength = pps.blocks.length;
        pps.maxLength = Util.getMaxLength(pps.blocks);

        // credit card type changed
        if (pps.creditCardType !== creditCardInfo.type) {
            pps.creditCardType = creditCardInfo.type;

            pps.onCreditCardTypeChanged.call(owner, pps.creditCardType);
        }
    },

    updateValueState: function () {
        var owner = this;

        owner.element.value = owner.properties.result;
    },

    setPhoneRegionCode: function (phoneRegionCode) {
        var owner = this, pps = owner.properties;

        pps.phoneRegionCode = phoneRegionCode;
        owner.initPhoneFormatter();
        owner.onChange();
    },

    setRawValue: function (value) {
        var owner = this;

        owner.element.value = value;
        owner.onInput(value);
    },

    getRawValue: function () {
        var owner = this, pps = owner.properties;

        return Cleave.Util.strip(owner.element.value, pps.delimiterRE);
    },

    getFormattedValue: function () {
        return this.element.value;
    },

    destroy: function () {
        var owner = this;

        owner.element.removeEventListener('input', owner.onChange.bind(owner));
        owner.element.removeEventListener('keydown', owner.onKeyDown.bind(owner));
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
    Cleave.Util = require('./utils/Util');
    Cleave.DefaultProperties = require('./common/DefaultProperties');

    // CommonJS
    module.exports = exports = Cleave;
}
