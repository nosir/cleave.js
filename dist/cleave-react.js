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
            phoneRegionCode = nextProps.options.phoneRegionCode;

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

        event.target.rawValue = Util.strip(pps.result, pps.delimiterRE);

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
        if (prev === pps.result) {
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
        target.numeralDecimalScale = opts.numeralDecimalScale || 2;
        target.numeralDecimalMark = opts.numeralDecimalMark || '.';
        target.numeralThousandsGroupStyle = opts.numeralThousandsGroupStyle || 'thousand';

        // others
        target.numericOnly = target.creditCard || target.date || !!opts.numericOnly;

        target.uppercase = !!opts.uppercase;
        target.lowercase = !!opts.lowercase;

        target.prefix = target.creditCard || target.phone || target.date ? '' : opts.prefix || '';
        target.prefixLength = target.prefix.length;

        target.initValue = target.prefix + (opts.initValue || '');

        target.delimiter = opts.delimiter || (target.date ? '/' : target.numeral ? ',' : ' ');
        target.delimiterRE = new RegExp(target.delimiter, 'g');

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

if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && _typeof(module.exports) === 'object') {
    module.exports = exports = DateFormatter;
}

},{}],6:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var NumeralFormatter = function NumeralFormatter(numeralDecimalMark, numeralDecimalScale, numeralThousandsGroupStyle, delimiter) {
    var owner = this;

    owner.numeralDecimalMark = numeralDecimalMark || '.';
    owner.numeralDecimalScale = numeralDecimalScale || 2;
    owner.numeralThousandsGroupStyle = numeralThousandsGroupStyle || NumeralFormatter.groupStyle.thousand;
    owner.delimiter = delimiter || ',';
};

NumeralFormatter.groupStyle = {
    thousand: 'thousand',
    lakh: 'lakh',
    wan: 'wan'
};

