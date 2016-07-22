(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Cleave = require('./src/Cleave.react');

var _Cleave2 = _interopRequireDefault(_Cleave);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _Cleave2.default;

},{"./src/Cleave.react":2}],2:[function(require,module,exports){
(function (global){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var React = (typeof window !== "undefined" ? window['React'] : typeof global !== "undefined" ? global['React'] : null);

var NumeralFormatter = require('./shortcuts/NumeralFormatter');
var DateFormatter = require('./shortcuts/DateFormatter');
var PhoneFormatter = require('./shortcuts/PhoneFormatter');
var CreditCardDetector = require('./shortcuts/CreditCardDetector');
var Util = require('./utils/Util');
var DefaultProperties = require('./common/DefaultProperties');

var Cleave = React.createClass({
    displayName: 'Cleave',

    componentDidMount: function componentDidMount() {
        this.init();
    },

    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        var owner = this,
            phoneRegionCode = nextProps.options.phoneRegionCode,
            newValue = nextProps.value;

        if (newValue) {
            owner.onInput(newValue);
        }

        // update phone region code
        if (phoneRegionCode && phoneRegionCode !== owner.properties.phoneRegionCode) {
            owner.properties.phoneRegionCode = phoneRegionCode;
            owner.initPhoneFormatter();
            owner.onInput(owner.properties.result);
        }
    },

    getInitialState: function getInitialState() {
        var owner = this;
        var _owner$props = owner.props;
        var value = _owner$props.value;
        var options = _owner$props.options;
        var onKeyDown = _owner$props.onKeyDown;
        var onChange = _owner$props.onChange;

        var other = _objectWithoutProperties(_owner$props, ['value', 'options', 'onKeyDown', 'onChange']);

        owner.registeredEvents = {
            onChange: onChange || Util.noop,
            onKeyDown: onKeyDown || Util.noop
        };

        options.initValue = value;

        owner.properties = DefaultProperties.assign({}, options);

        return {
            other: other,
            value: owner.properties.result
        };
    },

    init: function init() {
        var owner = this,
            pps = owner.properties;

        // so no need for this lib at all
        if (!pps.numeral && !pps.phone && !pps.creditCard && !pps.date && pps.blocksLength === 0 && !pps.prefix) {
            return;
        }

        pps.maxLength = Util.getMaxLength(pps.blocks);

        owner.initPhoneFormatter();
        owner.initDateFormatter();
        owner.initNumeralFormatter();

        owner.onInput(pps.initValue);
    },

    initNumeralFormatter: function initNumeralFormatter() {
        var owner = this,
            pps = owner.properties;

        if (!pps.numeral) {
            return;
        }

        pps.numeralFormatter = new NumeralFormatter(pps.numeralDecimalMark, pps.numeralDecimalScale, pps.numeralThousandsGroupStyle, pps.delimiter);
    },

    initDateFormatter: function initDateFormatter() {
        var owner = this,
            pps = owner.properties;

        if (!pps.date) {
            return;
        }

        pps.dateFormatter = new DateFormatter(pps.datePattern);
        pps.blocks = pps.dateFormatter.getBlocks();
        pps.blocksLength = pps.blocks.length;
        pps.maxLength = Util.getMaxLength(pps.blocks);
    },

    initPhoneFormatter: function initPhoneFormatter() {
        var owner = this,
            pps = owner.properties;

        if (!pps.phone) {
            return;
        }

        // Cleave.AsYouTypeFormatter should be provided by
        // external google closure lib
        try {
            pps.phoneFormatter = new PhoneFormatter(new window.Cleave.AsYouTypeFormatter(pps.phoneRegionCode), pps.delimiter);
        } catch (ex) {
            throw new Error('Please include phone-type-formatter.{country}.js lib');
        }
    },

    onKeyDown: function onKeyDown(event) {
        var owner = this,
            pps = owner.properties,
            charCode = event.which || event.keyCode;

        // hit backspace when last character is delimiter
        if (charCode === 8 && pps.result.slice(-1) === pps.delimiter) {
            pps.backspace = true;
        } else {
            pps.backspace = false;
        }

        owner.registeredEvents.onKeyDown(event);
    },

    onChange: function onChange(event) {
        var owner = this,
            pps = owner.properties;

        owner.onInput(event.target.value);

        if (pps.numeral) {
            event.target.rawValue = pps.numeralFormatter.getRawValue(pps.result);
        } else {
            event.target.rawValue = Util.strip(pps.result, pps.delimiterRE);
        }

        owner.registeredEvents.onChange(event);
    },

    onInput: function onInput(value) {
        var owner = this,
            pps = owner.properties,
            prev = pps.result;

        // case 1: delete one more character "4"
        // 1234*| -> hit backspace -> 123|
        // case 2: last character is not delimiter which is:
        // 12|34* -> hit backspace -> 1|34*

        if (!pps.numeral && pps.backspace && value.slice(-1) !== pps.delimiter) {
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
            pps.result = pps.prefix + pps.numeralFormatter.format(value);
            owner.updateValueState();

            return;
        }

        // date
        if (pps.date) {
            value = pps.dateFormatter.getValidatedDate(value);
        }

        // strip delimiters
        value = Util.strip(value, pps.delimiterRE);

        // strip prefix
        value = Util.getPrefixStrippedValue(value, pps.prefixLength);

        // strip non-numeric characters
        value = pps.numericOnly ? Util.strip(value, /[^\d]/g) : value;

        // convert case
        value = pps.uppercase ? value.toUpperCase() : value;
        value = pps.lowercase ? value.toLowerCase() : value;

        // prefix
        if (pps.prefix) {
            value = pps.prefix + value;

            // no blocks specified, no need to do formatting
            if (pps.blocksLength === 0) {
                pps.result = value;
                owner.updateValueState();

                return;
            }
        }

        // update credit card props
        if (pps.creditCard) {
            owner.updateCreditCardPropsByValue(value);
        }

        // strip over length characters
        value = Util.headStr(value, pps.maxLength);

        // apply blocks
        pps.result = Util.getFormattedValue(value, pps.blocks, pps.blocksLength, pps.delimiter);

        // nothing changed
        // prevent update value to avoid caret position change
        if (prev === pps.result && prev !== pps.prefix) {
            return;
        }

        owner.updateValueState();
    },

    updateCreditCardPropsByValue: function updateCreditCardPropsByValue(value) {
        var owner = this,
            pps = owner.properties,
            creditCardInfo;

        // At least one of the first 4 characters has changed
        if (Util.headStr(pps.result, 4) === Util.headStr(value, 4)) {
            return;
        }

        creditCardInfo = CreditCardDetector.getInfo(value, pps.creditCardStrictMode);

        pps.blocks = creditCardInfo.blocks;
        pps.blocksLength = pps.blocks.length;
        pps.maxLength = Util.getMaxLength(pps.blocks);

        // credit card type changed
        if (pps.creditCardType !== creditCardInfo.type) {
            pps.creditCardType = creditCardInfo.type;

            pps.onCreditCardTypeChanged.call(owner, pps.creditCardType);
        }
    },

    updateValueState: function updateValueState() {
        this.setState({ value: this.properties.result });
    },

    render: function render() {
        var owner = this;

        return React.createElement('input', _extends({ type: 'text' }, owner.state.other, {
            value: owner.state.value,
            onKeyDown: owner.onKeyDown,
            onChange: owner.onChange }));
    }
});

module.exports = window.Cleave = Cleave;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./common/DefaultProperties":3,"./shortcuts/CreditCardDetector":4,"./shortcuts/DateFormatter":5,"./shortcuts/NumeralFormatter":6,"./shortcuts/PhoneFormatter":7,"./utils/Util":8}],3:[function(require,module,exports){
'use strict';

/**
 * Props Assignment
 *
 * Separate this, so react module can share the usage
 */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var DefaultProperties = {
    // Maybe change to object-assign
    // for now just keep it as simple
    assign: function assign(target, opts) {
        target = target || {};
        opts = opts || {};

        // credit card
        target.creditCard = !!opts.creditCard;
        target.creditCardStrictMode = !!opts.creditCardStrictMode;
        target.creditCardType = '';
        target.onCreditCardTypeChanged = opts.onCreditCardTypeChanged || function () {};

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
        target.numeralDecimalScale = opts.numeralDecimalScale >= 0 ? opts.numeralDecimalScale : 2;
        target.numeralDecimalMark = opts.numeralDecimalMark || '.';
        target.numeralThousandsGroupStyle = opts.numeralThousandsGroupStyle || 'thousand';

        // others
        target.numericOnly = target.creditCard || target.date || !!opts.numericOnly;

        target.uppercase = !!opts.uppercase;
        target.lowercase = !!opts.lowercase;

        target.prefix = target.creditCard || target.phone || target.date ? '' : opts.prefix || '';
        target.prefixLength = target.prefix.length;

        target.initValue = opts.initValue || '';

        target.delimiter = opts.delimiter || opts.delimiter === '' ? opts.delimiter : opts.date ? '/' : opts.numeral ? ',' : opts.phone ? ' ' : ' ';
        target.delimiterRE = new RegExp('\\' + (target.delimiter || ' '), 'g');

        target.blocks = opts.blocks || [];
        target.blocksLength = target.blocks.length;

        target.maxLength = 0;

        target.backspace = false;
        target.result = '';

        return target;
    }
};

if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && _typeof(module.exports) === 'object') {
    module.exports = exports = DefaultProperties;
}

},{}],4:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var CreditCardDetector = {
    blocks: {
        uatp: [4, 5, 6],
        amex: [4, 6, 5],
        diners: [4, 6, 4],
        discover: [4, 4, 4, 4],
        mastercard: [4, 4, 4, 4],
        dankort: [4, 4, 4, 4],
        instapayment: [4, 4, 4, 4],
        jcb: [4, 4, 4, 4],
        visa: [4, 4, 4, 4],
        generalLoose: [4, 4, 4, 4],
        generalStrict: [4, 4, 4, 7]
    },

    re: {
        // starts with 1; 15 digits, not starts with 1800 (jcb card)
        uatp: /^(?!1800)1\d{0,14}/,

        // starts with 34/37; 15 digits
        amex: /^3[47]\d{0,13}/,

        // starts with 6011/65/644-649; 16 digits
        discover: /^(?:6011|65\d{0,2}|64[4-9]\d?)\d{0,12}/,

        // starts with 300-305/309 or 36/38/39; 14 digits
        diners: /^3(?:0([0-5]|9)|[689]\d?)\d{0,11}/,

        // starts with 51-55/22-27; 16 digits
        mastercard: /^(5[1-5]|2[2-7])\d{0,14}/,

        // starts with 5019/4175/4571; 16 digits
        dankort: /^(5019|4175|4571)\d{0,12}/,

        // starts with 637-639; 16 digits
        instapayment: /^63[7-9]\d{0,13}/,

        // starts with 2131/1800/35; 16 digits
        jcb: /^(?:2131|1800|35\d{0,2})\d{0,12}/,

        // starts with 4; 16 digits
        visa: /^4\d{0,15}/
    },

    getInfo: function getInfo(value, strictMode) {
        var blocks = CreditCardDetector.blocks,
            re = CreditCardDetector.re;

        // In theory, visa credit card can have up to 19 digits number.
        // Set strictMode to true will remove the 16 max-length restrain,
        // however, I never found any website validate card number like
        // this, hence probably you don't need to enable this option.
        strictMode = !!strictMode;

        if (re.amex.test(value)) {
            return {
                type: 'amex',
                blocks: blocks.amex
            };
        } else if (re.uatp.test(value)) {
            return {
                type: 'uatp',
                blocks: blocks.uatp
            };
        } else if (re.diners.test(value)) {
            return {
                type: 'diners',
                blocks: blocks.diners
            };
        } else if (re.discover.test(value)) {
            return {
                type: 'discover',
                blocks: blocks.discover
            };
        } else if (re.mastercard.test(value)) {
            return {
                type: 'mastercard',
                blocks: blocks.mastercard
            };
        } else if (re.dankort.test(value)) {
            return {
                type: 'dankort',
                blocks: blocks.dankort
            };
        } else if (re.instapayment.test(value)) {
            return {
                type: 'instapayment',
                blocks: blocks.instapayment
            };
        } else if (re.jcb.test(value)) {
            return {
                type: 'jcb',
                blocks: blocks.jcb
            };
        } else if (re.visa.test(value)) {
            return {
                type: 'visa',
                blocks: blocks.visa
            };
        } else if (strictMode) {
            return {
                type: 'unknown',
                blocks: blocks.generalStrict
            };
        } else {
            return {
                type: 'unknown',
                blocks: blocks.generalLoose
            };
        }
    }
};

