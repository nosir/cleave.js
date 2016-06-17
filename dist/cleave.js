;(function(window, document, undefined) {

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

/*jslint node: true */
/* global module: true, exports: true */

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

// for unit tests spec to load module easily
if (typeof global !== 'undefined' && {}.toString.call(global) === '[object global]' &&
    typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = exports = CreditCardDetector;
}

/*jslint node: true */
/* global module: true, exports: true */

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

// for unit tests spec to load module easily
if (typeof global !== 'undefined' && {}.toString.call(global) === '[object global]' &&
    typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = exports = DateFormatter;
}

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

// for unit tests spec to load module easily
if (typeof global !== 'undefined' && {}.toString.call(global) === '[object global]' &&
    typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = exports = NumeralFormatter;
}

/*jslint node: true */
/* global module: true, exports: true */

'use strict';

var PhoneFormatter = function (formatter, delimiter) {
    var owner = this;

    owner.delimiter = delimiter || ' ';
    owner.delimiterRE = new RegExp(owner.delimiter, "g");
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

// for unit tests spec to load module easily
if (typeof global !== 'undefined' && {}.toString.call(global) === '[object global]' &&
    typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = exports = PhoneFormatter;
}

Cleave.NumeralFormatter = NumeralFormatter;
Cleave.DateFormatter = DateFormatter;
Cleave.PhoneFormatter = PhoneFormatter;
Cleave.CreditCardDetector = CreditCardDetector;

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