NumeralFormatter.prototype = {
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

        return partInteger.toString() + partDecimal.toString();
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

    owner.delimiter = delimiter || ' ';
    owner.delimiterRE = new RegExp(owner.delimiter, 'g');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZWFjdC5qcyIsInNyYy9DbGVhdmUucmVhY3QuanMiLCJzcmMvY29tbW9uL0RlZmF1bHRQcm9wZXJ0aWVzLmpzIiwic3JjL3Nob3J0Y3V0cy9DcmVkaXRDYXJkRGV0ZWN0b3IuanMiLCJzcmMvc2hvcnRjdXRzL0RhdGVGb3JtYXR0ZXIuanMiLCJzcmMvc2hvcnRjdXRzL051bWVyYWxGb3JtYXR0ZXIuanMiLCJzcmMvc2hvcnRjdXRzL1Bob25lRm9ybWF0dGVyLmpzIiwic3JjL3V0aWxzL1V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQTs7Ozs7Ozs7OztBQ0FBOzs7Ozs7QUFFQSxJQUFJLFFBQVEsUUFBUSxPQUFSLENBQVo7O0FBRUEsSUFBSSxtQkFBbUIsUUFBUSw4QkFBUixDQUF2QjtBQUNBLElBQUksZ0JBQWdCLFFBQVEsMkJBQVIsQ0FBcEI7QUFDQSxJQUFJLGlCQUFpQixRQUFRLDRCQUFSLENBQXJCO0FBQ0EsSUFBSSxxQkFBcUIsUUFBUSxnQ0FBUixDQUF6QjtBQUNBLElBQUksT0FBTyxRQUFRLGNBQVIsQ0FBWDtBQUNBLElBQUksb0JBQW9CLFFBQVEsNEJBQVIsQ0FBeEI7O0FBRUEsSUFBSSxTQUFTLE1BQU0sV0FBTixDQUFrQjtBQUFBOztBQUMzQix1QkFBbUIsNkJBQVk7QUFDM0IsYUFBSyxJQUFMO0FBQ0gsS0FIMEI7O0FBSzNCLCtCQUEyQixtQ0FBVSxTQUFWLEVBQXFCO0FBQzVDLFlBQUksUUFBUSxJQUFaO0FBQUEsWUFDSSxrQkFBa0IsVUFBVSxPQUFWLENBQWtCLGVBRHhDOzs7QUFJQSxZQUFJLG1CQUFtQixvQkFBb0IsTUFBTSxVQUFOLENBQWlCLGVBQTVELEVBQTZFO0FBQ3pFLGtCQUFNLFVBQU4sQ0FBaUIsZUFBakIsR0FBbUMsZUFBbkM7QUFDQSxrQkFBTSxrQkFBTjtBQUNBLGtC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QVUsS0FBVixFQUFpQixZQUFqQixFQUErQjtBQUNuRCxlQUFPLE1BQU0sS0FBTixDQUFZLFlBQVosQ0FBUDtBQUNILEtBeEJNOztBQTBCUCx1QkFBbUIsMkJBQVUsS0FBVixFQUFpQixNQUFqQixFQUF5QixZQUF6QixFQUF1QyxTQUF2QyxFQUFrRDtBQUNqRSxZQUFJLFNBQVMsRUFBYjs7QUFFQSxlQUFPLE9BQVAsQ0FBZSxVQUFVLE1BQVYsRUFBa0IsS0FBbEIsRUFBeUI7QUFDcEMsZ0JBQUksTUFBTSxNQUFOLEdBQWUsQ0FBbkIsRUFBc0I7QUFDbEIsb0JBQUksTUFBTSxNQUFNLEtBQU4sQ0FBWSxDQUFaLEVBQWUsTUFBZixDQUFWO0FBQUEsb0JBQ0ksT0FBTyxNQUFNLEtBQU4sQ0FBWSxNQUFaLENBRFg7O0FBR0EsMEJBQVUsR0FBVjs7QUFFQSxvQkFBSSxJQUFJLE1BQUosS0FBZSxNQUFmLElBQXlCLFFBQVEsZUFBZSxDQUFwRCxFQUF1RDtBQUNuRCw4QkFBVSxTQUFWO0FBQ0g7OztBQUdELHdCQUFRLElBQVI7QUFDSDtBQUNKLFNBZEQ7O0FBZ0JBLGVBQU8sTUFBUDtBQUNIO0FBOUNNLENBQVg7O0FBaURBLElBQUksUUFBTyxNQUFQLHlDQUFPLE1BQVAsT0FBa0IsUUFBbEIsSUFBOEIsUUFBTyxPQUFPLE9BQWQsTUFBMEIsUUFBNUQsRUFBc0U7QUFDbEUsV0FBTyxPQUFQLEdBQWlCLFVBQVUsSUFBM0I7QUFDSCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgQ2xlYXZlIGZyb20gJy4vc3JjL0NsZWF2ZS5yZWFjdCc7XG5cbmV4cG9ydCBkZWZhdWx0IENsZWF2ZTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxudmFyIE51bWVyYWxGb3JtYXR0ZXIgPSByZXF1aXJlKCcuL3Nob3J0Y3V0cy9OdW1lcmFsRm9ybWF0dGVyJyk7XG52YXIgRGF0ZUZvcm1hdHRlciA9IHJlcXVpcmUoJy4vc2hvcnRjdXRzL0RhdGVGb3JtYXR0ZXInKTtcbnZhciBQaG9uZUZvcm1hdHRlciA9IHJlcXVpcmUoJy4vc2hvcnRjdXRzL1Bob25lRm9ybWF0dGVyJyk7XG52YXIgQ3JlZGl0Q2FyZERldGVjdG9yID0gcmVxdWlyZSgnLi9zaG9ydGN1dHMvQ3JlZGl0Q2FyZERldGVjdG9yJyk7XG52YXIgVXRpbCA9IHJlcXVpcmUoJy4vdXRpbHMvVXRpbCcpO1xudmFyIERlZmF1bHRQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi9jb21tb24vRGVmYXVsdFByb3BlcnRpZXMnKTtcblxudmFyIENsZWF2ZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICBjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmluaXQoKTtcbiAgICB9LFxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5leHRQcm9wcykge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxuICAgICAgICAgICAgcGhvbmVSZWdpb25Db2RlID0gbmV4dFByb3BzLm9wdGlvbnMucGhvbmVSZWdpb25Db2RlO1xuXG4gICAgICAgIC8vIHVwZGF0ZSBwaG9uZSByZWdpb24gY29kZVxuICAgICAgICBpZiAocGhvbmVSZWdpb25Db2RlICYmIHBob25lUmVnaW9uQ29kZSAhPT0gb3duZXIucHJvcGVydGllcy5waG9uZVJlZ2lvbkNvZGUpIHtcbiAgICAgICAgICAgIG93bmVyLnByb3BlcnRpZXMucGhvbmVSZWdpb25Db2RlID0gcGhvbmVSZWdpb25Db2RlO1xuICAgICAgICAgICAgb3duZXIuaW5pdFBob25lRm9ybWF0dGVyKCk7XG4gICAgICAgICAgICBvd25lci5vbklucHV0KG93bmVyLnByb3BlcnRpZXMucmVzdWx0KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIHsgdmFsdWUsIG9wdGlvbnMsIG9uS2V5RG93biwgb25DaGFuZ2UsIC4uLm90aGVyIH0gPSBvd25lci5wcm9wcztcblxuICAgICAgICBvd25lci5yZWdpc3RlcmVkRXZlbnRzID0ge1xuICAgICAgICAgICAgb25DaGFuZ2U6ICBvbkNoYW5nZSB8fCBVdGlsLm5vb3AsXG4gICAgICAgICAgICBvbktleURvd246IG9uS2V5RG93biB8fCBVdGlsLm5vb3BcbiAgICAgICAgfTtcblxuICAgICAgICBvcHRpb25zLmluaXRWYWx1ZSA9IHZhbHVlO1xuXG4gICAgICAgIG93bmVyLnByb3BlcnRpZXMgPSBEZWZhdWx0UHJvcGVydGllcy5hc3NpZ24oe30sIG9wdGlvbnMpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBvdGhlcjogb3RoZXIsXG4gICAgICAgICAgICB2YWx1ZTogb3duZXIucHJvcGVydGllcy5yZXN1bHRcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxuICAgICAgICAgICAgcHBzID0gb3duZXIucHJvcGVydGllcztcblxuICAgICAgICAvLyBzbyBubyBuZWVkIGZvciB0aGlzIGxpYiBhdCBhbGxcbiAgICAgICAgaWYgKCFwcHMubnVtZXJhbCAmJiAhcHBzLnBob25lICYmICFwcHMuY3JlZGl0Q2FyZCAmJiAhcHBzLmRhdGUgJiYgKHBwcy5ibG9ja3NMZW5ndGggPT09IDAgJiYgIXBwcy5wcmVmaXgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBwcHMubWF4TGVuZ3RoID0gVXRpbC5nZXRNYXhMZW5ndGgocHBzLmJsb2Nrcyk7XG5cbiAgICAgICAgb3duZXIuaW5pdFBob25lRm9ybWF0dGVyKCk7XG4gICAgICAgIG93bmVyLmluaXREYXRlRm9ybWF0dGVyKCk7XG4gICAgICAgIG93bmVyLmluaXROdW1lcmFsRm9ybWF0dGVyKCk7XG5cbiAgICAgICAgb3duZXIub25JbnB1dChwcHMuaW5pdFZhbHVlKTtcbiAgICB9LFxuXG4gICAgaW5pdE51bWVyYWxGb3JtYXR0ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XG5cbiAgICAgICAgaWYgKCFwcHMubnVtZXJhbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcHBzLm51bWVyYWxGb3JtYXR0ZXIgPSBuZXcgTnVtZXJhbEZvcm1hdHRlcihcbiAgICAgICAgICAgIHBwcy5udW1lcmFsRGVjaW1hbE1hcmssXG4gICAgICAgICAgICBwcHMubnVtZXJhbERlY2ltYWxTY2FsZSxcbiAgICAgICAgICAgIHBwcy5udW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSxcbiAgICAgICAgICAgIHBwcy5kZWxpbWl0ZXJcbiAgICAgICAgKTtcbiAgICB9LFxuXG4gICAgaW5pdERhdGVGb3JtYXR0ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XG5cbiAgICAgICAgaWYgKCFwcHMuZGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcHBzLmRhdGVGb3JtYXR0ZXIgPSBuZXcgRGF0ZUZvcm1hdHRlcihwcHMuZGF0ZVBhdHRlcm4pO1xuICAgICAgICBwcHMuYmxvY2tzID0gcHBzLmRhdGVGb3JtYXR0ZXIuZ2V0QmxvY2tzKCk7XG4gICAgICAgIHBwcy5ibG9ja3NMZW5ndGggPSBwcHMuYmxvY2tzLmxlbmd0aDtcbiAgICAgICAgcHBzLm1heExlbmd0aCA9IFV0aWwuZ2V0TWF4TGVuZ3RoKHBwcy5ibG9ja3MpO1xuICAgIH0sXG5cbiAgICBpbml0UGhvbmVGb3JtYXR0ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XG5cbiAgICAgICAgaWYgKCFwcHMucGhvbmUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENsZWF2ZS5Bc1lvdVR5cGVGb3JtYXR0ZXIgc2hvdWxkIGJlIHByb3ZpZGVkIGJ5XG4gICAgICAgIC8vIGV4dGVybmFsIGdvb2dsZSBjbG9zdXJlIGxpYlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcHBzLnBob25lRm9ybWF0dGVyID0gbmV3IFBob25lRm9ybWF0dGVyKFxuICAgICAgICAgICAgICAgIG5ldyB3aW5kb3cuQ2xlYXZlLkFzWW91VHlwZUZvcm1hdHRlcihwcHMucGhvbmVSZWdpb25Db2RlKSxcbiAgICAgICAgICAgICAgICBwcHMuZGVsaW1pdGVyXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQbGVhc2UgaW5jbHVkZSBwaG9uZS10eXBlLWZvcm1hdHRlci57Y291bnRyeX0uanMgbGliJyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgb25LZXlEb3duOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIHBwcyA9IG93bmVyLnByb3BlcnRpZXMsXG4gICAgICAgICAgICBjaGFyQ29kZSA9IGV2ZW50LndoaWNoIHx8IGV2ZW50LmtleUNvZGU7XG5cbiAgICAgICAgLy8gaGl0IGJhY2tzcGFjZSB3aGVuIGxhc3QgY2hhcmFjdGVyIGlzIGRlbGltaXRlclxuICAgICAgICBpZiAoY2hhckNvZGUgPT09IDggJiYgcHBzLnJlc3VsdC5zbGljZSgtMSkgPT09IHBwcy5kZWxpbWl0ZXIpIHtcbiAgICAgICAgICAgIHBwcy5iYWNrc3BhY2UgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHBzLmJhY2tzcGFjZSA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgb3duZXIucmVnaXN0ZXJlZEV2ZW50cy5vbktleURvd24oZXZlbnQpO1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XG5cbiAgICAgICAgb3duZXIub25JbnB1dChldmVudC50YXJnZXQudmFsdWUpO1xuXG4gICAgICAgIGV2ZW50LnRhcmdldC5yYXdWYWx1ZSA9IFV0aWwuc3RyaXAocHBzLnJlc3VsdCwgcHBzLmRlbGltaXRlclJFKTtcblxuICAgICAgICBvd25lci5yZWdpc3RlcmVkRXZlbnRzLm9uQ2hhbmdlKGV2ZW50KTtcbiAgICB9LFxuXG4gICAgb25JbnB1dDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHBwcyA9IG93bmVyLnByb3BlcnRpZXMsXG4gICAgICAgICAgICBwcmV2ID0gcHBzLnJlc3VsdDtcblxuICAgICAgICAvLyBjYXNlIDE6IGRlbGV0ZSBvbmUgbW9yZSBjaGFyYWN0ZXIgXCI0XCJcbiAgICAgICAgLy8gMTIzNCp8IC0+IGhpdCBiYWNrc3BhY2UgLT4gMTIzfFxuICAgICAgICAvLyBjYXNlIDI6IGxhc3QgY2hhcmFjdGVyIGlzIG5vdCBkZWxpbWl0ZXIgd2hpY2ggaXM6XG4gICAgICAgIC8vIDEyfDM0KiAtPiBoaXQgYmFja3NwYWNlIC0+IDF8MzQqXG5cbiAgICAgICAgaWYgKHBwcy5iYWNrc3BhY2UgJiYgdmFsdWUuc2xpY2UoLTEpICE9PSBwcHMuZGVsaW1pdGVyKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IFV0aWwuaGVhZFN0cih2YWx1ZSwgdmFsdWUubGVuZ3RoIC0gMSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBwaG9uZSBmb3JtYXR0ZXJcbiAgICAgICAgaWYgKHBwcy5waG9uZSkge1xuICAgICAgICAgICAgcHBzLnJlc3VsdCA9IHBwcy5waG9uZUZvcm1hdHRlci5mb3JtYXQodmFsdWUpO1xuICAgICAgICAgICAgb3duZXIudXBkYXRlVmFsdWVTdGF0ZSgpO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBudW1lcmFsIGZvcm1hdHRlclxuICAgICAgICBpZiAocHBzLm51bWVyYWwpIHtcbiAgICAgICAgICAgIHBwcy5yZXN1bHQgPSBwcHMucHJlZml4ICsgcHBzLm51bWVyYWxGb3JtYXR0ZXIuZm9ybWF0KHZhbHVlKTtcbiAgICAgICAgICAgIG93bmVyLnVwZGF0ZVZhbHVlU3RhdGUoKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZGF0ZVxuICAgICAgICBpZiAocHBzLmRhdGUpIHtcbiAgICAgICAgICAgIHZhbHVlID0gcHBzLmRhdGVGb3JtYXR0ZXIuZ2V0VmFsaWRhdGVkRGF0ZSh2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzdHJpcCBkZWxpbWl0ZXJzXG4gICAgICAgIHZhbHVlID0gVXRpbC5zdHJpcCh2YWx1ZSwgcHBzLmRlbGltaXRlclJFKTtcblxuICAgICAgICAvLyBzdHJpcCBwcmVmaXhcbiAgICAgICAgdmFsdWUgPSBVdGlsLmdldFByZWZpeFN0cmlwcGVkVmFsdWUodmFsdWUsIHBwcy5wcmVmaXhMZW5ndGgpO1xuXG4gICAgICAgIC8vIHN0cmlwIG5vbi1udW1lcmljIGNoYXJhY3RlcnNcbiAgICAgICAgdmFsdWUgPSBwcHMubnVtZXJpY09ubHkgPyBVdGlsLnN0cmlwKHZhbHVlLCAvW15cXGRdL2cpIDogdmFsdWU7XG5cbiAgICAgICAgLy8gY29udmVydCBjYXNlXG4gICAgICAgIHZhbHVlID0gcHBzLnVwcGVyY2FzZSA/IHZhbHVlLnRvVXBwZXJDYXNlKCkgOiB2YWx1ZTtcbiAgICAgICAgdmFsdWUgPSBwcHMubG93ZXJjYXNlID8gdmFsdWUudG9Mb3dlckNhc2UoKSA6IHZhbHVlO1xuXG4gICAgICAgIC8vIHByZWZpeFxuICAgICAgICBpZiAocHBzLnByZWZpeCkge1xuICAgICAgICAgICAgdmFsdWUgPSBwcHMucHJlZml4ICsgdmFsdWU7XG5cbiAgICAgICAgICAgIC8vIG5vIGJsb2NrcyBzcGVjaWZpZWQsIG5vIG5lZWQgdG8gZG8gZm9ybWF0dGluZ1xuICAgICAgICAgICAgaWYgKHBwcy5ibG9ja3NMZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBwcHMucmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgb3duZXIudXBkYXRlVmFsdWVTdGF0ZSgpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gdXBkYXRlIGNyZWRpdCBjYXJkIHByb3BzXG4gICAgICAgIGlmIChwcHMuY3JlZGl0Q2FyZCkge1xuICAgICAgICAgICAgb3duZXIudXBkYXRlQ3JlZGl0Q2FyZFByb3BzQnlWYWx1ZSh2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzdHJpcCBvdmVyIGxlbmd0aCBjaGFyYWN0ZXJzXG4gICAgICAgIHZhbHVlID0gVXRpbC5oZWFkU3RyKHZhbHVlLCBwcHMubWF4TGVuZ3RoKTtcblxuICAgICAgICAvLyBhcHBseSBibG9ja3NcbiAgICAgICAgcHBzLnJlc3VsdCA9IFV0aWwuZ2V0Rm9ybWF0dGVkVmFsdWUodmFsdWUsIHBwcy5ibG9ja3MsIHBwcy5ibG9ja3NMZW5ndGgsIHBwcy5kZWxpbWl0ZXIpO1xuXG4gICAgICAgIC8vIG5vdGhpbmcgY2hhbmdlZFxuICAgICAgICAvLyBwcmV2ZW50IHVwZGF0ZSB2YWx1ZSB0byBhdm9pZCBjYXJldCBwb3NpdGlvbiBjaGFuZ2VcbiAgICAgICAgaWYgKHByZXYgPT09IHBwcy5yZXN1bHQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIG93bmVyLnVwZGF0ZVZhbHVlU3RhdGUoKTtcbiAgICB9LFxuXG4gICAgdXBkYXRlQ3JlZGl0Q2FyZFByb3BzQnlWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHBwcyA9IG93bmVyLnByb3BlcnRpZXMsXG4gICAgICAgICAgICBjcmVkaXRDYXJkSW5mbztcblxuICAgICAgICAvLyBBdCBsZWFzdCBvbmUgb2YgdGhlIGZpcnN0IDQgY2hhcmFjdGVycyBoYXMgY2hhbmdlZFxuICAgICAgICBpZiAoVXRpbC5oZWFkU3RyKHBwcy5yZXN1bHQsIDQpID09PSBVdGlsLmhlYWRTdHIodmFsdWUsIDQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjcmVkaXRDYXJkSW5mbyA9IENyZWRpdENhcmREZXRlY3Rvci5nZXRJbmZvKHZhbHVlLCBwcHMuY3JlZGl0Q2FyZFN0cmljdE1vZGUpO1xuXG4gICAgICAgIHBwcy5ibG9ja3MgPSBjcmVkaXRDYXJkSW5mby5ibG9ja3M7XG4gICAgICAgIHBwcy5ibG9ja3NMZW5ndGggPSBwcHMuYmxvY2tzLmxlbmd0aDtcbiAgICAgICAgcHBzLm1heExlbmd0aCA9IFV0aWwuZ2V0TWF4TGVuZ3RoKHBwcy5ibG9ja3MpO1xuXG4gICAgICAgIC8vIGNyZWRpdCBjYXJkIHR5cGUgY2hhbmdlZFxuICAgICAgICBpZiAocHBzLmNyZWRpdENhcmRUeXBlICE9PSBjcmVkaXRDYXJkSW5mby50eXBlKSB7XG4gICAgICAgICAgICBwcHMuY3JlZGl0Q2FyZFR5cGUgPSBjcmVkaXRDYXJkSW5mby50eXBlO1xuXG4gICAgICAgICAgICBwcHMub25DcmVkaXRDYXJkVHlwZUNoYW5nZWQuY2FsbChvd25lciwgcHBzLmNyZWRpdENhcmRUeXBlKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICB1cGRhdGVWYWx1ZVN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3ZhbHVlOiB0aGlzLnByb3BlcnRpZXMucmVzdWx0fSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiB7Li4ub3duZXIuc3RhdGUub3RoZXJ9XG4gICAgICAgICAgICAgICAgICAgdmFsdWU9e293bmVyLnN0YXRlLnZhbHVlfVxuICAgICAgICAgICAgICAgICAgIG9uS2V5RG93bj17b3duZXIub25LZXlEb3dufVxuICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtvd25lci5vbkNoYW5nZX0vPlxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy5DbGVhdmUgPSBDbGVhdmU7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogUHJvcHMgQXNzaWdubWVudFxuICpcbiAqIFNlcGFyYXRlIHRoaXMsIHNvIHJlYWN0IG1vZHVsZSBjYW4gc2hhcmUgdGhlIHVzYWdlXG4gKi9cbnZhciBEZWZhdWx0UHJvcGVydGllcyA9IHtcbiAgICAvLyBNYXliZSBjaGFuZ2UgdG8gb2JqZWN0LWFzc2lnblxuICAgIC8vIGZvciBub3cganVzdCBrZWVwIGl0IGFzIHNpbXBsZVxuICAgIGFzc2lnbjogZnVuY3Rpb24gKHRhcmdldCwgb3B0cykge1xuICAgICAgICB0YXJnZXQgPSB0YXJnZXQgfHwge307XG4gICAgICAgIG9wdHMgPSBvcHRzIHx8IHt9O1xuXG4gICAgICAgIC8vIGNyZWRpdCBjYXJkXG4gICAgICAgIHRhcmdldC5jcmVkaXRDYXJkID0gISFvcHRzLmNyZWRpdENhcmQ7XG4gICAgICAgIHRhcmdldC5jcmVkaXRDYXJkU3RyaWN0TW9kZSA9ICEhb3B0cy5jcmVkaXRDYXJkU3RyaWN0TW9kZTtcbiAgICAgICAgdGFyZ2V0LmNyZWRpdENhcmRUeXBlID0gJyc7XG4gICAgICAgIHRhcmdldC5vbkNyZWRpdENhcmRUeXBlQ2hhbmdlZCA9IG9wdHMub25DcmVkaXRDYXJkVHlwZUNoYW5nZWQgfHwgKGZ1bmN0aW9uICgpIHt9KTtcblxuICAgICAgICAvLyBwaG9uZVxuICAgICAgICB0YXJnZXQucGhvbmUgPSAhIW9wdHMucGhvbmU7XG4gICAgICAgIHRhcmdldC5waG9uZVJlZ2lvbkNvZGUgPSBvcHRzLnBob25lUmVnaW9uQ29kZSB8fCAnQVUnO1xuICAgICAgICB0YXJnZXQucGhvbmVGb3JtYXR0ZXIgPSB7fTtcblxuICAgICAgICAvLyBkYXRlXG4gICAgICAgIHRhcmdldC5kYXRlID0gISFvcHRzLmRhdGU7XG4gICAgICAgIHRhcmdldC5kYXRlUGF0dGVybiA9IG9wdHMuZGF0ZVBhdHRlcm4gfHwgWydkJywgJ20nLCAnWSddO1xuICAgICAgICB0YXJnZXQuZGF0ZUZvcm1hdHRlciA9IHt9O1xuXG4gICAgICAgIC8vIG51bWVyYWxcbiAgICAgICAgdGFyZ2V0Lm51bWVyYWwgPSAhIW9wdHMubnVtZXJhbDtcbiAgICAgICAgdGFyZ2V0Lm51bWVyYWxEZWNpbWFsU2NhbGUgPSBvcHRzLm51bWVyYWxEZWNpbWFsU2NhbGUgfHwgMjtcbiAgICAgICAgdGFyZ2V0Lm51bWVyYWxEZWNpbWFsTWFyayA9IG9wdHMubnVtZXJhbERlY2ltYWxNYXJrIHx8ICcuJztcbiAgICAgICAgdGFyZ2V0Lm51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlID0gb3B0cy5udW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSB8fCAndGhvdXNhbmQnO1xuXG4gICAgICAgIC8vIG90aGVyc1xuICAgICAgICB0YXJnZXQubnVtZXJpY09ubHkgPSB0YXJnZXQuY3JlZGl0Q2FyZCB8fCB0YXJnZXQuZGF0ZSB8fCAhIW9wdHMubnVtZXJpY09ubHk7XG5cbiAgICAgICAgdGFyZ2V0LnVwcGVyY2FzZSA9ICEhb3B0cy51cHBlcmNhc2U7XG4gICAgICAgIHRhcmdldC5sb3dlcmNhc2UgPSAhIW9wdHMubG93ZXJjYXNlO1xuXG4gICAgICAgIHRhcmdldC5wcmVmaXggPSAodGFyZ2V0LmNyZWRpdENhcmQgfHwgdGFyZ2V0LnBob25lIHx8IHRhcmdldC5kYXRlKSA/ICcnIDogKG9wdHMucHJlZml4IHx8ICcnKTtcbiAgICAgICAgdGFyZ2V0LnByZWZpeExlbmd0aCA9IHRhcmdldC5wcmVmaXgubGVuZ3RoO1xuXG4gICAgICAgIHRhcmdldC5pbml0VmFsdWUgPSB0YXJnZXQucHJlZml4ICsgKG9wdHMuaW5pdFZhbHVlIHx8ICcnKTtcblxuICAgICAgICB0YXJnZXQuZGVsaW1pdGVyID0gb3B0cy5kZWxpbWl0ZXIgfHwgKHRhcmdldC5kYXRlID8gJy8nIDogKHRhcmdldC5udW1lcmFsID8gJywnIDogJyAnKSk7XG4gICAgICAgIHRhcmdldC5kZWxpbWl0ZXJSRSA9IG5ldyBSZWdFeHAodGFyZ2V0LmRlbGltaXRlciwgJ2cnKTtcblxuICAgICAgICB0YXJnZXQuYmxvY2tzID0gb3B0cy5ibG9ja3MgfHwgW107XG4gICAgICAgIHRhcmdldC5ibG9ja3NMZW5ndGggPSB0YXJnZXQuYmxvY2tzLmxlbmd0aDtcblxuICAgICAgICB0YXJnZXQubWF4TGVuZ3RoID0gMDtcblxuICAgICAgICB0YXJnZXQuYmFja3NwYWNlID0gZmFsc2U7XG4gICAgICAgIHRhcmdldC5yZXN1bHQgPSAnJztcblxuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbn07XG5cbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gRGVmYXVsdFByb3BlcnRpZXM7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDcmVkaXRDYXJkRGV0ZWN0b3IgPSB7XG4gICAgYmxvY2tzOiB7XG4gICAgICAgIHVhdHA6ICAgICAgICAgIFs0LCA1LCA2XSxcbiAgICAgICAgYW1leDogICAgICAgICAgWzQsIDYsIDVdLFxuICAgICAgICBkaW5lcnM6ICAgICAgICBbNCwgNiwgNF0sXG4gICAgICAgIGRpc2NvdmVyOiAgICAgIFs0LCA0LCA0LCA0XSxcbiAgICAgICAgbWFzdGVyY2FyZDogICAgWzQsIDQsIDQsIDRdLFxuICAgICAgICBkYW5rb3J0OiAgICAgICBbNCwgNCwgNCwgNF0sXG4gICAgICAgIGluc3RhcGF5bWVudDogIFs0LCA0LCA0LCA0XSxcbiAgICAgICAgamNiOiAgICAgICAgICAgWzQsIDQsIDQsIDRdLFxuICAgICAgICB2aXNhOiAgICAgICAgICBbNCwgNCwgNCwgNF0sXG4gICAgICAgIGdlbmVyYWxMb29zZTogIFs0LCA0LCA0LCA0XSxcbiAgICAgICAgZ2VuZXJhbFN0cmljdDogWzQsIDQsIDQsIDddXG4gICAgfSxcblxuICAgIHJlOiB7XG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDE7IDE1IGRpZ2l0cywgbm90IHN0YXJ0cyB3aXRoIDE4MDAgKGpjYiBjYXJkKVxuICAgICAgICB1YXRwOiAvXig/ITE4MDApMVxcZHswLDE0fS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggMzQvMzc7IDE1IGRpZ2l0c1xuICAgICAgICBhbWV4OiAvXjNbNDddXFxkezAsMTN9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCA2MDExLzY1LzY0NC02NDk7IDE2IGRpZ2l0c1xuICAgICAgICBkaXNjb3ZlcjogL14oPzo2MDExfDY1XFxkezAsMn18NjRbNC05XVxcZD8pXFxkezAsMTJ9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCAzMDAtMzA1LzMwOSBvciAzNi8zOC8zOTsgMTQgZGlnaXRzXG4gICAgICAgIGRpbmVyczogL14zKD86MChbMC01XXw5KXxbNjg5XVxcZD8pXFxkezAsMTF9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCA1MS01NS8yMi0yNzsgMTYgZGlnaXRzXG4gICAgICAgIG1hc3RlcmNhcmQ6IC9eKDVbMS01XXwyWzItN10pXFxkezAsMTR9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCA1MDE5LzQxNzUvNDU3MTsgMTYgZGlnaXRzXG4gICAgICAgIGRhbmtvcnQ6IC9eKDUwMTl8NDE3NXw0NTcxKVxcZHswLDEyfS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggNjM3LTYzOTsgMTYgZGlnaXRzXG4gICAgICAgIGluc3RhcGF5bWVudDogL142M1s3LTldXFxkezAsMTN9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCAyMTMxLzE4MDAvMzU7IDE2IGRpZ2l0c1xuICAgICAgICBqY2I6IC9eKD86MjEzMXwxODAwfDM1XFxkezAsMn0pXFxkezAsMTJ9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCA0OyAxNiBkaWdpdHNcbiAgICAgICAgdmlzYTogL140XFxkezAsMTV9L1xuICAgIH0sXG5cbiAgICBnZXRJbmZvOiBmdW5jdGlvbiAodmFsdWUsIHN0cmljdE1vZGUpIHtcbiAgICAgICAgdmFyIGJsb2NrcyA9IENyZWRpdENhcmREZXRlY3Rvci5ibG9ja3MsXG4gICAgICAgICAgICByZSA9IENyZWRpdENhcmREZXRlY3Rvci5yZTtcblxuICAgICAgICAvLyBJbiB0aGVvcnksIHZpc2EgY3JlZGl0IGNhcmQgY2FuIGhhdmUgdXAgdG8gMTkgZGlnaXRzIG51bWJlci5cbiAgICAgICAgLy8gU2V0IHN0cmljdE1vZGUgdG8gdHJ1ZSB3aWxsIHJlbW92ZSB0aGUgMTYgbWF4LWxlbmd0aCByZXN0cmFpbixcbiAgICAgICAgLy8gaG93ZXZlciwgSSBuZXZlciBmb3VuZCBhbnkgd2Vic2l0ZSB2YWxpZGF0ZSBjYXJkIG51bWJlciBsaWtlXG4gICAgICAgIC8vIHRoaXMsIGhlbmNlIHByb2JhYmx5IHlvdSBkb24ndCBuZWVkIHRvIGVuYWJsZSB0aGlzIG9wdGlvbi5cbiAgICAgICAgc3RyaWN0TW9kZSA9ICEhc3RyaWN0TW9kZTtcblxuICAgICAgICBpZiAocmUuYW1leC50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAgICdhbWV4JyxcbiAgICAgICAgICAgICAgICBibG9ja3M6IGJsb2Nrcy5hbWV4XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKHJlLnVhdHAudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogICAndWF0cCcsXG4gICAgICAgICAgICAgICAgYmxvY2tzOiBibG9ja3MudWF0cFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChyZS5kaW5lcnMudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogICAnZGluZXJzJyxcbiAgICAgICAgICAgICAgICBibG9ja3M6IGJsb2Nrcy5kaW5lcnNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAocmUuZGlzY292ZXIudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogICAnZGlzY292ZXInLFxuICAgICAgICAgICAgICAgIGJsb2NrczogYmxvY2tzLmRpc2NvdmVyXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKHJlLm1hc3RlcmNhcmQudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogICAnbWFzdGVyY2FyZCcsXG4gICAgICAgICAgICAgICAgYmxvY2tzOiBibG9ja3MubWFzdGVyY2FyZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChyZS5kYW5rb3J0LnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICAgJ2RhbmtvcnQnLFxuICAgICAgICAgICAgICAgIGJsb2NrczogYmxvY2tzLmRhbmtvcnRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAocmUuaW5zdGFwYXltZW50LnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICAgJ2luc3RhcGF5bWVudCcsXG4gICAgICAgICAgICAgICAgYmxvY2tzOiBibG9ja3MuaW5zdGFwYXltZW50XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKHJlLmpjYi50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAgICdqY2InLFxuICAgICAgICAgICAgICAgIGJsb2NrczogYmxvY2tzLmpjYlxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChyZS52aXNhLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICAgJ3Zpc2EnLFxuICAgICAgICAgICAgICAgIGJsb2NrczogYmxvY2tzLnZpc2FcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAoc3RyaWN0TW9kZSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAgICd1bmtub3duJyxcbiAgICAgICAgICAgICAgICBibG9ja3M6IGJsb2Nrcy5nZW5lcmFsU3RyaWN0XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAgICd1bmtub3duJyxcbiAgICAgICAgICAgICAgICBibG9ja3M6IGJsb2Nrcy5nZW5lcmFsTG9vc2VcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IENyZWRpdENhcmREZXRlY3Rvcjtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIERhdGVGb3JtYXR0ZXIgPSBmdW5jdGlvbiAoZGF0ZVBhdHRlcm4pIHtcbiAgICB2YXIgb3duZXIgPSB0aGlzO1xuXG4gICAgb3duZXIuYmxvY2tzID0gW107XG4gICAgb3duZXIuZGF0ZVBhdHRlcm4gPSBkYXRlUGF0dGVybjtcbiAgICBvd25lci5pbml0QmxvY2tzKCk7XG59O1xuXG5EYXRlRm9ybWF0dGVyLnByb3RvdHlwZSA9IHtcbiAgICBpbml0QmxvY2tzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXM7XG4gICAgICAgIG93bmVyLmRhdGVQYXR0ZXJuLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09ICdZJykge1xuICAgICAgICAgICAgICAgIG93bmVyLmJsb2Nrcy5wdXNoKDQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvd25lci5ibG9ja3MucHVzaCgyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGdldEJsb2NrczogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ibG9ja3M7XG4gICAgfSxcblxuICAgIGdldFZhbGlkYXRlZERhdGU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCByZXN1bHQgPSAnJztcblxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL1teXFxkXS9nLCAnJyk7XG5cbiAgICAgICAgb3duZXIuYmxvY2tzLmZvckVhY2goZnVuY3Rpb24gKGxlbmd0aCwgaW5kZXgpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1YiA9IHZhbHVlLnNsaWNlKDAsIGxlbmd0aCksXG4gICAgICAgICAgICAgICAgICAgIHJlc3QgPSB2YWx1ZS5zbGljZShsZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgc3dpdGNoIChvd25lci5kYXRlUGF0dGVybltpbmRleF0pIHtcbiAgICAgICAgICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnNlSW50KHN1YiwgMTApID4gMzEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YiA9ICczMSc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnbSc6XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJzZUludChzdWIsIDEwKSA+IDEyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWIgPSAnMTInO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBzdWI7XG5cbiAgICAgICAgICAgICAgICAvLyB1cGRhdGUgcmVtYWluaW5nIHN0cmluZ1xuICAgICAgICAgICAgICAgIHZhbHVlID0gcmVzdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59O1xuXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IERhdGVGb3JtYXR0ZXI7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBOdW1lcmFsRm9ybWF0dGVyID0gZnVuY3Rpb24gKG51bWVyYWxEZWNpbWFsTWFyayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bWVyYWxEZWNpbWFsU2NhbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGltaXRlcikge1xuICAgIHZhciBvd25lciA9IHRoaXM7XG5cbiAgICBvd25lci5udW1lcmFsRGVjaW1hbE1hcmsgPSBudW1lcmFsRGVjaW1hbE1hcmsgfHwgJy4nO1xuICAgIG93bmVyLm51bWVyYWxEZWNpbWFsU2NhbGUgPSBudW1lcmFsRGVjaW1hbFNjYWxlIHx8IDI7XG4gICAgb3duZXIubnVtZXJhbFRob3VzYW5kc0dyb3VwU3R5bGUgPSBudW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSB8fCBOdW1lcmFsRm9ybWF0dGVyLmdyb3VwU3R5bGUudGhvdXNhbmQ7XG4gICAgb3duZXIuZGVsaW1pdGVyID0gZGVsaW1pdGVyIHx8ICcsJztcbn07XG5cbk51bWVyYWxGb3JtYXR0ZXIuZ3JvdXBTdHlsZSA9IHtcbiAgICB0aG91c2FuZDogJ3Rob3VzYW5kJyxcbiAgICBsYWtoOiAgICAgJ2xha2gnLFxuICAgIHdhbjogICAgICAnd2FuJ1xufTtcblxuTnVtZXJhbEZvcm1hdHRlci5wcm90b3R5cGUgPSB7XG4gICAgZm9ybWF0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcGFydHMsIHBhcnRJbnRlZ2VyLCBwYXJ0RGVjaW1hbCA9ICcnO1xuXG4gICAgICAgIC8vIHN0cmlwIGFscGhhYmV0IGxldHRlcnNcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9bQS1aYS16XS9nLCAnJylcblxuICAgICAgICAgICAgLy8gcmVwbGFjZSB0aGUgZmlyc3QgZGVjaW1hbCBtYXJrIHdpdGggcmVzZXJ2ZWQgcGxhY2Vob2xkZXJcbiAgICAgICAgICAgIC5yZXBsYWNlKG93bmVyLm51bWVyYWxEZWNpbWFsTWFyaywgJ00nKVxuXG4gICAgICAgICAgICAvLyBzdHJpcCB0aGUgbm9uIG51bWVyaWMgbGV0dGVycyBleGNlcHQgTVxuICAgICAgICAgICAgLnJlcGxhY2UoL1teXFxkTV0vZywgJycpXG5cbiAgICAgICAgICAgIC8vIHJlcGxhY2UgbWFya1xuICAgICAgICAgICAgLnJlcGxhY2UoJ00nLCBvd25lci5udW1lcmFsRGVjaW1hbE1hcmspXG5cbiAgICAgICAgICAgIC8vIHN0cmlwIGxlYWRpbmcgMFxuICAgICAgICAgICAgLnJlcGxhY2UoL14oLSk/MCsoPz1cXGQpLywgJyQxJyk7XG5cbiAgICAgICAgcGFydEludGVnZXIgPSB2YWx1ZTtcblxuICAgICAgICBpZiAodmFsdWUuaW5kZXhPZihvd25lci5udW1lcmFsRGVjaW1hbE1hcmspID49IDApIHtcbiAgICAgICAgICAgIHBhcnRzID0gdmFsdWUuc3BsaXQob3duZXIubnVtZXJhbERlY2ltYWxNYXJrKTtcbiAgICAgICAgICAgIHBhcnRJbnRlZ2VyID0gcGFydHNbMF07XG4gICAgICAgICAgICBwYXJ0RGVjaW1hbCA9IG93bmVyLm51bWVyYWxEZWNpbWFsTWFyayArIHBhcnRzWzFdLnNsaWNlKDAsIG93bmVyLm51bWVyYWxEZWNpbWFsU2NhbGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoIChvd25lci5udW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSkge1xuICAgICAgICBjYXNlIE51bWVyYWxGb3JtYXR0ZXIuZ3JvdXBTdHlsZS5sYWtoOlxuICAgICAgICAgICAgcGFydEludGVnZXIgPSBwYXJ0SW50ZWdlci5yZXBsYWNlKC8oXFxkKSg/PShcXGRcXGQpK1xcZCQpL2csICckMScgKyBvd25lci5kZWxpbWl0ZXIpO1xuXG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIE51bWVyYWxGb3JtYXR0ZXIuZ3JvdXBTdHlsZS53YW46XG4gICAgICAgICAgICBwYXJ0SW50ZWdlciA9IHBhcnRJbnRlZ2VyLnJlcGxhY2UoLyhcXGQpKD89KFxcZHs0fSkrJCkvZywgJyQxJyArIG93bmVyLmRlbGltaXRlcik7XG5cbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBwYXJ0SW50ZWdlciA9IHBhcnRJbnRlZ2VyLnJlcGxhY2UoLyhcXGQpKD89KFxcZHszfSkrJCkvZywgJyQxJyArIG93bmVyLmRlbGltaXRlcik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFydEludGVnZXIudG9TdHJpbmcoKSArIHBhcnREZWNpbWFsLnRvU3RyaW5nKCk7XG4gICAgfVxufTtcblxuaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBOdW1lcmFsRm9ybWF0dGVyO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgUGhvbmVGb3JtYXR0ZXIgPSBmdW5jdGlvbiAoZm9ybWF0dGVyLCBkZWxpbWl0ZXIpIHtcbiAgICB2YXIgb3duZXIgPSB0aGlzO1xuXG4gICAgb3duZXIuZGVsaW1pdGVyID0gZGVsaW1pdGVyIHx8ICcgJztcbiAgICBvd25lci5kZWxpbWl0ZXJSRSA9IG5ldyBSZWdFeHAob3duZXIuZGVsaW1pdGVyLCAnZycpO1xuICAgIG93bmVyLmZvcm1hdHRlciA9IGZvcm1hdHRlcjtcbn07XG5cblBob25lRm9ybWF0dGVyLnByb3RvdHlwZSA9IHtcbiAgICBzZXRGb3JtYXR0ZXI6IGZ1bmN0aW9uIChmb3JtYXR0ZXIpIHtcbiAgICAgICAgdGhpcy5mb3JtYXR0ZXIgPSBmb3JtYXR0ZXI7XG4gICAgfSxcblxuICAgIGZvcm1hdDogZnVuY3Rpb24gKHBob25lTnVtYmVyKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXM7XG5cbiAgICAgICAgb3duZXIuZm9ybWF0dGVyLmNsZWFyKCk7XG5cbiAgICAgICAgLy8gb25seSBrZWVwIG51bWJlciBhbmQgK1xuICAgICAgICBwaG9uZU51bWJlciA9IHBob25lTnVtYmVyLnJlcGxhY2UoL1teXFxkK10vZywgJycpO1xuXG4gICAgICAgIC8vIHN0cmlwIGRlbGltaXRlclxuICAgICAgICBwaG9uZU51bWJlciA9IHBob25lTnVtYmVyLnJlcGxhY2Uob3duZXIuZGVsaW1pdGVyUkUsICcnKTtcblxuICAgICAgICB2YXIgcmVzdWx0ID0gJycsIGN1cnJlbnQsIHZhbGlkYXRlZCA9IGZhbHNlO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBpTWF4ID0gcGhvbmVOdW1iZXIubGVuZ3RoOyBpIDwgaU1heDsgaSsrKSB7XG4gICAgICAgICAgICBjdXJyZW50ID0gb3duZXIuZm9ybWF0dGVyLmlucHV0RGlnaXQocGhvbmVOdW1iZXIuY2hhckF0KGkpKTtcblxuICAgICAgICAgICAgLy8gaGFzICgpLSBvciBzcGFjZSBpbnNpZGVcbiAgICAgICAgICAgIGlmICgvW1xccygpLV0vZy50ZXN0KGN1cnJlbnQpKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gY3VycmVudDtcblxuICAgICAgICAgICAgICAgIHZhbGlkYXRlZCA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICghdmFsaWRhdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGVsc2U6IG92ZXIgbGVuZ3RoIGlucHV0XG4gICAgICAgICAgICAgICAgLy8gaXQgdHVybnMgdG8gaW52YWxpZCBudW1iZXIgYWdhaW5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHN0cmlwICgpXG4gICAgICAgIC8vIGUuZy4gVVM6IDcxNjEyMzQ1NjcgcmV0dXJucyAoNzE2KSAxMjMtNDU2N1xuICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZSgvWygpXS9nLCAnJyk7XG4gICAgICAgIC8vIHJlcGxhY2UgbGlicmFyeSBkZWxpbWl0ZXIgd2l0aCB1c2VyIGN1c3RvbWl6ZWQgZGVsaW1pdGVyXG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKC9bXFxzLV0vZywgb3duZXIuZGVsaW1pdGVyKTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn07XG5cbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gUGhvbmVGb3JtYXR0ZXI7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBVdGlsID0ge1xuICAgIG5vb3A6IGZ1bmN0aW9uICgpIHtcbiAgICB9LFxuXG4gICAgc3RyaXA6IGZ1bmN0aW9uICh2YWx1ZSwgcmUpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UocmUsICcnKTtcbiAgICB9LFxuXG4gICAgaGVhZFN0cjogZnVuY3Rpb24gKHN0ciwgbGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBzdHIuc2xpY2UoMCwgbGVuZ3RoKTtcbiAgICB9LFxuXG4gICAgZ2V0TWF4TGVuZ3RoOiBmdW5jdGlvbiAoYmxvY2tzKSB7XG4gICAgICAgIHJldHVybiBibG9ja3MucmVkdWNlKGZ1bmN0aW9uIChwcmV2aW91cywgY3VycmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIHByZXZpb3VzICsgY3VycmVudDtcbiAgICAgICAgfSwgMCk7XG4gICAgfSxcblxuICAgIC8vIHN0cmlwIHZhbHVlIGJ5IHByZWZpeCBsZW5ndGhcbiAgICAvLyBmb3IgcHJlZml4OiBQUkVcbiAgICAvLyAoUFJFMTIzLCAzKSAtPiAxMjNcbiAgICAvLyAoUFIxMjMsIDMpIC0+IDIzIHRoaXMgaGFwcGVucyB3aGVuIHVzZXIgaGl0cyBiYWNrc3BhY2UgaW4gZnJvbnQgb2YgXCJQUkVcIlxuICAgIGdldFByZWZpeFN0cmlwcGVkVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSwgcHJlZml4TGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZS5zbGljZShwcmVmaXhMZW5ndGgpO1xuICAgIH0sXG5cbiAgICBnZXRGb3JtYXR0ZWRWYWx1ZTogZnVuY3Rpb24gKHZhbHVlLCBibG9ja3MsIGJsb2Nrc0xlbmd0aCwgZGVsaW1pdGVyKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSAnJztcblxuICAgICAgICBibG9ja3MuZm9yRWFjaChmdW5jdGlvbiAobGVuZ3RoLCBpbmRleCkge1xuICAgICAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgc3ViID0gdmFsdWUuc2xpY2UoMCwgbGVuZ3RoKSxcbiAgICAgICAgICAgICAgICAgICAgcmVzdCA9IHZhbHVlLnNsaWNlKGxlbmd0aCk7XG5cbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gc3ViO1xuXG4gICAgICAgICAgICAgICAgaWYgKHN1Yi5sZW5ndGggPT09IGxlbmd0aCAmJiBpbmRleCA8IGJsb2Nrc0xlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9IGRlbGltaXRlcjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyB1cGRhdGUgcmVtYWluaW5nIHN0cmluZ1xuICAgICAgICAgICAgICAgIHZhbHVlID0gcmVzdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59O1xuXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IFV0aWw7XG59XG4iXX0=