if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && _typeof(module.exports) === 'object') {
    module.exports = exports = CreditCardDetector;
}

},{}],5:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var DateFormatter = function DateFormatter(datePattern) {
    var owner = this;

    owner.blocks = [];
    owner.datePattern = datePattern;
    owner.initBlocks();
};

DateFormatter.prototype = {
    initBlocks: function initBlocks() {
        var owner = this;
        owner.datePattern.forEach(function (value) {
            if (value === 'Y') {
                owner.blocks.push(4);
            } else {
                owner.blocks.push(2);
            }
        });
    },

    getBlocks: function getBlocks() {
        return this.blocks;
    },

    getValidatedDate: function getValidatedDate(value) {
        var owner = this,
            result = '';

        value = value.replace(/[^\d]/g, '');

        owner.blocks.forEach(function (length, index) {
            if (value.length > 0) {
                var sub = value.slice(0, length),
                    sub0 = sub.slice(0, 1),
                    rest = value.slice(length);

                switch (owner.datePattern[index]) {
                    case 'd':
                        if (sub === '00') {
                            sub = '01';
                        } else if (parseInt(sub0, 10) > 3) {
                            sub = '0' + sub0;
                        } else if (parseInt(sub, 10) > 31) {
                            sub = '31';
                        }

                        break;

                    case 'm':
                        if (sub === '00') {
                            sub = '01';
                        } else if (parseInt(sub0, 10) > 1) {
                            sub = '0' + sub0;
                        } else if (parseInt(sub, 10) > 12) {
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

if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && _typeof(module.exports) === 'object') {
    module.exports = exports = DateFormatter;
}

},{}],6:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var NumeralFormatter = function NumeralFormatter(numeralDecimalMark, numeralDecimalScale, numeralThousandsGroupStyle, delimiter) {
    var owner = this;

    owner.numeralDecimalMark = numeralDecimalMark || '.';
    owner.numeralDecimalScale = numeralDecimalScale >= 0 ? numeralDecimalScale : 2;
    owner.numeralThousandsGroupStyle = numeralThousandsGroupStyle || NumeralFormatter.groupStyle.thousand;
    owner.delimiter = delimiter || delimiter === '' ? delimiter : ',';
    owner.delimiterRE = delimiter ? new RegExp('\\' + delimiter, 'g') : '';
};

NumeralFormatter.groupStyle = {
    thousand: 'thousand',
    lakh: 'lakh',
    wan: 'wan'
};

NumeralFormatter.prototype = {
    getRawValue: function getRawValue(value) {
        return value.replace(this.delimiterRE, '').replace(this.numeralDecimalMark, '.');
    },

    format: function format(value) {
        var owner = this,
            parts,
            partInteger,
            partDecimal = '';

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

        return partInteger.toString() + (owner.numeralDecimalScale > 0 ? partDecimal.toString() : '');
    }
};

if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && _typeof(module.exports) === 'object') {
    module.exports = exports = NumeralFormatter;
}

},{}],7:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var PhoneFormatter = function PhoneFormatter(formatter, delimiter) {
    var owner = this;

    owner.delimiter = delimiter || delimiter === '' ? delimiter : ' ';
    owner.delimiterRE = delimiter ? new RegExp('\\' + delimiter, 'g') : '';

    owner.formatter = formatter;
};

PhoneFormatter.prototype = {
    setFormatter: function setFormatter(formatter) {
        this.formatter = formatter;
    },

    format: function format(phoneNumber) {
        var owner = this;

        owner.formatter.clear();

        // only keep number and +
        phoneNumber = phoneNumber.replace(/[^\d+]/g, '');

        // strip delimiter
        phoneNumber = phoneNumber.replace(owner.delimiterRE, '');

        var result = '',
            current,
            validated = false;

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

if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && _typeof(module.exports) === 'object') {
    module.exports = exports = PhoneFormatter;
}

},{}],8:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var Util = {
    noop: function noop() {},

    strip: function strip(value, re) {
        return value.replace(re, '');
    },

    headStr: function headStr(str, length) {
        return str.slice(0, length);
    },

    getMaxLength: function getMaxLength(blocks) {
        return blocks.reduce(function (previous, current) {
            return previous + current;
        }, 0);
    },

    // strip value by prefix length
    // for prefix: PRE
    // (PRE123, 3) -> 123
    // (PR123, 3) -> 23 this happens when user hits backspace in front of "PRE"
    getPrefixStrippedValue: function getPrefixStrippedValue(value, prefixLength) {
        return value.slice(prefixLength);
    },

    getFormattedValue: function getFormattedValue(value, blocks, blocksLength, delimiter) {
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

if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && _typeof(module.exports) === 'object') {
    module.exports = exports = Util;
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZWFjdC5qcyIsInNyYy9DbGVhdmUucmVhY3QuanMiLCJzcmMvY29tbW9uL0RlZmF1bHRQcm9wZXJ0aWVzLmpzIiwic3JjL3Nob3J0Y3V0cy9DcmVkaXRDYXJkRGV0ZWN0b3IuanMiLCJzcmMvc2hvcnRjdXRzL0RhdGVGb3JtYXR0ZXIuanMiLCJzcmMvc2hvcnRjdXRzL051bWVyYWxGb3JtYXR0ZXIuanMiLCJzcmMvc2hvcnRjdXRzL1Bob25lRm9ybWF0dGVyLmpzIiwic3JjL3V0aWxzL1V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQTs7Ozs7Ozs7OztBQ0FBOzs7Ozs7QUFFQSxJQUFJLFFBQVEsUUFBUSxPQUFSLENBQVo7O0FBRUEsSUFBSSxtQkFBbUIsUUFBUSw4QkFBUixDQUF2QjtBQUNBLElBQUksZ0JBQWdCLFFBQVEsMkJBQVIsQ0FBcEI7QUFDQSxJQUFJLGlCQUFpQixRQUFRLDRCQUFSLENBQXJCO0FBQ0EsSUFBSSxxQkFBcUIsUUFBUSxnQ0FBUixDQUF6QjtBQUNBLElBQUksT0FBTyxRQUFRLGNBQVIsQ0FBWDtBQUNBLElBQUksb0JBQW9CLFFBQVEsNEJBQVIsQ0FBeEI7O0FBRUEsSUFBSSxTQUFTLE1BQU0sV0FBTixDQUFrQjtBQUFBOztBQUMzQix1QkFBbUIsNkJBQVk7QUFDM0IsYUFBSyxJQUFMO0FBQ0gsS0FIMEI7O0FBSzNCLCtCQUEyQixtQ0FBVSxTQUFWLEVBQXFCO0FBQzVDLFlBQUksUUFBUSxJQUFaO0FBQUEsWUFDSSxrQkFBa0IsVUFBVSxPQUFWLENBQWtCLGVBRHhDO0FBQUEsWUFFSSxXQUFXLFVBQVUsS0FGekI7O0FBSUEsWUFBSSxRQUFKLEVBQWM7QUFDVixrQkFBTSxPQUFOLENBQWMsUUFBZDtBQUNIOzs7QUFHRCxZQUFJLG1CQUFtQixvQkFBb0IsTUFBTSxVQUFOLENBQWlC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QUFPLE1BQVAsQ0FBYyxVQUFVLFFBQVYsRUFBb0IsT0FBcEIsRUFBNkI7QUFDOUMsbUJBQU8sV0FBVyxPQUFsQjtBQUNILFNBRk0sRUFFSixDQUZJLENBQVA7QUFHSCxLQWhCTTs7Ozs7O0FBc0JQLDRCQUF3QixnQ0FBVSxLQUFWLEVBQWlCLFlBQWpCLEVBQStCO0FBQ25ELGVBQU8sTUFBTSxLQUFOLENBQVksWUFBWixDQUFQO0FBQ0gsS0F4Qk07O0FBMEJQLHVCQUFtQiwyQkFBVSxLQUFWLEVBQWlCLE1BQWpCLEVBQXlCLFlBQXpCLEVBQXVDLFNBQXZDLEVBQWtEO0FBQ2pFLFlBQUksU0FBUyxFQUFiOztBQUVBLGVBQU8sT0FBUCxDQUFlLFVBQVUsTUFBVixFQUFrQixLQUFsQixFQUF5QjtBQUNwQyxnQkFBSSxNQUFNLE1BQU4sR0FBZSxDQUFuQixFQUFzQjtBQUNsQixvQkFBSSxNQUFNLE1BQU0sS0FBTixDQUFZLENBQVosRUFBZSxNQUFmLENBQVY7QUFBQSxvQkFDSSxPQUFPLE1BQU0sS0FBTixDQUFZLE1BQVosQ0FEWDs7QUFHQSwwQkFBVSxHQUFWOztBQUVBLG9CQUFJLElBQUksTUFBSixLQUFlLE1BQWYsSUFBeUIsUUFBUSxlQUFlLENBQXBELEVBQXVEO0FBQ25ELDhCQUFVLFNBQVY7QUFDSDs7O0FBR0Qsd0JBQVEsSUFBUjtBQUNIO0FBQ0osU0FkRDs7QUFnQkEsZUFBTyxNQUFQO0FBQ0g7QUE5Q00sQ0FBWDs7QUFpREEsSUFBSSxRQUFPLE1BQVAseUNBQU8sTUFBUCxPQUFrQixRQUFsQixJQUE4QixRQUFPLE9BQU8sT0FBZCxNQUEwQixRQUE1RCxFQUFzRTtBQUNsRSxXQUFPLE9BQVAsR0FBaUIsVUFBVSxJQUEzQjtBQUNIIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBDbGVhdmUgZnJvbSAnLi9zcmMvQ2xlYXZlLnJlYWN0JztcblxuZXhwb3J0IGRlZmF1bHQgQ2xlYXZlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgTnVtZXJhbEZvcm1hdHRlciA9IHJlcXVpcmUoJy4vc2hvcnRjdXRzL051bWVyYWxGb3JtYXR0ZXInKTtcbnZhciBEYXRlRm9ybWF0dGVyID0gcmVxdWlyZSgnLi9zaG9ydGN1dHMvRGF0ZUZvcm1hdHRlcicpO1xudmFyIFBob25lRm9ybWF0dGVyID0gcmVxdWlyZSgnLi9zaG9ydGN1dHMvUGhvbmVGb3JtYXR0ZXInKTtcbnZhciBDcmVkaXRDYXJkRGV0ZWN0b3IgPSByZXF1aXJlKCcuL3Nob3J0Y3V0cy9DcmVkaXRDYXJkRGV0ZWN0b3InKTtcbnZhciBVdGlsID0gcmVxdWlyZSgnLi91dGlscy9VdGlsJyk7XG52YXIgRGVmYXVsdFByb3BlcnRpZXMgPSByZXF1aXJlKCcuL2NvbW1vbi9EZWZhdWx0UHJvcGVydGllcycpO1xuXG52YXIgQ2xlYXZlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV4dFByb3BzKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICBwaG9uZVJlZ2lvbkNvZGUgPSBuZXh0UHJvcHMub3B0aW9ucy5waG9uZVJlZ2lvbkNvZGUsXG4gICAgICAgICAgICBuZXdWYWx1ZSA9IG5leHRQcm9wcy52YWx1ZTtcblxuICAgICAgICBpZiAobmV3VmFsdWUpIHtcbiAgICAgICAgICAgIG93bmVyLm9uSW5wdXQobmV3VmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gdXBkYXRlIHBob25lIHJlZ2lvbiBjb2RlXG4gICAgICAgIGlmIChwaG9uZVJlZ2lvbkNvZGUgJiYgcGhvbmVSZWdpb25Db2RlICE9PSBvd25lci5wcm9wZXJ0aWVzLnBob25lUmVnaW9uQ29kZSkge1xuICAgICAgICAgICAgb3duZXIucHJvcGVydGllcy5waG9uZVJlZ2lvbkNvZGUgPSBwaG9uZVJlZ2lvbkNvZGU7XG4gICAgICAgICAgICBvd25lci5pbml0UGhvbmVGb3JtYXR0ZXIoKTtcbiAgICAgICAgICAgIG93bmVyLm9uSW5wdXQob3duZXIucHJvcGVydGllcy5yZXN1bHQpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxuICAgICAgICAgICAgeyB2YWx1ZSwgb3B0aW9ucywgb25LZXlEb3duLCBvbkNoYW5nZSwgLi4ub3RoZXIgfSA9IG93bmVyLnByb3BzO1xuXG4gICAgICAgIG93bmVyLnJlZ2lzdGVyZWRFdmVudHMgPSB7XG4gICAgICAgICAgICBvbkNoYW5nZTogIG9uQ2hhbmdlIHx8IFV0aWwubm9vcCxcbiAgICAgICAgICAgIG9uS2V5RG93bjogb25LZXlEb3duIHx8IFV0aWwubm9vcFxuICAgICAgICB9O1xuXG4gICAgICAgIG9wdGlvbnMuaW5pdFZhbHVlID0gdmFsdWU7XG5cbiAgICAgICAgb3duZXIucHJvcGVydGllcyA9IERlZmF1bHRQcm9wZXJ0aWVzLmFzc2lnbih7fSwgb3B0aW9ucyk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG90aGVyOiBvdGhlcixcbiAgICAgICAgICAgIHZhbHVlOiBvd25lci5wcm9wZXJ0aWVzLnJlc3VsdFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIC8vIHNvIG5vIG5lZWQgZm9yIHRoaXMgbGliIGF0IGFsbFxuICAgICAgICBpZiAoIXBwcy5udW1lcmFsICYmICFwcHMucGhvbmUgJiYgIXBwcy5jcmVkaXRDYXJkICYmICFwcHMuZGF0ZSAmJiAocHBzLmJsb2Nrc0xlbmd0aCA9PT0gMCAmJiAhcHBzLnByZWZpeCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHBwcy5tYXhMZW5ndGggPSBVdGlsLmdldE1heExlbmd0aChwcHMuYmxvY2tzKTtcblxuICAgICAgICBvd25lci5pbml0UGhvbmVGb3JtYXR0ZXIoKTtcbiAgICAgICAgb3duZXIuaW5pdERhdGVGb3JtYXR0ZXIoKTtcbiAgICAgICAgb3duZXIuaW5pdE51bWVyYWxGb3JtYXR0ZXIoKTtcblxuICAgICAgICBvd25lci5vbklucHV0KHBwcy5pbml0VmFsdWUpO1xuICAgIH0sXG5cbiAgICBpbml0TnVtZXJhbEZvcm1hdHRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxuICAgICAgICAgICAgcHBzID0gb3duZXIucHJvcGVydGllcztcblxuICAgICAgICBpZiAoIXBwcy5udW1lcmFsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBwcHMubnVtZXJhbEZvcm1hdHRlciA9IG5ldyBOdW1lcmFsRm9ybWF0dGVyKFxuICAgICAgICAgICAgcHBzLm51bWVyYWxEZWNpbWFsTWFyayxcbiAgICAgICAgICAgIHBwcy5udW1lcmFsRGVjaW1hbFNjYWxlLFxuICAgICAgICAgICAgcHBzLm51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlLFxuICAgICAgICAgICAgcHBzLmRlbGltaXRlclxuICAgICAgICApO1xuICAgIH0sXG5cbiAgICBpbml0RGF0ZUZvcm1hdHRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxuICAgICAgICAgICAgcHBzID0gb3duZXIucHJvcGVydGllcztcblxuICAgICAgICBpZiAoIXBwcy5kYXRlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBwcHMuZGF0ZUZvcm1hdHRlciA9IG5ldyBEYXRlRm9ybWF0dGVyKHBwcy5kYXRlUGF0dGVybik7XG4gICAgICAgIHBwcy5ibG9ja3MgPSBwcHMuZGF0ZUZvcm1hdHRlci5nZXRCbG9ja3MoKTtcbiAgICAgICAgcHBzLmJsb2Nrc0xlbmd0aCA9IHBwcy5ibG9ja3MubGVuZ3RoO1xuICAgICAgICBwcHMubWF4TGVuZ3RoID0gVXRpbC5nZXRNYXhMZW5ndGgocHBzLmJsb2Nrcyk7XG4gICAgfSxcblxuICAgIGluaXRQaG9uZUZvcm1hdHRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxuICAgICAgICAgICAgcHBzID0gb3duZXIucHJvcGVydGllcztcblxuICAgICAgICBpZiAoIXBwcy5waG9uZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2xlYXZlLkFzWW91VHlwZUZvcm1hdHRlciBzaG91bGQgYmUgcHJvdmlkZWQgYnlcbiAgICAgICAgLy8gZXh0ZXJuYWwgZ29vZ2xlIGNsb3N1cmUgbGliXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwcHMucGhvbmVGb3JtYXR0ZXIgPSBuZXcgUGhvbmVGb3JtYXR0ZXIoXG4gICAgICAgICAgICAgICAgbmV3IHdpbmRvdy5DbGVhdmUuQXNZb3VUeXBlRm9ybWF0dGVyKHBwcy5waG9uZVJlZ2lvbkNvZGUpLFxuICAgICAgICAgICAgICAgIHBwcy5kZWxpbWl0ZXJcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BsZWFzZSBpbmNsdWRlIHBob25lLXR5cGUtZm9ybWF0dGVyLntjb3VudHJ5fS5qcyBsaWInKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBvbktleURvd246IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxuICAgICAgICAgICAgcHBzID0gb3duZXIucHJvcGVydGllcyxcbiAgICAgICAgICAgIGNoYXJDb2RlID0gZXZlbnQud2hpY2ggfHwgZXZlbnQua2V5Q29kZTtcblxuICAgICAgICAvLyBoaXQgYmFja3NwYWNlIHdoZW4gbGFzdCBjaGFyYWN0ZXIgaXMgZGVsaW1pdGVyXG4gICAgICAgIGlmIChjaGFyQ29kZSA9PT0gOCAmJiBwcHMucmVzdWx0LnNsaWNlKC0xKSA9PT0gcHBzLmRlbGltaXRlcikge1xuICAgICAgICAgICAgcHBzLmJhY2tzcGFjZSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwcHMuYmFja3NwYWNlID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBvd25lci5yZWdpc3RlcmVkRXZlbnRzLm9uS2V5RG93bihldmVudCk7XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcHBzID0gb3duZXIucHJvcGVydGllcztcblxuICAgICAgICBvd25lci5vbklucHV0KGV2ZW50LnRhcmdldC52YWx1ZSk7XG5cbiAgICAgICAgaWYgKHBwcy5udW1lcmFsKSB7XG4gICAgICAgICAgICBldmVudC50YXJnZXQucmF3VmFsdWUgPSBwcHMubnVtZXJhbEZvcm1hdHRlci5nZXRSYXdWYWx1ZShwcHMucmVzdWx0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGV2ZW50LnRhcmdldC5yYXdWYWx1ZSA9IFV0aWwuc3RyaXAocHBzLnJlc3VsdCwgcHBzLmRlbGltaXRlclJFKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG93bmVyLnJlZ2lzdGVyZWRFdmVudHMub25DaGFuZ2UoZXZlbnQpO1xuICAgIH0sXG5cbiAgICBvbklucHV0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcHBzID0gb3duZXIucHJvcGVydGllcyxcbiAgICAgICAgICAgIHByZXYgPSBwcHMucmVzdWx0O1xuXG4gICAgICAgIC8vIGNhc2UgMTogZGVsZXRlIG9uZSBtb3JlIGNoYXJhY3RlciBcIjRcIlxuICAgICAgICAvLyAxMjM0KnwgLT4gaGl0IGJhY2tzcGFjZSAtPiAxMjN8XG4gICAgICAgIC8vIGNhc2UgMjogbGFzdCBjaGFyYWN0ZXIgaXMgbm90IGRlbGltaXRlciB3aGljaCBpczpcbiAgICAgICAgLy8gMTJ8MzQqIC0+IGhpdCBiYWNrc3BhY2UgLT4gMXwzNCpcblxuICAgICAgICBpZiAoIXBwcy5udW1lcmFsICYmIHBwcy5iYWNrc3BhY2UgJiYgdmFsdWUuc2xpY2UoLTEpICE9PSBwcHMuZGVsaW1pdGVyKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IFV0aWwuaGVhZFN0cih2YWx1ZSwgdmFsdWUubGVuZ3RoIC0gMSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBwaG9uZSBmb3JtYXR0ZXJcbiAgICAgICAgaWYgKHBwcy5waG9uZSkge1xuICAgICAgICAgICAgcHBzLnJlc3VsdCA9IHBwcy5waG9uZUZvcm1hdHRlci5mb3JtYXQodmFsdWUpO1xuICAgICAgICAgICAgb3duZXIudXBkYXRlVmFsdWVTdGF0ZSgpO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBudW1lcmFsIGZvcm1hdHRlclxuICAgICAgICBpZiAocHBzLm51bWVyYWwpIHtcbiAgICAgICAgICAgIHBwcy5yZXN1bHQgPSBwcHMucHJlZml4ICsgcHBzLm51bWVyYWxGb3JtYXR0ZXIuZm9ybWF0KHZhbHVlKTtcbiAgICAgICAgICAgIG93bmVyLnVwZGF0ZVZhbHVlU3RhdGUoKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZGF0ZVxuICAgICAgICBpZiAocHBzLmRhdGUpIHtcbiAgICAgICAgICAgIHZhbHVlID0gcHBzLmRhdGVGb3JtYXR0ZXIuZ2V0VmFsaWRhdGVkRGF0ZSh2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzdHJpcCBkZWxpbWl0ZXJzXG4gICAgICAgIHZhbHVlID0gVXRpbC5zdHJpcCh2YWx1ZSwgcHBzLmRlbGltaXRlclJFKTtcblxuICAgICAgICAvLyBzdHJpcCBwcmVmaXhcbiAgICAgICAgdmFsdWUgPSBVdGlsLmdldFByZWZpeFN0cmlwcGVkVmFsdWUodmFsdWUsIHBwcy5wcmVmaXhMZW5ndGgpO1xuXG4gICAgICAgIC8vIHN0cmlwIG5vbi1udW1lcmljIGNoYXJhY3RlcnNcbiAgICAgICAgdmFsdWUgPSBwcHMubnVtZXJpY09ubHkgPyBVdGlsLnN0cmlwKHZhbHVlLCAvW15cXGRdL2cpIDogdmFsdWU7XG5cbiAgICAgICAgLy8gY29udmVydCBjYXNlXG4gICAgICAgIHZhbHVlID0gcHBzLnVwcGVyY2FzZSA/IHZhbHVlLnRvVXBwZXJDYXNlKCkgOiB2YWx1ZTtcbiAgICAgICAgdmFsdWUgPSBwcHMubG93ZXJjYXNlID8gdmFsdWUudG9Mb3dlckNhc2UoKSA6IHZhbHVlO1xuXG4gICAgICAgIC8vIHByZWZpeFxuICAgICAgICBpZiAocHBzLnByZWZpeCkge1xuICAgICAgICAgICAgdmFsdWUgPSBwcHMucHJlZml4ICsgdmFsdWU7XG5cbiAgICAgICAgICAgIC8vIG5vIGJsb2NrcyBzcGVjaWZpZWQsIG5vIG5lZWQgdG8gZG8gZm9ybWF0dGluZ1xuICAgICAgICAgICAgaWYgKHBwcy5ibG9ja3NMZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBwcHMucmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgb3duZXIudXBkYXRlVmFsdWVTdGF0ZSgpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gdXBkYXRlIGNyZWRpdCBjYXJkIHByb3BzXG4gICAgICAgIGlmIChwcHMuY3JlZGl0Q2FyZCkge1xuICAgICAgICAgICAgb3duZXIudXBkYXRlQ3JlZGl0Q2FyZFByb3BzQnlWYWx1ZSh2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzdHJpcCBvdmVyIGxlbmd0aCBjaGFyYWN0ZXJzXG4gICAgICAgIHZhbHVlID0gVXRpbC5oZWFkU3RyKHZhbHVlLCBwcHMubWF4TGVuZ3RoKTtcblxuICAgICAgICAvLyBhcHBseSBibG9ja3NcbiAgICAgICAgcHBzLnJlc3VsdCA9IFV0aWwuZ2V0Rm9ybWF0dGVkVmFsdWUodmFsdWUsIHBwcy5ibG9ja3MsIHBwcy5ibG9ja3NMZW5ndGgsIHBwcy5kZWxpbWl0ZXIpO1xuXG4gICAgICAgIC8vIG5vdGhpbmcgY2hhbmdlZFxuICAgICAgICAvLyBwcmV2ZW50IHVwZGF0ZSB2YWx1ZSB0byBhdm9pZCBjYXJldCBwb3NpdGlvbiBjaGFuZ2VcbiAgICAgICAgaWYgKHByZXYgPT09IHBwcy5yZXN1bHQgJiYgcHJldiAhPT0gcHBzLnByZWZpeCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgb3duZXIudXBkYXRlVmFsdWVTdGF0ZSgpO1xuICAgIH0sXG5cbiAgICB1cGRhdGVDcmVkaXRDYXJkUHJvcHNCeVZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcHBzID0gb3duZXIucHJvcGVydGllcyxcbiAgICAgICAgICAgIGNyZWRpdENhcmRJbmZvO1xuXG4gICAgICAgIC8vIEF0IGxlYXN0IG9uZSBvZiB0aGUgZmlyc3QgNCBjaGFyYWN0ZXJzIGhhcyBjaGFuZ2VkXG4gICAgICAgIGlmIChVdGlsLmhlYWRTdHIocHBzLnJlc3VsdCwgNCkgPT09IFV0aWwuaGVhZFN0cih2YWx1ZSwgNCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNyZWRpdENhcmRJbmZvID0gQ3JlZGl0Q2FyZERldGVjdG9yLmdldEluZm8odmFsdWUsIHBwcy5jcmVkaXRDYXJkU3RyaWN0TW9kZSk7XG5cbiAgICAgICAgcHBzLmJsb2NrcyA9IGNyZWRpdENhcmRJbmZvLmJsb2NrcztcbiAgICAgICAgcHBzLmJsb2Nrc0xlbmd0aCA9IHBwcy5ibG9ja3MubGVuZ3RoO1xuICAgICAgICBwcHMubWF4TGVuZ3RoID0gVXRpbC5nZXRNYXhMZW5ndGgocHBzLmJsb2Nrcyk7XG5cbiAgICAgICAgLy8gY3JlZGl0IGNhcmQgdHlwZSBjaGFuZ2VkXG4gICAgICAgIGlmIChwcHMuY3JlZGl0Q2FyZFR5cGUgIT09IGNyZWRpdENhcmRJbmZvLnR5cGUpIHtcbiAgICAgICAgICAgIHBwcy5jcmVkaXRDYXJkVHlwZSA9IGNyZWRpdENhcmRJbmZvLnR5cGU7XG5cbiAgICAgICAgICAgIHBwcy5vbkNyZWRpdENhcmRUeXBlQ2hhbmdlZC5jYWxsKG93bmVyLCBwcHMuY3JlZGl0Q2FyZFR5cGUpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHVwZGF0ZVZhbHVlU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dmFsdWU6IHRoaXMucHJvcGVydGllcy5yZXN1bHR9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXM7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIHsuLi5vd25lci5zdGF0ZS5vdGhlcn1cbiAgICAgICAgICAgICAgICAgICB2YWx1ZT17b3duZXIuc3RhdGUudmFsdWV9XG4gICAgICAgICAgICAgICAgICAgb25LZXlEb3duPXtvd25lci5vbktleURvd259XG4gICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e293bmVyLm9uQ2hhbmdlfS8+XG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gd2luZG93LkNsZWF2ZSA9IENsZWF2ZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBQcm9wcyBBc3NpZ25tZW50XG4gKlxuICogU2VwYXJhdGUgdGhpcywgc28gcmVhY3QgbW9kdWxlIGNhbiBzaGFyZSB0aGUgdXNhZ2VcbiAqL1xudmFyIERlZmF1bHRQcm9wZXJ0aWVzID0ge1xuICAgIC8vIE1heWJlIGNoYW5nZSB0byBvYmplY3QtYXNzaWduXG4gICAgLy8gZm9yIG5vdyBqdXN0IGtlZXAgaXQgYXMgc2ltcGxlXG4gICAgYXNzaWduOiBmdW5jdGlvbiAodGFyZ2V0LCBvcHRzKSB7XG4gICAgICAgIHRhcmdldCA9IHRhcmdldCB8fCB7fTtcbiAgICAgICAgb3B0cyA9IG9wdHMgfHwge307XG5cbiAgICAgICAgLy8gY3JlZGl0IGNhcmRcbiAgICAgICAgdGFyZ2V0LmNyZWRpdENhcmQgPSAhIW9wdHMuY3JlZGl0Q2FyZDtcbiAgICAgICAgdGFyZ2V0LmNyZWRpdENhcmRTdHJpY3RNb2RlID0gISFvcHRzLmNyZWRpdENhcmRTdHJpY3RNb2RlO1xuICAgICAgICB0YXJnZXQuY3JlZGl0Q2FyZFR5cGUgPSAnJztcbiAgICAgICAgdGFyZ2V0Lm9uQ3JlZGl0Q2FyZFR5cGVDaGFuZ2VkID0gb3B0cy5vbkNyZWRpdENhcmRUeXBlQ2hhbmdlZCB8fCAoZnVuY3Rpb24gKCkge30pO1xuXG4gICAgICAgIC8vIHBob25lXG4gICAgICAgIHRhcmdldC5waG9uZSA9ICEhb3B0cy5waG9uZTtcbiAgICAgICAgdGFyZ2V0LnBob25lUmVnaW9uQ29kZSA9IG9wdHMucGhvbmVSZWdpb25Db2RlIHx8ICdBVSc7XG4gICAgICAgIHRhcmdldC5waG9uZUZvcm1hdHRlciA9IHt9O1xuXG4gICAgICAgIC8vIGRhdGVcbiAgICAgICAgdGFyZ2V0LmRhdGUgPSAhIW9wdHMuZGF0ZTtcbiAgICAgICAgdGFyZ2V0LmRhdGVQYXR0ZXJuID0gb3B0cy5kYXRlUGF0dGVybiB8fCBbJ2QnLCAnbScsICdZJ107XG4gICAgICAgIHRhcmdldC5kYXRlRm9ybWF0dGVyID0ge307XG5cbiAgICAgICAgLy8gbnVtZXJhbFxuICAgICAgICB0YXJnZXQubnVtZXJhbCA9ICEhb3B0cy5udW1lcmFsO1xuICAgICAgICB0YXJnZXQubnVtZXJhbERlY2ltYWxTY2FsZSA9IG9wdHMubnVtZXJhbERlY2ltYWxTY2FsZSA+PSAwID8gb3B0cy5udW1lcmFsRGVjaW1hbFNjYWxlIDogMjtcbiAgICAgICAgdGFyZ2V0Lm51bWVyYWxEZWNpbWFsTWFyayA9IG9wdHMubnVtZXJhbERlY2ltYWxNYXJrIHx8ICcuJztcbiAgICAgICAgdGFyZ2V0Lm51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlID0gb3B0cy5udW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSB8fCAndGhvdXNhbmQnO1xuXG4gICAgICAgIC8vIG90aGVyc1xuICAgICAgICB0YXJnZXQubnVtZXJpY09ubHkgPSB0YXJnZXQuY3JlZGl0Q2FyZCB8fCB0YXJnZXQuZGF0ZSB8fCAhIW9wdHMubnVtZXJpY09ubHk7XG5cbiAgICAgICAgdGFyZ2V0LnVwcGVyY2FzZSA9ICEhb3B0cy51cHBlcmNhc2U7XG4gICAgICAgIHRhcmdldC5sb3dlcmNhc2UgPSAhIW9wdHMubG93ZXJjYXNlO1xuXG4gICAgICAgIHRhcmdldC5wcmVmaXggPSAodGFyZ2V0LmNyZWRpdENhcmQgfHwgdGFyZ2V0LnBob25lIHx8IHRhcmdldC5kYXRlKSA/ICcnIDogKG9wdHMucHJlZml4IHx8ICcnKTtcbiAgICAgICAgdGFyZ2V0LnByZWZpeExlbmd0aCA9IHRhcmdldC5wcmVmaXgubGVuZ3RoO1xuXG4gICAgICAgIHRhcmdldC5pbml0VmFsdWUgPSBvcHRzLmluaXRWYWx1ZSB8fCAnJztcblxuICAgICAgICB0YXJnZXQuZGVsaW1pdGVyID1cbiAgICAgICAgICAgIChvcHRzLmRlbGltaXRlciB8fCBvcHRzLmRlbGltaXRlciA9PT0gJycpID8gb3B0cy5kZWxpbWl0ZXIgOlxuICAgICAgICAgICAgICAgIChvcHRzLmRhdGUgPyAnLycgOlxuICAgICAgICAgICAgICAgICAgICAob3B0cy5udW1lcmFsID8gJywnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgIChvcHRzLnBob25lID8gJyAnIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnICcpKSk7XG4gICAgICAgIHRhcmdldC5kZWxpbWl0ZXJSRSA9IG5ldyBSZWdFeHAoJ1xcXFwnICsgKHRhcmdldC5kZWxpbWl0ZXIgfHwgJyAnKSwgJ2cnKTtcblxuICAgICAgICB0YXJnZXQuYmxvY2tzID0gb3B0cy5ibG9ja3MgfHwgW107XG4gICAgICAgIHRhcmdldC5ibG9ja3NMZW5ndGggPSB0YXJnZXQuYmxvY2tzLmxlbmd0aDtcblxuICAgICAgICB0YXJnZXQubWF4TGVuZ3RoID0gMDtcblxuICAgICAgICB0YXJnZXQuYmFja3NwYWNlID0gZmFsc2U7XG4gICAgICAgIHRhcmdldC5yZXN1bHQgPSAnJztcblxuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbn07XG5cbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gRGVmYXVsdFByb3BlcnRpZXM7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDcmVkaXRDYXJkRGV0ZWN0b3IgPSB7XG4gICAgYmxvY2tzOiB7XG4gICAgICAgIHVhdHA6ICAgICAgICAgIFs0LCA1LCA2XSxcbiAgICAgICAgYW1leDogICAgICAgICAgWzQsIDYsIDVdLFxuICAgICAgICBkaW5lcnM6ICAgICAgICBbNCwgNiwgNF0sXG4gICAgICAgIGRpc2NvdmVyOiAgICAgIFs0LCA0LCA0LCA0XSxcbiAgICAgICAgbWFzdGVyY2FyZDogICAgWzQsIDQsIDQsIDRdLFxuICAgICAgICBkYW5rb3J0OiAgICAgICBbNCwgNCwgNCwgNF0sXG4gICAgICAgIGluc3RhcGF5bWVudDogIFs0LCA0LCA0LCA0XSxcbiAgICAgICAgamNiOiAgICAgICAgICAgWzQsIDQsIDQsIDRdLFxuICAgICAgICB2aXNhOiAgICAgICAgICBbNCwgNCwgNCwgNF0sXG4gICAgICAgIGdlbmVyYWxMb29zZTogIFs0LCA0LCA0LCA0XSxcbiAgICAgICAgZ2VuZXJhbFN0cmljdDogWzQsIDQsIDQsIDddXG4gICAgfSxcblxuICAgIHJlOiB7XG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDE7IDE1IGRpZ2l0cywgbm90IHN0YXJ0cyB3aXRoIDE4MDAgKGpjYiBjYXJkKVxuICAgICAgICB1YXRwOiAvXig/ITE4MDApMVxcZHswLDE0fS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggMzQvMzc7IDE1IGRpZ2l0c1xuICAgICAgICBhbWV4OiAvXjNbNDddXFxkezAsMTN9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCA2MDExLzY1LzY0NC02NDk7IDE2IGRpZ2l0c1xuICAgICAgICBkaXNjb3ZlcjogL14oPzo2MDExfDY1XFxkezAsMn18NjRbNC05XVxcZD8pXFxkezAsMTJ9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCAzMDAtMzA1LzMwOSBvciAzNi8zOC8zOTsgMTQgZGlnaXRzXG4gICAgICAgIGRpbmVyczogL14zKD86MChbMC01XXw5KXxbNjg5XVxcZD8pXFxkezAsMTF9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCA1MS01NS8yMi0yNzsgMTYgZGlnaXRzXG4gICAgICAgIG1hc3RlcmNhcmQ6IC9eKDVbMS01XXwyWzItN10pXFxkezAsMTR9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCA1MDE5LzQxNzUvNDU3MTsgMTYgZGlnaXRzXG4gICAgICAgIGRhbmtvcnQ6IC9eKDUwMTl8NDE3NXw0NTcxKVxcZHswLDEyfS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggNjM3LTYzOTsgMTYgZGlnaXRzXG4gICAgICAgIGluc3RhcGF5bWVudDogL142M1s3LTldXFxkezAsMTN9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCAyMTMxLzE4MDAvMzU7IDE2IGRpZ2l0c1xuICAgICAgICBqY2I6IC9eKD86MjEzMXwxODAwfDM1XFxkezAsMn0pXFxkezAsMTJ9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCA0OyAxNiBkaWdpdHNcbiAgICAgICAgdmlzYTogL140XFxkezAsMTV9L1xuICAgIH0sXG5cbiAgICBnZXRJbmZvOiBmdW5jdGlvbiAodmFsdWUsIHN0cmljdE1vZGUpIHtcbiAgICAgICAgdmFyIGJsb2NrcyA9IENyZWRpdENhcmREZXRlY3Rvci5ibG9ja3MsXG4gICAgICAgICAgICByZSA9IENyZWRpdENhcmREZXRlY3Rvci5yZTtcblxuICAgICAgICAvLyBJbiB0aGVvcnksIHZpc2EgY3JlZGl0IGNhcmQgY2FuIGhhdmUgdXAgdG8gMTkgZGlnaXRzIG51bWJlci5cbiAgICAgICAgLy8gU2V0IHN0cmljdE1vZGUgdG8gdHJ1ZSB3aWxsIHJlbW92ZSB0aGUgMTYgbWF4LWxlbmd0aCByZXN0cmFpbixcbiAgICAgICAgLy8gaG93ZXZlciwgSSBuZXZlciBmb3VuZCBhbnkgd2Vic2l0ZSB2YWxpZGF0ZSBjYXJkIG51bWJlciBsaWtlXG4gICAgICAgIC8vIHRoaXMsIGhlbmNlIHByb2JhYmx5IHlvdSBkb24ndCBuZWVkIHRvIGVuYWJsZSB0aGlzIG9wdGlvbi5cbiAgICAgICAgc3RyaWN0TW9kZSA9ICEhc3RyaWN0TW9kZTtcblxuICAgICAgICBpZiAocmUuYW1leC50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAgICdhbWV4JyxcbiAgICAgICAgICAgICAgICBibG9ja3M6IGJsb2Nrcy5hbWV4XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKHJlLnVhdHAudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogICAndWF0cCcsXG4gICAgICAgICAgICAgICAgYmxvY2tzOiBibG9ja3MudWF0cFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChyZS5kaW5lcnMudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogICAnZGluZXJzJyxcbiAgICAgICAgICAgICAgICBibG9ja3M6IGJsb2Nrcy5kaW5lcnNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAocmUuZGlzY292ZXIudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogICAnZGlzY292ZXInLFxuICAgICAgICAgICAgICAgIGJsb2NrczogYmxvY2tzLmRpc2NvdmVyXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKHJlLm1hc3RlcmNhcmQudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogICAnbWFzdGVyY2FyZCcsXG4gICAgICAgICAgICAgICAgYmxvY2tzOiBibG9ja3MubWFzdGVyY2FyZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChyZS5kYW5rb3J0LnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICAgJ2RhbmtvcnQnLFxuICAgICAgICAgICAgICAgIGJsb2NrczogYmxvY2tzLmRhbmtvcnRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAocmUuaW5zdGFwYXltZW50LnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICAgJ2luc3RhcGF5bWVudCcsXG4gICAgICAgICAgICAgICAgYmxvY2tzOiBibG9ja3MuaW5zdGFwYXltZW50XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKHJlLmpjYi50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAgICdqY2InLFxuICAgICAgICAgICAgICAgIGJsb2NrczogYmxvY2tzLmpjYlxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChyZS52aXNhLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICAgJ3Zpc2EnLFxuICAgICAgICAgICAgICAgIGJsb2NrczogYmxvY2tzLnZpc2FcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAoc3RyaWN0TW9kZSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAgICd1bmtub3duJyxcbiAgICAgICAgICAgICAgICBibG9ja3M6IGJsb2Nrcy5nZW5lcmFsU3RyaWN0XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAgICd1bmtub3duJyxcbiAgICAgICAgICAgICAgICBibG9ja3M6IGJsb2Nrcy5nZW5lcmFsTG9vc2VcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IENyZWRpdENhcmREZXRlY3Rvcjtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIERhdGVGb3JtYXR0ZXIgPSBmdW5jdGlvbiAoZGF0ZVBhdHRlcm4pIHtcbiAgICB2YXIgb3duZXIgPSB0aGlzO1xuXG4gICAgb3duZXIuYmxvY2tzID0gW107XG4gICAgb3duZXIuZGF0ZVBhdHRlcm4gPSBkYXRlUGF0dGVybjtcbiAgICBvd25lci5pbml0QmxvY2tzKCk7XG59O1xuXG5EYXRlRm9ybWF0dGVyLnByb3RvdHlwZSA9IHtcbiAgICBpbml0QmxvY2tzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXM7XG4gICAgICAgIG93bmVyLmRhdGVQYXR0ZXJuLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09ICdZJykge1xuICAgICAgICAgICAgICAgIG93bmVyLmJsb2Nrcy5wdXNoKDQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvd25lci5ibG9ja3MucHVzaCgyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGdldEJsb2NrczogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ibG9ja3M7XG4gICAgfSxcblxuICAgIGdldFZhbGlkYXRlZERhdGU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCByZXN1bHQgPSAnJztcblxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL1teXFxkXS9nLCAnJyk7XG5cbiAgICAgICAgb3duZXIuYmxvY2tzLmZvckVhY2goZnVuY3Rpb24gKGxlbmd0aCwgaW5kZXgpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1YiA9IHZhbHVlLnNsaWNlKDAsIGxlbmd0aCksXG4gICAgICAgICAgICAgICAgICAgIHN1YjAgPSBzdWIuc2xpY2UoMCwgMSksXG4gICAgICAgICAgICAgICAgICAgIHJlc3QgPSB2YWx1ZS5zbGljZShsZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgc3dpdGNoIChvd25lci5kYXRlUGF0dGVybltpbmRleF0pIHtcbiAgICAgICAgICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN1YiA9PT0gJzAwJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ViID0gJzAxJztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXJzZUludChzdWIwLCAxMCkgPiAzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWIgPSAnMCcgKyBzdWIwO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhcnNlSW50KHN1YiwgMTApID4gMzEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YiA9ICczMSc7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgJ20nOlxuICAgICAgICAgICAgICAgICAgICBpZiAoc3ViID09PSAnMDAnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWIgPSAnMDEnO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhcnNlSW50KHN1YjAsIDEwKSA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YiA9ICcwJyArIHN1YjA7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyc2VJbnQoc3ViLCAxMCkgPiAxMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ViID0gJzEyJztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBzdWI7XG5cbiAgICAgICAgICAgICAgICAvLyB1cGRhdGUgcmVtYWluaW5nIHN0cmluZ1xuICAgICAgICAgICAgICAgIHZhbHVlID0gcmVzdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59O1xuXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IERhdGVGb3JtYXR0ZXI7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBOdW1lcmFsRm9ybWF0dGVyID0gZnVuY3Rpb24gKG51bWVyYWxEZWNpbWFsTWFyayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bWVyYWxEZWNpbWFsU2NhbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGltaXRlcikge1xuICAgIHZhciBvd25lciA9IHRoaXM7XG5cbiAgICBvd25lci5udW1lcmFsRGVjaW1hbE1hcmsgPSBudW1lcmFsRGVjaW1hbE1hcmsgfHwgJy4nO1xuICAgIG93bmVyLm51bWVyYWxEZWNpbWFsU2NhbGUgPSBudW1lcmFsRGVjaW1hbFNjYWxlID49IDAgPyBudW1lcmFsRGVjaW1hbFNjYWxlIDogMjtcbiAgICBvd25lci5udW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSA9IG51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlIHx8IE51bWVyYWxGb3JtYXR0ZXIuZ3JvdXBTdHlsZS50aG91c2FuZDtcbiAgICBvd25lci5kZWxpbWl0ZXIgPSAoZGVsaW1pdGVyIHx8IGRlbGltaXRlciA9PT0gJycpID8gZGVsaW1pdGVyIDogJywnO1xuICAgIG93bmVyLmRlbGltaXRlclJFID0gZGVsaW1pdGVyID8gbmV3IFJlZ0V4cCgnXFxcXCcgKyBkZWxpbWl0ZXIsICdnJykgOiAnJztcbn07XG5cbk51bWVyYWxGb3JtYXR0ZXIuZ3JvdXBTdHlsZSA9IHtcbiAgICB0aG91c2FuZDogJ3Rob3VzYW5kJyxcbiAgICBsYWtoOiAgICAgJ2xha2gnLFxuICAgIHdhbjogICAgICAnd2FuJ1xufTtcblxuTnVtZXJhbEZvcm1hdHRlci5wcm90b3R5cGUgPSB7XG4gICAgZ2V0UmF3VmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZSh0aGlzLmRlbGltaXRlclJFLCAnJykucmVwbGFjZSh0aGlzLm51bWVyYWxEZWNpbWFsTWFyaywgJy4nKTtcbiAgICB9LFxuXG4gICAgZm9ybWF0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcGFydHMsIHBhcnRJbnRlZ2VyLCBwYXJ0RGVjaW1hbCA9ICcnO1xuXG4gICAgICAgIC8vIHN0cmlwIGFscGhhYmV0IGxldHRlcnNcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9bQS1aYS16XS9nLCAnJylcblxuICAgICAgICAgICAgLy8gcmVwbGFjZSB0aGUgZmlyc3QgZGVjaW1hbCBtYXJrIHdpdGggcmVzZXJ2ZWQgcGxhY2Vob2xkZXJcbiAgICAgICAgICAgIC5yZXBsYWNlKG93bmVyLm51bWVyYWxEZWNpbWFsTWFyaywgJ00nKVxuXG4gICAgICAgICAgICAvLyBzdHJpcCB0aGUgbm9uIG51bWVyaWMgbGV0dGVycyBleGNlcHQgTVxuICAgICAgICAgICAgLnJlcGxhY2UoL1teXFxkTV0vZywgJycpXG5cbiAgICAgICAgICAgIC8vIHJlcGxhY2UgbWFya1xuICAgICAgICAgICAgLnJlcGxhY2UoJ00nLCBvd25lci5udW1lcmFsRGVjaW1hbE1hcmspXG5cbiAgICAgICAgICAgIC8vIHN0cmlwIGxlYWRpbmcgMFxuICAgICAgICAgICAgLnJlcGxhY2UoL14oLSk/MCsoPz1cXGQpLywgJyQxJyk7XG5cbiAgICAgICAgcGFydEludGVnZXIgPSB2YWx1ZTtcblxuICAgICAgICBpZiAodmFsdWUuaW5kZXhPZihvd25lci5udW1lcmFsRGVjaW1hbE1hcmspID49IDApIHtcbiAgICAgICAgICAgIHBhcnRzID0gdmFsdWUuc3BsaXQob3duZXIubnVtZXJhbERlY2ltYWxNYXJrKTtcbiAgICAgICAgICAgIHBhcnRJbnRlZ2VyID0gcGFydHNbMF07XG4gICAgICAgICAgICBwYXJ0RGVjaW1hbCA9IG93bmVyLm51bWVyYWxEZWNpbWFsTWFyayArIHBhcnRzWzFdLnNsaWNlKDAsIG93bmVyLm51bWVyYWxEZWNpbWFsU2NhbGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoIChvd25lci5udW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSkge1xuICAgICAgICBjYXNlIE51bWVyYWxGb3JtYXR0ZXIuZ3JvdXBTdHlsZS5sYWtoOlxuICAgICAgICAgICAgcGFydEludGVnZXIgPSBwYXJ0SW50ZWdlci5yZXBsYWNlKC8oXFxkKSg/PShcXGRcXGQpK1xcZCQpL2csICckMScgKyBvd25lci5kZWxpbWl0ZXIpO1xuXG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIE51bWVyYWxGb3JtYXR0ZXIuZ3JvdXBTdHlsZS53YW46XG4gICAgICAgICAgICBwYXJ0SW50ZWdlciA9IHBhcnRJbnRlZ2VyLnJlcGxhY2UoLyhcXGQpKD89KFxcZHs0fSkrJCkvZywgJyQxJyArIG93bmVyLmRlbGltaXRlcik7XG5cbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBwYXJ0SW50ZWdlciA9IHBhcnRJbnRlZ2VyLnJlcGxhY2UoLyhcXGQpKD89KFxcZHszfSkrJCkvZywgJyQxJyArIG93bmVyLmRlbGltaXRlcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFydEludGVnZXIudG9TdHJpbmcoKSArIChvd25lci5udW1lcmFsRGVjaW1hbFNjYWxlID4gMCA/IHBhcnREZWNpbWFsLnRvU3RyaW5nKCkgOiAnJyk7XG4gICAgfVxufTtcblxuaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBOdW1lcmFsRm9ybWF0dGVyO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgUGhvbmVGb3JtYXR0ZXIgPSBmdW5jdGlvbiAoZm9ybWF0dGVyLCBkZWxpbWl0ZXIpIHtcbiAgICB2YXIgb3duZXIgPSB0aGlzO1xuXG4gICAgb3duZXIuZGVsaW1pdGVyID0gKGRlbGltaXRlciB8fCBkZWxpbWl0ZXIgPT09ICcnKSA/IGRlbGltaXRlciA6ICcgJztcbiAgICBvd25lci5kZWxpbWl0ZXJSRSA9IGRlbGltaXRlciA/IG5ldyBSZWdFeHAoJ1xcXFwnICsgZGVsaW1pdGVyLCAnZycpIDogJyc7XG5cbiAgICBvd25lci5mb3JtYXR0ZXIgPSBmb3JtYXR0ZXI7XG59O1xuXG5QaG9uZUZvcm1hdHRlci5wcm90b3R5cGUgPSB7XG4gICAgc2V0Rm9ybWF0dGVyOiBmdW5jdGlvbiAoZm9ybWF0dGVyKSB7XG4gICAgICAgIHRoaXMuZm9ybWF0dGVyID0gZm9ybWF0dGVyO1xuICAgIH0sXG5cbiAgICBmb3JtYXQ6IGZ1bmN0aW9uIChwaG9uZU51bWJlcikge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzO1xuXG4gICAgICAgIG93bmVyLmZvcm1hdHRlci5jbGVhcigpO1xuXG4gICAgICAgIC8vIG9ubHkga2VlcCBudW1iZXIgYW5kICtcbiAgICAgICAgcGhvbmVOdW1iZXIgPSBwaG9uZU51bWJlci5yZXBsYWNlKC9bXlxcZCtdL2csICcnKTtcblxuICAgICAgICAvLyBzdHJpcCBkZWxpbWl0ZXJcbiAgICAgICAgcGhvbmVOdW1iZXIgPSBwaG9uZU51bWJlci5yZXBsYWNlKG93bmVyLmRlbGltaXRlclJFLCAnJyk7XG5cbiAgICAgICAgdmFyIHJlc3VsdCA9ICcnLCBjdXJyZW50LCB2YWxpZGF0ZWQgPSBmYWxzZTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMCwgaU1heCA9IHBob25lTnVtYmVyLmxlbmd0aDsgaSA8IGlNYXg7IGkrKykge1xuICAgICAgICAgICAgY3VycmVudCA9IG93bmVyLmZvcm1hdHRlci5pbnB1dERpZ2l0KHBob25lTnVtYmVyLmNoYXJBdChpKSk7XG5cbiAgICAgICAgICAgIC8vIGhhcyAoKS0gb3Igc3BhY2UgaW5zaWRlXG4gICAgICAgICAgICBpZiAoL1tcXHMoKS1dL2cudGVzdChjdXJyZW50KSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGN1cnJlbnQ7XG5cbiAgICAgICAgICAgICAgICB2YWxpZGF0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIXZhbGlkYXRlZCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBjdXJyZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBlbHNlOiBvdmVyIGxlbmd0aCBpbnB1dFxuICAgICAgICAgICAgICAgIC8vIGl0IHR1cm5zIHRvIGludmFsaWQgbnVtYmVyIGFnYWluXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzdHJpcCAoKVxuICAgICAgICAvLyBlLmcuIFVTOiA3MTYxMjM0NTY3IHJldHVybnMgKDcxNikgMTIzLTQ1NjdcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoL1soKV0vZywgJycpO1xuICAgICAgICAvLyByZXBsYWNlIGxpYnJhcnkgZGVsaW1pdGVyIHdpdGggdXNlciBjdXN0b21pemVkIGRlbGltaXRlclxuICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZSgvW1xccy1dL2csIG93bmVyLmRlbGltaXRlcik7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59O1xuXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IFBob25lRm9ybWF0dGVyO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgVXRpbCA9IHtcbiAgICBub29wOiBmdW5jdGlvbiAoKSB7XG4gICAgfSxcblxuICAgIHN0cmlwOiBmdW5jdGlvbiAodmFsdWUsIHJlKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKHJlLCAnJyk7XG4gICAgfSxcblxuICAgIGhlYWRTdHI6IGZ1bmN0aW9uIChzdHIsIGxlbmd0aCkge1xuICAgICAgICByZXR1cm4gc3RyLnNsaWNlKDAsIGxlbmd0aCk7XG4gICAgfSxcblxuICAgIGdldE1heExlbmd0aDogZnVuY3Rpb24gKGJsb2Nrcykge1xuICAgICAgICByZXR1cm4gYmxvY2tzLnJlZHVjZShmdW5jdGlvbiAocHJldmlvdXMsIGN1cnJlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBwcmV2aW91cyArIGN1cnJlbnQ7XG4gICAgICAgIH0sIDApO1xuICAgIH0sXG5cbiAgICAvLyBzdHJpcCB2YWx1ZSBieSBwcmVmaXggbGVuZ3RoXG4gICAgLy8gZm9yIHByZWZpeDogUFJFXG4gICAgLy8gKFBSRTEyMywgMykgLT4gMTIzXG4gICAgLy8gKFBSMTIzLCAzKSAtPiAyMyB0aGlzIGhhcHBlbnMgd2hlbiB1c2VyIGhpdHMgYmFja3NwYWNlIGluIGZyb250IG9mIFwiUFJFXCJcbiAgICBnZXRQcmVmaXhTdHJpcHBlZFZhbHVlOiBmdW5jdGlvbiAodmFsdWUsIHByZWZpeExlbmd0aCkge1xuICAgICAgICByZXR1cm4gdmFsdWUuc2xpY2UocHJlZml4TGVuZ3RoKTtcbiAgICB9LFxuXG4gICAgZ2V0Rm9ybWF0dGVkVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSwgYmxvY2tzLCBibG9ja3NMZW5ndGgsIGRlbGltaXRlcikge1xuICAgICAgICB2YXIgcmVzdWx0ID0gJyc7XG5cbiAgICAgICAgYmxvY2tzLmZvckVhY2goZnVuY3Rpb24gKGxlbmd0aCwgaW5kZXgpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1YiA9IHZhbHVlLnNsaWNlKDAsIGxlbmd0aCksXG4gICAgICAgICAgICAgICAgICAgIHJlc3QgPSB2YWx1ZS5zbGljZShsZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IHN1YjtcblxuICAgICAgICAgICAgICAgIGlmIChzdWIubGVuZ3RoID09PSBsZW5ndGggJiYgaW5kZXggPCBibG9ja3NMZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSBkZWxpbWl0ZXI7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gdXBkYXRlIHJlbWFpbmluZyBzdHJpbmdcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHJlc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufTtcblxuaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBVdGlsO1xufVxuIl19
