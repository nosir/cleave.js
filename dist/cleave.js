;(function(window, document, undefined) {

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

        // no need to use this lib
        if (!pps.numeral && !pps.phone && !pps.creditCard && !pps.date && pps.blocks.length === 0) {
            return;
        }

        pps.maxLength = Cleave.Util.getMaxLength(pps.blocks);

        owner.element.addEventListener('input', owner.onChange.bind(owner));
        owner.element.addEventListener('keydown', owner.onKeydown.bind(owner));

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
            pps.delimiter
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

    onKeydown: function (event) {
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
            pps.result = pps.numeralFormatter.format(value);
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

        // strip non-numeric characters
        if (pps.numericOnly) {
            value = Util.strip(value, /[^\d]/g);
        }

        // update credit card blocks
        // and at least one of first 4 characters has changed
        if (pps.creditCard && Util.headStr(pps.result, 4) !== Util.headStr(value, 4)) {
            pps.blocks = Cleave.CreditCardDetector.getBlocksByPAN(value, pps.creditCardStrictMode);
            pps.blocksLength = pps.blocks.length;
            pps.maxLength = Util.getMaxLength(pps.blocks);
        }

        // strip over length characters
        value = Util.headStr(value, pps.maxLength);

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
    Cleave.Util = require('./utils/Util');
    Cleave.DefaultProperties = require('./common/DefaultProperties');

    // CommonJS
    module.exports = exports = Cleave;
}

'use strict';

var Util = {
    noop: function () {
    },

    strip: function (value, re) {
        return value.replace(re, '');
    },

    headStr: function (str, length) {
        return str.slice(0, length);
    },

    getMaxLength: function (blocks) {
        return blocks.reduce(function (previous, current) {
            return previous + current;
        }, 0);
    },

    getPrefixAppliedValue: function (value, prefix) {
        var prefixLength = prefix.length,
            prefixLengthValue;

        if (prefixLength === 0) {
            return value;
        }

        prefixLengthValue = value.slice(0, prefixLength);

        if (prefixLengthValue.length < prefixLength) {
            value = prefix;
        } else if (prefixLengthValue !== prefix) {
            value = prefix + value.slice(prefixLength);
        }

        return value;
    },

    getFormattedValue: function (value, blocks, blocksLength, delimiter) {
        var result = '';

        blocks.forEach(function (length, index) {
            if (value.length > 0) {
                var sub = value.slice(0, length),
                    rest = value.slice(length);

                result += sub;

                if (sub.length === length && index < blocksLength - 1) {
                    result += delimiter;
                }

                // update remaining string
                value = rest;
            }
        });

        return result;
    }
};

if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = exports = Util;
}

'use strict';

/**
 * Props Assignment
 *
 * Separate this, so react module can share the usage
 */
var DefaultProperties = {
    // Maybe change to object-assign
    // for now just keep it as simple
    assign: function (target, opts) {
        target = target || {};
        opts = opts || {};

        // credit card
        target.creditCard = !!opts.creditCard;
        target.creditCardStrictMode = !!opts.creditCardStrictMode;

        // phone
        target.phone = !!opts.phone;
        target.phoneRegionCode = opts.phoneRegionCode || 'AU';
        target.phoneFormatter = {};

        // date
        target.date = !!opts.date;
        target.datePattern = opts.datePattern || ['d', 'm', 'Y'];
        target.dateFormatter = {};

        // numeral
        target.numeral = !!opts.numeral;
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

'use strict';

var CreditCardDetector = {
    blocks: {
        uatp:          [4, 5, 6],
        amex:          [4, 6, 5],
        diners:        [4, 6, 4],
        mastercard:    [4, 4, 4, 4],
        dankort:       [4, 4, 4, 4],
        instapayment:  [4, 4, 4, 4],
        jcb:           [4, 4, 4, 4],
        generalStrict: [4, 4, 4, 7],
        generalLoose:  [4, 4, 4, 4]
    },

    re: {
        // starts with 1; 15 digits, not starts with 1800 (jcb card)
        uatp: /^(?!1800)1\d{0,14}/,

        // starts with 34/37; 15 digits
        amex: /^3[47]\d{0,13}/,

        // starts with 300-305/309 or 36/38/39; 14 digits
        diners: /^3(?:0([0-5]|9)|[689]\d?)\d{0,11}/,

        // starts with 51-55 or 22-27; 16 digits
        mastercard: /^(5[1-5]|2[2-7])\d{0,14}/,

        // starts with 5019/4175/4571; 16 digits
        dankort: /^(5019|4175|4571)\d{0,12}/,

        // starts with 637-639; 16 digits
        instapayment: /^63[7-9]\d{0,13}/,

        // starts with 2131/1800/35; 16 digits
        jcb: /^(?:2131|1800|35\d{0,2})\d{0,12}/
    },

    getBlocksByPAN: function (value, strictMode) {
        var blocks = CreditCardDetector.blocks,
            re = CreditCardDetector.re;

        // In theory, credit card can have up to 19 digits number.
        // Set strictMode to true will remove the 16 max-length restrain,
        // however, I never found any website validate card number like
        // this, hence probably you don't need to enable this option.
        strictMode = !!strictMode;

        if (re.amex.test(value)) {
            return blocks.amex;
        } else if (re.uatp.test(value)) {
            return blocks.uatp;
        } else if (re.diners.test(value)) {
            return blocks.diners;
        } else if (re.mastercard.test(value)) {
            return blocks.mastercard;
        } else if (re.dankort.test(value)) {
            return blocks.dankort;
        } else if (re.instapayment.test(value)) {
            return blocks.instapayment;
        } else if (re.jcb.test(value)) {
            return blocks.jcb;
        } else if (strictMode) {
            return blocks.generalStrict;
        } else {
            return blocks.generalLoose;
        }
    }
};

if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = exports = CreditCardDetector;
}

'use strict';

var DateFormatter = function (datePattern) {
    var owner = this;

    owner.blocks = [];
    owner.datePattern = datePattern;
    owner.initBlocks();
};

DateFormatter.prototype = {
    initBlocks: function () {
        var owner = this;
        owner.datePattern.forEach(function (value) {
            if (value === 'Y') {
                owner.blocks.push(4);
            } else {
                owner.blocks.push(2);
            }
        });
    },

    getBlocks: function () {
        return this.blocks;
    },

    getValidatedDate: function (value) {
        var owner = this, result = '';

        value = value.replace(/[^\d]/g, '');

        owner.blocks.forEach(function (length, index) {
            if (value.length > 0) {
                var sub = value.slice(0, length),
                    rest = value.slice(length);

                switch (owner.datePattern[index]) {
                case 'd':
                    if (parseInt(sub, 10) > 31) {
                        sub = '31';
                    }
                    break;
                case 'm':
                    if (parseInt(sub, 10) > 12) {
                        sub = '12';
                    }
                    break;
                }

                result += sub;

                // update remaining string
                value = rest;
            }
        });

        return result;
    }
};

if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = exports = DateFormatter;
}

'use strict';

var NumeralFormatter = function (numeralDecimalMark,
                                 numeralDecimalScale,
                                 numeralThousandsGroupStyle,
                                 delimiter) {
    var owner = this;

    owner.numeralDecimalMark = numeralDecimalMark || '.';
    owner.numeralDecimalScale = numeralDecimalScale || 2;
    owner.numeralThousandsGroupStyle = numeralThousandsGroupStyle || NumeralFormatter.groupStyle.thousand;
    owner.delimiter = delimiter || ',';
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
            .replace('M', owner.numeralDecimalMark)

            // strip leading 0
            .replace(/^(-)?0+(?=\d)/, '$1');

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

'use strict';

var PhoneFormatter = function (formatter, delimiter) {
    var owner = this;

    owner.delimiter = delimiter || ' ';
    owner.delimiterRE = new RegExp(owner.delimiter, 'g');
    owner.formatter = formatter;
};

PhoneFormatter.prototype = {
    setFormatter: function (formatter) {
        this.formatter = formatter;
    },

    format: function (phoneNumber) {
        var owner = this;

        owner.formatter.clear();

        // only keep number and +
        phoneNumber = phoneNumber.replace(/[^\d+]/g, '');

        // strip delimiter
        phoneNumber = phoneNumber.replace(owner.delimiterRE, '');

        var result = '', current, validated = false;

        for (var i = 0, iMax = phoneNumber.length; i < iMax; i++) {
            current = owner.formatter.inputDigit(phoneNumber.charAt(i));

            // has ()- or space inside
            if (/[\s()-]/g.test(current)) {
                result = current;

                validated = true;
            } else {
                if (!validated) {
                    result = current;
                }
                // else: over length input
                // it turns to invalid number again
            }
        }

        // strip ()
        // e.g. US: 7161234567 returns (716) 123-4567
        result = result.replace(/[()]/g, '');
        // replace library delimiter with user customized delimiter
        result = result.replace(/[\s-]/g, owner.delimiter);

        return result;
    }
};

if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = exports = PhoneFormatter;
}

Cleave.NumeralFormatter = NumeralFormatter;
Cleave.DateFormatter = DateFormatter;
Cleave.PhoneFormatter = PhoneFormatter;
Cleave.CreditCardDetector = CreditCardDetector;
Cleave.Util = Util;
Cleave.DefaultProperties = DefaultProperties;

if (typeof module === 'object' && typeof module.exports === 'object') {
    // CommonJS
    module.exports = exports = Cleave;

} else if (typeof define === 'function' && define.amd) {
    // AMD support
    define(function () {
        return Cleave;
    });

} else if (typeof window === 'object') {
    // Normal way
    window.Cleave = Cleave;
}

})(window, document);
