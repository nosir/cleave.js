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
        target.delimiterRE = new RegExp('\\' + target.delimiter, 'g');

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
    owner.delimiterRE = new RegExp('\\' + owner.delimiter, 'g');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZWFjdC5qcyIsInNyYy9DbGVhdmUucmVhY3QuanMiLCJzcmMvY29tbW9uL0RlZmF1bHRQcm9wZXJ0aWVzLmpzIiwic3JjL3Nob3J0Y3V0cy9DcmVkaXRDYXJkRGV0ZWN0b3IuanMiLCJzcmMvc2hvcnRjdXRzL0RhdGVGb3JtYXR0ZXIuanMiLCJzcmMvc2hvcnRjdXRzL051bWVyYWxGb3JtYXR0ZXIuanMiLCJzcmMvc2hvcnRjdXRzL1Bob25lRm9ybWF0dGVyLmpzIiwic3JjL3V0aWxzL1V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQTs7Ozs7Ozs7OztBQ0FBOzs7Ozs7QUFFQSxJQUFJLFFBQVEsUUFBUSxPQUFSLENBQVo7O0FBRUEsSUFBSSxtQkFBbUIsUUFBUSw4QkFBUixDQUF2QjtBQUNBLElBQUksZ0JBQWdCLFFBQVEsMkJBQVIsQ0FBcEI7QUFDQSxJQUFJLGlCQUFpQixRQUFRLDRCQUFSLENBQXJCO0FBQ0EsSUFBSSxxQkFBcUIsUUFBUSxnQ0FBUixDQUF6QjtBQUNBLElBQUksT0FBTyxRQUFRLGNBQVIsQ0FBWDtBQUNBLElBQUksb0JBQW9CLFFBQVEsNEJBQVIsQ0FBeEI7O0FBRUEsSUFBSSxTQUFTLE1BQU0sV0FBTixDQUFrQjtBQUFBOztBQUMzQix1QkFBbUIsNkJBQVk7QUFDM0IsYUFBSyxJQUFMO0FBQ0gsS0FIMEI7O0FBSzNCLCtCQUEyQixtQ0FBVSxTQUFWLEVBQXFCO0FBQzVDLFlBQUksUUFBUSxJQUFaO0FBQUEsWUFDSSxrQkFBa0IsVUFBVSxPQUFWLENBQWtCLGVBRHhDOzs7QUFJQSxZQUFJLG1CQUFtQixvQkFBb0IsTUFBTSxVQUFOLENBQWlCLGVBQTVELEVBQTZFO0FBQ3pFLGtCQUFNLFVBQU4sQ0FBaUIsZUFBakIsR0FBbUMsZUFBbkM7QUFDQSxrQkFBTSxrQkFBTjtBQUNBLGtC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QUdILEtBaEJNOzs7Ozs7QUFzQlAsNEJBQXdCLGdDQUFVLEtBQVYsRUFBaUIsWUFBakIsRUFBK0I7QUFDbkQsZUFBTyxNQUFNLEtBQU4sQ0FBWSxZQUFaLENBQVA7QUFDSCxLQXhCTTs7QUEwQlAsdUJBQW1CLDJCQUFVLEtBQVYsRUFBaUIsTUFBakIsRUFBeUIsWUFBekIsRUFBdUMsU0FBdkMsRUFBa0Q7QUFDakUsWUFBSSxTQUFTLEVBQWI7O0FBRUEsZUFBTyxPQUFQLENBQWUsVUFBVSxNQUFWLEVBQWtCLEtBQWxCLEVBQXlCO0FBQ3BDLGdCQUFJLE1BQU0sTUFBTixHQUFlLENBQW5CLEVBQXNCO0FBQ2xCLG9CQUFJLE1BQU0sTUFBTSxLQUFOLENBQVksQ0FBWixFQUFlLE1BQWYsQ0FBVjtBQUFBLG9CQUNJLE9BQU8sTUFBTSxLQUFOLENBQVksTUFBWixDQURYOztBQUdBLDBCQUFVLEdBQVY7O0FBRUEsb0JBQUksSUFBSSxNQUFKLEtBQWUsTUFBZixJQUF5QixRQUFRLGVBQWUsQ0FBcEQsRUFBdUQ7QUFDbkQsOEJBQVUsU0FBVjtBQUNIOzs7QUFHRCx3QkFBUSxJQUFSO0FBQ0g7QUFDSixTQWREOztBQWdCQSxlQUFPLE1BQVA7QUFDSDtBQTlDTSxDQUFYOztBQWlEQSxJQUFJLFFBQU8sTUFBUCx5Q0FBTyxNQUFQLE9BQWtCLFFBQWxCLElBQThCLFFBQU8sT0FBTyxPQUFkLE1BQTBCLFFBQTVELEVBQXNFO0FBQ2xFLFdBQU8sT0FBUCxHQUFpQixVQUFVLElBQTNCO0FBQ0giLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IENsZWF2ZSBmcm9tICcuL3NyYy9DbGVhdmUucmVhY3QnO1xuXG5leHBvcnQgZGVmYXVsdCBDbGVhdmU7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBOdW1lcmFsRm9ybWF0dGVyID0gcmVxdWlyZSgnLi9zaG9ydGN1dHMvTnVtZXJhbEZvcm1hdHRlcicpO1xudmFyIERhdGVGb3JtYXR0ZXIgPSByZXF1aXJlKCcuL3Nob3J0Y3V0cy9EYXRlRm9ybWF0dGVyJyk7XG52YXIgUGhvbmVGb3JtYXR0ZXIgPSByZXF1aXJlKCcuL3Nob3J0Y3V0cy9QaG9uZUZvcm1hdHRlcicpO1xudmFyIENyZWRpdENhcmREZXRlY3RvciA9IHJlcXVpcmUoJy4vc2hvcnRjdXRzL0NyZWRpdENhcmREZXRlY3RvcicpO1xudmFyIFV0aWwgPSByZXF1aXJlKCcuL3V0aWxzL1V0aWwnKTtcbnZhciBEZWZhdWx0UHJvcGVydGllcyA9IHJlcXVpcmUoJy4vY29tbW9uL0RlZmF1bHRQcm9wZXJ0aWVzJyk7XG5cbnZhciBDbGVhdmUgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXh0UHJvcHMpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIHBob25lUmVnaW9uQ29kZSA9IG5leHRQcm9wcy5vcHRpb25zLnBob25lUmVnaW9uQ29kZTtcblxuICAgICAgICAvLyB1cGRhdGUgcGhvbmUgcmVnaW9uIGNvZGVcbiAgICAgICAgaWYgKHBob25lUmVnaW9uQ29kZSAmJiBwaG9uZVJlZ2lvbkNvZGUgIT09IG93bmVyLnByb3BlcnRpZXMucGhvbmVSZWdpb25Db2RlKSB7XG4gICAgICAgICAgICBvd25lci5wcm9wZXJ0aWVzLnBob25lUmVnaW9uQ29kZSA9IHBob25lUmVnaW9uQ29kZTtcbiAgICAgICAgICAgIG93bmVyLmluaXRQaG9uZUZvcm1hdHRlcigpO1xuICAgICAgICAgICAgb3duZXIub25JbnB1dChvd25lci5wcm9wZXJ0aWVzLnJlc3VsdCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICB7IHZhbHVlLCBvcHRpb25zLCBvbktleURvd24sIG9uQ2hhbmdlLCAuLi5vdGhlciB9ID0gb3duZXIucHJvcHM7XG5cbiAgICAgICAgb3duZXIucmVnaXN0ZXJlZEV2ZW50cyA9IHtcbiAgICAgICAgICAgIG9uQ2hhbmdlOiAgb25DaGFuZ2UgfHwgVXRpbC5ub29wLFxuICAgICAgICAgICAgb25LZXlEb3duOiBvbktleURvd24gfHwgVXRpbC5ub29wXG4gICAgICAgIH07XG5cbiAgICAgICAgb3B0aW9ucy5pbml0VmFsdWUgPSB2YWx1ZTtcblxuICAgICAgICBvd25lci5wcm9wZXJ0aWVzID0gRGVmYXVsdFByb3BlcnRpZXMuYXNzaWduKHt9LCBvcHRpb25zKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgb3RoZXI6IG90aGVyLFxuICAgICAgICAgICAgdmFsdWU6IG93bmVyLnByb3BlcnRpZXMucmVzdWx0XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XG5cbiAgICAgICAgLy8gc28gbm8gbmVlZCBmb3IgdGhpcyBsaWIgYXQgYWxsXG4gICAgICAgIGlmICghcHBzLm51bWVyYWwgJiYgIXBwcy5waG9uZSAmJiAhcHBzLmNyZWRpdENhcmQgJiYgIXBwcy5kYXRlICYmIChwcHMuYmxvY2tzTGVuZ3RoID09PSAwICYmICFwcHMucHJlZml4KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcHBzLm1heExlbmd0aCA9IFV0aWwuZ2V0TWF4TGVuZ3RoKHBwcy5ibG9ja3MpO1xuXG4gICAgICAgIG93bmVyLmluaXRQaG9uZUZvcm1hdHRlcigpO1xuICAgICAgICBvd25lci5pbml0RGF0ZUZvcm1hdHRlcigpO1xuICAgICAgICBvd25lci5pbml0TnVtZXJhbEZvcm1hdHRlcigpO1xuXG4gICAgICAgIG93bmVyLm9uSW5wdXQocHBzLmluaXRWYWx1ZSk7XG4gICAgfSxcblxuICAgIGluaXROdW1lcmFsRm9ybWF0dGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIGlmICghcHBzLm51bWVyYWwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHBwcy5udW1lcmFsRm9ybWF0dGVyID0gbmV3IE51bWVyYWxGb3JtYXR0ZXIoXG4gICAgICAgICAgICBwcHMubnVtZXJhbERlY2ltYWxNYXJrLFxuICAgICAgICAgICAgcHBzLm51bWVyYWxEZWNpbWFsU2NhbGUsXG4gICAgICAgICAgICBwcHMubnVtZXJhbFRob3VzYW5kc0dyb3VwU3R5bGUsXG4gICAgICAgICAgICBwcHMuZGVsaW1pdGVyXG4gICAgICAgICk7XG4gICAgfSxcblxuICAgIGluaXREYXRlRm9ybWF0dGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIGlmICghcHBzLmRhdGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHBwcy5kYXRlRm9ybWF0dGVyID0gbmV3IERhdGVGb3JtYXR0ZXIocHBzLmRhdGVQYXR0ZXJuKTtcbiAgICAgICAgcHBzLmJsb2NrcyA9IHBwcy5kYXRlRm9ybWF0dGVyLmdldEJsb2NrcygpO1xuICAgICAgICBwcHMuYmxvY2tzTGVuZ3RoID0gcHBzLmJsb2Nrcy5sZW5ndGg7XG4gICAgICAgIHBwcy5tYXhMZW5ndGggPSBVdGlsLmdldE1heExlbmd0aChwcHMuYmxvY2tzKTtcbiAgICB9LFxuXG4gICAgaW5pdFBob25lRm9ybWF0dGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIGlmICghcHBzLnBob25lKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDbGVhdmUuQXNZb3VUeXBlRm9ybWF0dGVyIHNob3VsZCBiZSBwcm92aWRlZCBieVxuICAgICAgICAvLyBleHRlcm5hbCBnb29nbGUgY2xvc3VyZSBsaWJcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHBwcy5waG9uZUZvcm1hdHRlciA9IG5ldyBQaG9uZUZvcm1hdHRlcihcbiAgICAgICAgICAgICAgICBuZXcgd2luZG93LkNsZWF2ZS5Bc1lvdVR5cGVGb3JtYXR0ZXIocHBzLnBob25lUmVnaW9uQ29kZSksXG4gICAgICAgICAgICAgICAgcHBzLmRlbGltaXRlclxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUGxlYXNlIGluY2x1ZGUgcGhvbmUtdHlwZS1mb3JtYXR0ZXIue2NvdW50cnl9LmpzIGxpYicpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIG9uS2V5RG93bjogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICBwcHMgPSBvd25lci5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgY2hhckNvZGUgPSBldmVudC53aGljaCB8fCBldmVudC5rZXlDb2RlO1xuXG4gICAgICAgIC8vIGhpdCBiYWNrc3BhY2Ugd2hlbiBsYXN0IGNoYXJhY3RlciBpcyBkZWxpbWl0ZXJcbiAgICAgICAgaWYgKGNoYXJDb2RlID09PSA4ICYmIHBwcy5yZXN1bHQuc2xpY2UoLTEpID09PSBwcHMuZGVsaW1pdGVyKSB7XG4gICAgICAgICAgICBwcHMuYmFja3NwYWNlID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBwcy5iYWNrc3BhY2UgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIG93bmVyLnJlZ2lzdGVyZWRFdmVudHMub25LZXlEb3duKGV2ZW50KTtcbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIG93bmVyLm9uSW5wdXQoZXZlbnQudGFyZ2V0LnZhbHVlKTtcblxuICAgICAgICBldmVudC50YXJnZXQucmF3VmFsdWUgPSBVdGlsLnN0cmlwKHBwcy5yZXN1bHQsIHBwcy5kZWxpbWl0ZXJSRSk7XG5cbiAgICAgICAgb3duZXIucmVnaXN0ZXJlZEV2ZW50cy5vbkNoYW5nZShldmVudCk7XG4gICAgfSxcblxuICAgIG9uSW5wdXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwcHMgPSBvd25lci5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgcHJldiA9IHBwcy5yZXN1bHQ7XG5cbiAgICAgICAgLy8gY2FzZSAxOiBkZWxldGUgb25lIG1vcmUgY2hhcmFjdGVyIFwiNFwiXG4gICAgICAgIC8vIDEyMzQqfCAtPiBoaXQgYmFja3NwYWNlIC0+IDEyM3xcbiAgICAgICAgLy8gY2FzZSAyOiBsYXN0IGNoYXJhY3RlciBpcyBub3QgZGVsaW1pdGVyIHdoaWNoIGlzOlxuICAgICAgICAvLyAxMnwzNCogLT4gaGl0IGJhY2tzcGFjZSAtPiAxfDM0KlxuXG4gICAgICAgIGlmIChwcHMuYmFja3NwYWNlICYmIHZhbHVlLnNsaWNlKC0xKSAhPT0gcHBzLmRlbGltaXRlcikge1xuICAgICAgICAgICAgdmFsdWUgPSBVdGlsLmhlYWRTdHIodmFsdWUsIHZhbHVlLmxlbmd0aCAtIDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcGhvbmUgZm9ybWF0dGVyXG4gICAgICAgIGlmIChwcHMucGhvbmUpIHtcbiAgICAgICAgICAgIHBwcy5yZXN1bHQgPSBwcHMucGhvbmVGb3JtYXR0ZXIuZm9ybWF0KHZhbHVlKTtcbiAgICAgICAgICAgIG93bmVyLnVwZGF0ZVZhbHVlU3RhdGUoKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbnVtZXJhbCBmb3JtYXR0ZXJcbiAgICAgICAgaWYgKHBwcy5udW1lcmFsKSB7XG4gICAgICAgICAgICBwcHMucmVzdWx0ID0gcHBzLnByZWZpeCArIHBwcy5udW1lcmFsRm9ybWF0dGVyLmZvcm1hdCh2YWx1ZSk7XG4gICAgICAgICAgICBvd25lci51cGRhdGVWYWx1ZVN0YXRlKCk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGRhdGVcbiAgICAgICAgaWYgKHBwcy5kYXRlKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHBwcy5kYXRlRm9ybWF0dGVyLmdldFZhbGlkYXRlZERhdGUodmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3RyaXAgZGVsaW1pdGVyc1xuICAgICAgICB2YWx1ZSA9IFV0aWwuc3RyaXAodmFsdWUsIHBwcy5kZWxpbWl0ZXJSRSk7XG5cbiAgICAgICAgLy8gc3RyaXAgcHJlZml4XG4gICAgICAgIHZhbHVlID0gVXRpbC5nZXRQcmVmaXhTdHJpcHBlZFZhbHVlKHZhbHVlLCBwcHMucHJlZml4TGVuZ3RoKTtcblxuICAgICAgICAvLyBzdHJpcCBub24tbnVtZXJpYyBjaGFyYWN0ZXJzXG4gICAgICAgIHZhbHVlID0gcHBzLm51bWVyaWNPbmx5ID8gVXRpbC5zdHJpcCh2YWx1ZSwgL1teXFxkXS9nKSA6IHZhbHVlO1xuXG4gICAgICAgIC8vIGNvbnZlcnQgY2FzZVxuICAgICAgICB2YWx1ZSA9IHBwcy51cHBlcmNhc2UgPyB2YWx1ZS50b1VwcGVyQ2FzZSgpIDogdmFsdWU7XG4gICAgICAgIHZhbHVlID0gcHBzLmxvd2VyY2FzZSA/IHZhbHVlLnRvTG93ZXJDYXNlKCkgOiB2YWx1ZTtcblxuICAgICAgICAvLyBwcmVmaXhcbiAgICAgICAgaWYgKHBwcy5wcmVmaXgpIHtcbiAgICAgICAgICAgIHZhbHVlID0gcHBzLnByZWZpeCArIHZhbHVlO1xuXG4gICAgICAgICAgICAvLyBubyBibG9ja3Mgc3BlY2lmaWVkLCBubyBuZWVkIHRvIGRvIGZvcm1hdHRpbmdcbiAgICAgICAgICAgIGlmIChwcHMuYmxvY2tzTGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcHBzLnJlc3VsdCA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIG93bmVyLnVwZGF0ZVZhbHVlU3RhdGUoKTtcblxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHVwZGF0ZSBjcmVkaXQgY2FyZCBwcm9wc1xuICAgICAgICBpZiAocHBzLmNyZWRpdENhcmQpIHtcbiAgICAgICAgICAgIG93bmVyLnVwZGF0ZUNyZWRpdENhcmRQcm9wc0J5VmFsdWUodmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3RyaXAgb3ZlciBsZW5ndGggY2hhcmFjdGVyc1xuICAgICAgICB2YWx1ZSA9IFV0aWwuaGVhZFN0cih2YWx1ZSwgcHBzLm1heExlbmd0aCk7XG5cbiAgICAgICAgLy8gYXBwbHkgYmxvY2tzXG4gICAgICAgIHBwcy5yZXN1bHQgPSBVdGlsLmdldEZvcm1hdHRlZFZhbHVlKHZhbHVlLCBwcHMuYmxvY2tzLCBwcHMuYmxvY2tzTGVuZ3RoLCBwcHMuZGVsaW1pdGVyKTtcblxuICAgICAgICAvLyBub3RoaW5nIGNoYW5nZWRcbiAgICAgICAgLy8gcHJldmVudCB1cGRhdGUgdmFsdWUgdG8gYXZvaWQgY2FyZXQgcG9zaXRpb24gY2hhbmdlXG4gICAgICAgIGlmIChwcmV2ID09PSBwcHMucmVzdWx0ICYmIHByZXYgIT09IHBwcy5wcmVmaXgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIG93bmVyLnVwZGF0ZVZhbHVlU3RhdGUoKTtcbiAgICB9LFxuXG4gICAgdXBkYXRlQ3JlZGl0Q2FyZFByb3BzQnlWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHBwcyA9IG93bmVyLnByb3BlcnRpZXMsXG4gICAgICAgICAgICBjcmVkaXRDYXJkSW5mbztcblxuICAgICAgICAvLyBBdCBsZWFzdCBvbmUgb2YgdGhlIGZpcnN0IDQgY2hhcmFjdGVycyBoYXMgY2hhbmdlZFxuICAgICAgICBpZiAoVXRpbC5oZWFkU3RyKHBwcy5yZXN1bHQsIDQpID09PSBVdGlsLmhlYWRTdHIodmFsdWUsIDQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjcmVkaXRDYXJkSW5mbyA9IENyZWRpdENhcmREZXRlY3Rvci5nZXRJbmZvKHZhbHVlLCBwcHMuY3JlZGl0Q2FyZFN0cmljdE1vZGUpO1xuXG4gICAgICAgIHBwcy5ibG9ja3MgPSBjcmVkaXRDYXJkSW5mby5ibG9ja3M7XG4gICAgICAgIHBwcy5ibG9ja3NMZW5ndGggPSBwcHMuYmxvY2tzLmxlbmd0aDtcbiAgICAgICAgcHBzLm1heExlbmd0aCA9IFV0aWwuZ2V0TWF4TGVuZ3RoKHBwcy5ibG9ja3MpO1xuXG4gICAgICAgIC8vIGNyZWRpdCBjYXJkIHR5cGUgY2hhbmdlZFxuICAgICAgICBpZiAocHBzLmNyZWRpdENhcmRUeXBlICE9PSBjcmVkaXRDYXJkSW5mby50eXBlKSB7XG4gICAgICAgICAgICBwcHMuY3JlZGl0Q2FyZFR5cGUgPSBjcmVkaXRDYXJkSW5mby50eXBlO1xuXG4gICAgICAgICAgICBwcHMub25DcmVkaXRDYXJkVHlwZUNoYW5nZWQuY2FsbChvd25lciwgcHBzLmNyZWRpdENhcmRUeXBlKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICB1cGRhdGVWYWx1ZVN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3ZhbHVlOiB0aGlzLnByb3BlcnRpZXMucmVzdWx0fSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiB7Li4ub3duZXIuc3RhdGUub3RoZXJ9XG4gICAgICAgICAgICAgICAgICAgdmFsdWU9e293bmVyLnN0YXRlLnZhbHVlfVxuICAgICAgICAgICAgICAgICAgIG9uS2V5RG93bj17b3duZXIub25LZXlEb3dufVxuICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtvd25lci5vbkNoYW5nZX0vPlxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy5DbGVhdmUgPSBDbGVhdmU7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogUHJvcHMgQXNzaWdubWVudFxuICpcbiAqIFNlcGFyYXRlIHRoaXMsIHNvIHJlYWN0IG1vZHVsZSBjYW4gc2hhcmUgdGhlIHVzYWdlXG4gKi9cbnZhciBEZWZhdWx0UHJvcGVydGllcyA9IHtcbiAgICAvLyBNYXliZSBjaGFuZ2UgdG8gb2JqZWN0LWFzc2lnblxuICAgIC8vIGZvciBub3cganVzdCBrZWVwIGl0IGFzIHNpbXBsZVxuICAgIGFzc2lnbjogZnVuY3Rpb24gKHRhcmdldCwgb3B0cykge1xuICAgICAgICB0YXJnZXQgPSB0YXJnZXQgfHwge307XG4gICAgICAgIG9wdHMgPSBvcHRzIHx8IHt9O1xuXG4gICAgICAgIC8vIGNyZWRpdCBjYXJkXG4gICAgICAgIHRhcmdldC5jcmVkaXRDYXJkID0gISFvcHRzLmNyZWRpdENhcmQ7XG4gICAgICAgIHRhcmdldC5jcmVkaXRDYXJkU3RyaWN0TW9kZSA9ICEhb3B0cy5jcmVkaXRDYXJkU3RyaWN0TW9kZTtcbiAgICAgICAgdGFyZ2V0LmNyZWRpdENhcmRUeXBlID0gJyc7XG4gICAgICAgIHRhcmdldC5vbkNyZWRpdENhcmRUeXBlQ2hhbmdlZCA9IG9wdHMub25DcmVkaXRDYXJkVHlwZUNoYW5nZWQgfHwgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIC8vIHBob25lXG4gICAgICAgIHRhcmdldC5waG9uZSA9ICEhb3B0cy5waG9uZTtcbiAgICAgICAgdGFyZ2V0LnBob25lUmVnaW9uQ29kZSA9IG9wdHMucGhvbmVSZWdpb25Db2RlIHx8ICdBVSc7XG4gICAgICAgIHRhcmdldC5waG9uZUZvcm1hdHRlciA9IHt9O1xuXG4gICAgICAgIC8vIGRhdGVcbiAgICAgICAgdGFyZ2V0LmRhdGUgPSAhIW9wdHMuZGF0ZTtcbiAgICAgICAgdGFyZ2V0LmRhdGVQYXR0ZXJuID0gb3B0cy5kYXRlUGF0dGVybiB8fCBbJ2QnLCAnbScsICdZJ107XG4gICAgICAgIHRhcmdldC5kYXRlRm9ybWF0dGVyID0ge307XG5cbiAgICAgICAgLy8gbnVtZXJhbFxuICAgICAgICB0YXJnZXQubnVtZXJhbCA9ICEhb3B0cy5udW1lcmFsO1xuICAgICAgICB0YXJnZXQubnVtZXJhbERlY2ltYWxTY2FsZSA9IG9wdHMubnVtZXJhbERlY2ltYWxTY2FsZSB8fCAyO1xuICAgICAgICB0YXJnZXQubnVtZXJhbERlY2ltYWxNYXJrID0gb3B0cy5udW1lcmFsRGVjaW1hbE1hcmsgfHwgJy4nO1xuICAgICAgICB0YXJnZXQubnVtZXJhbFRob3VzYW5kc0dyb3VwU3R5bGUgPSBvcHRzLm51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlIHx8ICd0aG91c2FuZCc7XG5cbiAgICAgICAgLy8gb3RoZXJzXG4gICAgICAgIHRhcmdldC5udW1lcmljT25seSA9IHRhcmdldC5jcmVkaXRDYXJkIHx8IHRhcmdldC5kYXRlIHx8ICEhb3B0cy5udW1lcmljT25seTtcblxuICAgICAgICB0YXJnZXQudXBwZXJjYXNlID0gISFvcHRzLnVwcGVyY2FzZTtcbiAgICAgICAgdGFyZ2V0Lmxvd2VyY2FzZSA9ICEhb3B0cy5sb3dlcmNhc2U7XG5cbiAgICAgICAgdGFyZ2V0LnByZWZpeCA9ICh0YXJnZXQuY3JlZGl0Q2FyZCB8fCB0YXJnZXQucGhvbmUgfHwgdGFyZ2V0LmRhdGUpID8gJycgOiAob3B0cy5wcmVmaXggfHwgJycpO1xuICAgICAgICB0YXJnZXQucHJlZml4TGVuZ3RoID0gdGFyZ2V0LnByZWZpeC5sZW5ndGg7XG5cbiAgICAgICAgdGFyZ2V0LmluaXRWYWx1ZSA9IHRhcmdldC5wcmVmaXggKyAob3B0cy5pbml0VmFsdWUgfHwgJycpO1xuXG4gICAgICAgIHRhcmdldC5kZWxpbWl0ZXIgPSBvcHRzLmRlbGltaXRlciB8fCAodGFyZ2V0LmRhdGUgPyAnLycgOiAodGFyZ2V0Lm51bWVyYWwgPyAnLCcgOiAnICcpKTtcbiAgICAgICAgdGFyZ2V0LmRlbGltaXRlclJFID0gbmV3IFJlZ0V4cCgnXFxcXCcgKyB0YXJnZXQuZGVsaW1pdGVyLCAnZycpO1xuXG4gICAgICAgIHRhcmdldC5ibG9ja3MgPSBvcHRzLmJsb2NrcyB8fCBbXTtcbiAgICAgICAgdGFyZ2V0LmJsb2Nrc0xlbmd0aCA9IHRhcmdldC5ibG9ja3MubGVuZ3RoO1xuXG4gICAgICAgIHRhcmdldC5tYXhMZW5ndGggPSAwO1xuXG4gICAgICAgIHRhcmdldC5iYWNrc3BhY2UgPSBmYWxzZTtcbiAgICAgICAgdGFyZ2V0LnJlc3VsdCA9ICcnO1xuXG4gICAgICAgIHJldHVybiB0YXJnZXQ7XG4gICAgfVxufTtcblxuaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBEZWZhdWx0UHJvcGVydGllcztcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIENyZWRpdENhcmREZXRlY3RvciA9IHtcbiAgICBibG9ja3M6IHtcbiAgICAgICAgdWF0cDogICAgICAgICAgWzQsIDUsIDZdLFxuICAgICAgICBhbWV4OiAgICAgICAgICBbNCwgNiwgNV0sXG4gICAgICAgIGRpbmVyczogICAgICAgIFs0LCA2LCA0XSxcbiAgICAgICAgZGlzY292ZXI6ICAgICAgWzQsIDQsIDQsIDRdLFxuICAgICAgICBtYXN0ZXJjYXJkOiAgICBbNCwgNCwgNCwgNF0sXG4gICAgICAgIGRhbmtvcnQ6ICAgICAgIFs0LCA0LCA0LCA0XSxcbiAgICAgICAgaW5zdGFwYXltZW50OiAgWzQsIDQsIDQsIDRdLFxuICAgICAgICBqY2I6ICAgICAgICAgICBbNCwgNCwgNCwgNF0sXG4gICAgICAgIHZpc2E6ICAgICAgICAgIFs0LCA0LCA0LCA0XSxcbiAgICAgICAgZ2VuZXJhbExvb3NlOiAgWzQsIDQsIDQsIDRdLFxuICAgICAgICBnZW5lcmFsU3RyaWN0OiBbNCwgNCwgNCwgN11cbiAgICB9LFxuXG4gICAgcmU6IHtcbiAgICAgICAgLy8gc3RhcnRzIHdpdGggMTsgMTUgZGlnaXRzLCBub3Qgc3RhcnRzIHdpdGggMTgwMCAoamNiIGNhcmQpXG4gICAgICAgIHVhdHA6IC9eKD8hMTgwMCkxXFxkezAsMTR9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCAzNC8zNzsgMTUgZGlnaXRzXG4gICAgICAgIGFtZXg6IC9eM1s0N11cXGR7MCwxM30vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDYwMTEvNjUvNjQ0LTY0OTsgMTYgZGlnaXRzXG4gICAgICAgIGRpc2NvdmVyOiAvXig/OjYwMTF8NjVcXGR7MCwyfXw2NFs0LTldXFxkPylcXGR7MCwxMn0vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDMwMC0zMDUvMzA5IG9yIDM2LzM4LzM5OyAxNCBkaWdpdHNcbiAgICAgICAgZGluZXJzOiAvXjMoPzowKFswLTVdfDkpfFs2ODldXFxkPylcXGR7MCwxMX0vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDUxLTU1LzIyLTI3OyAxNiBkaWdpdHNcbiAgICAgICAgbWFzdGVyY2FyZDogL14oNVsxLTVdfDJbMi03XSlcXGR7MCwxNH0vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDUwMTkvNDE3NS80NTcxOyAxNiBkaWdpdHNcbiAgICAgICAgZGFua29ydDogL14oNTAxOXw0MTc1fDQ1NzEpXFxkezAsMTJ9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCA2MzctNjM5OyAxNiBkaWdpdHNcbiAgICAgICAgaW5zdGFwYXltZW50OiAvXjYzWzctOV1cXGR7MCwxM30vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDIxMzEvMTgwMC8zNTsgMTYgZGlnaXRzXG4gICAgICAgIGpjYjogL14oPzoyMTMxfDE4MDB8MzVcXGR7MCwyfSlcXGR7MCwxMn0vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDQ7IDE2IGRpZ2l0c1xuICAgICAgICB2aXNhOiAvXjRcXGR7MCwxNX0vXG4gICAgfSxcblxuICAgIGdldEluZm86IGZ1bmN0aW9uICh2YWx1ZSwgc3RyaWN0TW9kZSkge1xuICAgICAgICB2YXIgYmxvY2tzID0gQ3JlZGl0Q2FyZERldGVjdG9yLmJsb2NrcyxcbiAgICAgICAgICAgIHJlID0gQ3JlZGl0Q2FyZERldGVjdG9yLnJlO1xuXG4gICAgICAgIC8vIEluIHRoZW9yeSwgdmlzYSBjcmVkaXQgY2FyZCBjYW4gaGF2ZSB1cCB0byAxOSBkaWdpdHMgbnVtYmVyLlxuICAgICAgICAvLyBTZXQgc3RyaWN0TW9kZSB0byB0cnVlIHdpbGwgcmVtb3ZlIHRoZSAxNiBtYXgtbGVuZ3RoIHJlc3RyYWluLFxuICAgICAgICAvLyBob3dldmVyLCBJIG5ldmVyIGZvdW5kIGFueSB3ZWJzaXRlIHZhbGlkYXRlIGNhcmQgbnVtYmVyIGxpa2VcbiAgICAgICAgLy8gdGhpcywgaGVuY2UgcHJvYmFibHkgeW91IGRvbid0IG5lZWQgdG8gZW5hYmxlIHRoaXMgb3B0aW9uLlxuICAgICAgICBzdHJpY3RNb2RlID0gISFzdHJpY3RNb2RlO1xuXG4gICAgICAgIGlmIChyZS5hbWV4LnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICAgJ2FtZXgnLFxuICAgICAgICAgICAgICAgIGJsb2NrczogYmxvY2tzLmFtZXhcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAocmUudWF0cC50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAgICd1YXRwJyxcbiAgICAgICAgICAgICAgICBibG9ja3M6IGJsb2Nrcy51YXRwXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKHJlLmRpbmVycy50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAgICdkaW5lcnMnLFxuICAgICAgICAgICAgICAgIGJsb2NrczogYmxvY2tzLmRpbmVyc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChyZS5kaXNjb3Zlci50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAgICdkaXNjb3ZlcicsXG4gICAgICAgICAgICAgICAgYmxvY2tzOiBibG9ja3MuZGlzY292ZXJcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAocmUubWFzdGVyY2FyZC50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAgICdtYXN0ZXJjYXJkJyxcbiAgICAgICAgICAgICAgICBibG9ja3M6IGJsb2Nrcy5tYXN0ZXJjYXJkXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKHJlLmRhbmtvcnQudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogICAnZGFua29ydCcsXG4gICAgICAgICAgICAgICAgYmxvY2tzOiBibG9ja3MuZGFua29ydFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChyZS5pbnN0YXBheW1lbnQudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogICAnaW5zdGFwYXltZW50JyxcbiAgICAgICAgICAgICAgICBibG9ja3M6IGJsb2Nrcy5pbnN0YXBheW1lbnRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAocmUuamNiLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICAgJ2pjYicsXG4gICAgICAgICAgICAgICAgYmxvY2tzOiBibG9ja3MuamNiXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKHJlLnZpc2EudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogICAndmlzYScsXG4gICAgICAgICAgICAgICAgYmxvY2tzOiBibG9ja3MudmlzYVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChzdHJpY3RNb2RlKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICAgJ3Vua25vd24nLFxuICAgICAgICAgICAgICAgIGJsb2NrczogYmxvY2tzLmdlbmVyYWxTdHJpY3RcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICAgJ3Vua25vd24nLFxuICAgICAgICAgICAgICAgIGJsb2NrczogYmxvY2tzLmdlbmVyYWxMb29zZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gQ3JlZGl0Q2FyZERldGVjdG9yO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgRGF0ZUZvcm1hdHRlciA9IGZ1bmN0aW9uIChkYXRlUGF0dGVybikge1xuICAgIHZhciBvd25lciA9IHRoaXM7XG5cbiAgICBvd25lci5ibG9ja3MgPSBbXTtcbiAgICBvd25lci5kYXRlUGF0dGVybiA9IGRhdGVQYXR0ZXJuO1xuICAgIG93bmVyLmluaXRCbG9ja3MoKTtcbn07XG5cbkRhdGVGb3JtYXR0ZXIucHJvdG90eXBlID0ge1xuICAgIGluaXRCbG9ja3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcztcbiAgICAgICAgb3duZXIuZGF0ZVBhdHRlcm4uZm9yRWFjaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gJ1knKSB7XG4gICAgICAgICAgICAgICAgb3duZXIuYmxvY2tzLnB1c2goNCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG93bmVyLmJsb2Nrcy5wdXNoKDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZ2V0QmxvY2tzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2NrcztcbiAgICB9LFxuXG4gICAgZ2V0VmFsaWRhdGVkRGF0ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHJlc3VsdCA9ICcnO1xuXG4gICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvW15cXGRdL2csICcnKTtcblxuICAgICAgICBvd25lci5ibG9ja3MuZm9yRWFjaChmdW5jdGlvbiAobGVuZ3RoLCBpbmRleCkge1xuICAgICAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgc3ViID0gdmFsdWUuc2xpY2UoMCwgbGVuZ3RoKSxcbiAgICAgICAgICAgICAgICAgICAgcmVzdCA9IHZhbHVlLnNsaWNlKGxlbmd0aCk7XG5cbiAgICAgICAgICAgICAgICBzd2l0Y2ggKG93bmVyLmRhdGVQYXR0ZXJuW2luZGV4XSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2QnOlxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyc2VJbnQoc3ViLCAxMCkgPiAzMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ViID0gJzMxJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdtJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnNlSW50KHN1YiwgMTApID4gMTIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YiA9ICcxMic7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IHN1YjtcblxuICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSByZW1haW5pbmcgc3RyaW5nXG4gICAgICAgICAgICAgICAgdmFsdWUgPSByZXN0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn07XG5cbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gRGF0ZUZvcm1hdHRlcjtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIE51bWVyYWxGb3JtYXR0ZXIgPSBmdW5jdGlvbiAobnVtZXJhbERlY2ltYWxNYXJrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtZXJhbERlY2ltYWxTY2FsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsaW1pdGVyKSB7XG4gICAgdmFyIG93bmVyID0gdGhpcztcblxuICAgIG93bmVyLm51bWVyYWxEZWNpbWFsTWFyayA9IG51bWVyYWxEZWNpbWFsTWFyayB8fCAnLic7XG4gICAgb3duZXIubnVtZXJhbERlY2ltYWxTY2FsZSA9IG51bWVyYWxEZWNpbWFsU2NhbGUgfHwgMjtcbiAgICBvd25lci5udW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSA9IG51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlIHx8IE51bWVyYWxGb3JtYXR0ZXIuZ3JvdXBTdHlsZS50aG91c2FuZDtcbiAgICBvd25lci5kZWxpbWl0ZXIgPSBkZWxpbWl0ZXIgfHwgJywnO1xufTtcblxuTnVtZXJhbEZvcm1hdHRlci5ncm91cFN0eWxlID0ge1xuICAgIHRob3VzYW5kOiAndGhvdXNhbmQnLFxuICAgIGxha2g6ICAgICAnbGFraCcsXG4gICAgd2FuOiAgICAgICd3YW4nXG59O1xuXG5OdW1lcmFsRm9ybWF0dGVyLnByb3RvdHlwZSA9IHtcbiAgICBmb3JtYXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwYXJ0cywgcGFydEludGVnZXIsIHBhcnREZWNpbWFsID0gJyc7XG5cbiAgICAgICAgLy8gc3RyaXAgYWxwaGFiZXQgbGV0dGVyc1xuICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL1tBLVphLXpdL2csICcnKVxuXG4gICAgICAgICAgICAvLyByZXBsYWNlIHRoZSBmaXJzdCBkZWNpbWFsIG1hcmsgd2l0aCByZXNlcnZlZCBwbGFjZWhvbGRlclxuICAgICAgICAgICAgLnJlcGxhY2Uob3duZXIubnVtZXJhbERlY2ltYWxNYXJrLCAnTScpXG5cbiAgICAgICAgICAgIC8vIHN0cmlwIHRoZSBub24gbnVtZXJpYyBsZXR0ZXJzIGV4Y2VwdCBNXG4gICAgICAgICAgICAucmVwbGFjZSgvW15cXGRNXS9nLCAnJylcblxuICAgICAgICAgICAgLy8gcmVwbGFjZSBtYXJrXG4gICAgICAgICAgICAucmVwbGFjZSgnTScsIG93bmVyLm51bWVyYWxEZWNpbWFsTWFyaylcblxuICAgICAgICAgICAgLy8gc3RyaXAgbGVhZGluZyAwXG4gICAgICAgICAgICAucmVwbGFjZSgvXigtKT8wKyg/PVxcZCkvLCAnJDEnKTtcblxuICAgICAgICBwYXJ0SW50ZWdlciA9IHZhbHVlO1xuXG4gICAgICAgIGlmICh2YWx1ZS5pbmRleE9mKG93bmVyLm51bWVyYWxEZWNpbWFsTWFyaykgPj0gMCkge1xuICAgICAgICAgICAgcGFydHMgPSB2YWx1ZS5zcGxpdChvd25lci5udW1lcmFsRGVjaW1hbE1hcmspO1xuICAgICAgICAgICAgcGFydEludGVnZXIgPSBwYXJ0c1swXTtcbiAgICAgICAgICAgIHBhcnREZWNpbWFsID0gb3duZXIubnVtZXJhbERlY2ltYWxNYXJrICsgcGFydHNbMV0uc2xpY2UoMCwgb3duZXIubnVtZXJhbERlY2ltYWxTY2FsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBzd2l0Y2ggKG93bmVyLm51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlKSB7XG4gICAgICAgIGNhc2UgTnVtZXJhbEZvcm1hdHRlci5ncm91cFN0eWxlLmxha2g6XG4gICAgICAgICAgICBwYXJ0SW50ZWdlciA9IHBhcnRJbnRlZ2VyLnJlcGxhY2UoLyhcXGQpKD89KFxcZFxcZCkrXFxkJCkvZywgJyQxJyArIG93bmVyLmRlbGltaXRlcik7XG5cbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgTnVtZXJhbEZvcm1hdHRlci5ncm91cFN0eWxlLndhbjpcbiAgICAgICAgICAgIHBhcnRJbnRlZ2VyID0gcGFydEludGVnZXIucmVwbGFjZSgvKFxcZCkoPz0oXFxkezR9KSskKS9nLCAnJDEnICsgb3duZXIuZGVsaW1pdGVyKTtcblxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHBhcnRJbnRlZ2VyID0gcGFydEludGVnZXIucmVwbGFjZSgvKFxcZCkoPz0oXFxkezN9KSskKS9nLCAnJDEnICsgb3duZXIuZGVsaW1pdGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJ0SW50ZWdlci50b1N0cmluZygpICsgcGFydERlY2ltYWwudG9TdHJpbmcoKTtcbiAgICB9XG59O1xuXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IE51bWVyYWxGb3JtYXR0ZXI7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBQaG9uZUZvcm1hdHRlciA9IGZ1bmN0aW9uIChmb3JtYXR0ZXIsIGRlbGltaXRlcikge1xuICAgIHZhciBvd25lciA9IHRoaXM7XG5cbiAgICBvd25lci5kZWxpbWl0ZXIgPSBkZWxpbWl0ZXIgfHwgJyAnO1xuICAgIG93bmVyLmRlbGltaXRlclJFID0gbmV3IFJlZ0V4cCgnXFxcXCcgKyBvd25lci5kZWxpbWl0ZXIsICdnJyk7XG4gICAgb3duZXIuZm9ybWF0dGVyID0gZm9ybWF0dGVyO1xufTtcblxuUGhvbmVGb3JtYXR0ZXIucHJvdG90eXBlID0ge1xuICAgIHNldEZvcm1hdHRlcjogZnVuY3Rpb24gKGZvcm1hdHRlcikge1xuICAgICAgICB0aGlzLmZvcm1hdHRlciA9IGZvcm1hdHRlcjtcbiAgICB9LFxuXG4gICAgZm9ybWF0OiBmdW5jdGlvbiAocGhvbmVOdW1iZXIpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcztcblxuICAgICAgICBvd25lci5mb3JtYXR0ZXIuY2xlYXIoKTtcblxuICAgICAgICAvLyBvbmx5IGtlZXAgbnVtYmVyIGFuZCArXG4gICAgICAgIHBob25lTnVtYmVyID0gcGhvbmVOdW1iZXIucmVwbGFjZSgvW15cXGQrXS9nLCAnJyk7XG5cbiAgICAgICAgLy8gc3RyaXAgZGVsaW1pdGVyXG4gICAgICAgIHBob25lTnVtYmVyID0gcGhvbmVOdW1iZXIucmVwbGFjZShvd25lci5kZWxpbWl0ZXJSRSwgJycpO1xuXG4gICAgICAgIHZhciByZXN1bHQgPSAnJywgY3VycmVudCwgdmFsaWRhdGVkID0gZmFsc2U7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlNYXggPSBwaG9uZU51bWJlci5sZW5ndGg7IGkgPCBpTWF4OyBpKyspIHtcbiAgICAgICAgICAgIGN1cnJlbnQgPSBvd25lci5mb3JtYXR0ZXIuaW5wdXREaWdpdChwaG9uZU51bWJlci5jaGFyQXQoaSkpO1xuXG4gICAgICAgICAgICAvLyBoYXMgKCktIG9yIHNwYWNlIGluc2lkZVxuICAgICAgICAgICAgaWYgKC9bXFxzKCktXS9nLnRlc3QoY3VycmVudCkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBjdXJyZW50O1xuXG4gICAgICAgICAgICAgICAgdmFsaWRhdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCF2YWxpZGF0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gY3VycmVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gZWxzZTogb3ZlciBsZW5ndGggaW5wdXRcbiAgICAgICAgICAgICAgICAvLyBpdCB0dXJucyB0byBpbnZhbGlkIG51bWJlciBhZ2FpblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3RyaXAgKClcbiAgICAgICAgLy8gZS5nLiBVUzogNzE2MTIzNDU2NyByZXR1cm5zICg3MTYpIDEyMy00NTY3XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKC9bKCldL2csICcnKTtcbiAgICAgICAgLy8gcmVwbGFjZSBsaWJyYXJ5IGRlbGltaXRlciB3aXRoIHVzZXIgY3VzdG9taXplZCBkZWxpbWl0ZXJcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoL1tcXHMtXS9nLCBvd25lci5kZWxpbWl0ZXIpO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufTtcblxuaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBQaG9uZUZvcm1hdHRlcjtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFV0aWwgPSB7XG4gICAgbm9vcDogZnVuY3Rpb24gKCkge1xuICAgIH0sXG5cbiAgICBzdHJpcDogZnVuY3Rpb24gKHZhbHVlLCByZSkge1xuICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZShyZSwgJycpO1xuICAgIH0sXG5cbiAgICBoZWFkU3RyOiBmdW5jdGlvbiAoc3RyLCBsZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHN0ci5zbGljZSgwLCBsZW5ndGgpO1xuICAgIH0sXG5cbiAgICBnZXRNYXhMZW5ndGg6IGZ1bmN0aW9uIChibG9ja3MpIHtcbiAgICAgICAgcmV0dXJuIGJsb2Nrcy5yZWR1Y2UoZnVuY3Rpb24gKHByZXZpb3VzLCBjdXJyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gcHJldmlvdXMgKyBjdXJyZW50O1xuICAgICAgICB9LCAwKTtcbiAgICB9LFxuXG4gICAgLy8gc3RyaXAgdmFsdWUgYnkgcHJlZml4IGxlbmd0aFxuICAgIC8vIGZvciBwcmVmaXg6IFBSRVxuICAgIC8vIChQUkUxMjMsIDMpIC0+IDEyM1xuICAgIC8vIChQUjEyMywgMykgLT4gMjMgdGhpcyBoYXBwZW5zIHdoZW4gdXNlciBoaXRzIGJhY2tzcGFjZSBpbiBmcm9udCBvZiBcIlBSRVwiXG4gICAgZ2V0UHJlZml4U3RyaXBwZWRWYWx1ZTogZnVuY3Rpb24gKHZhbHVlLCBwcmVmaXhMZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlLnNsaWNlKHByZWZpeExlbmd0aCk7XG4gICAgfSxcblxuICAgIGdldEZvcm1hdHRlZFZhbHVlOiBmdW5jdGlvbiAodmFsdWUsIGJsb2NrcywgYmxvY2tzTGVuZ3RoLCBkZWxpbWl0ZXIpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9ICcnO1xuXG4gICAgICAgIGJsb2Nrcy5mb3JFYWNoKGZ1bmN0aW9uIChsZW5ndGgsIGluZGV4KSB7XG4gICAgICAgICAgICBpZiAodmFsdWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBzdWIgPSB2YWx1ZS5zbGljZSgwLCBsZW5ndGgpLFxuICAgICAgICAgICAgICAgICAgICByZXN0ID0gdmFsdWUuc2xpY2UobGVuZ3RoKTtcblxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBzdWI7XG5cbiAgICAgICAgICAgICAgICBpZiAoc3ViLmxlbmd0aCA9PT0gbGVuZ3RoICYmIGluZGV4IDwgYmxvY2tzTGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgKz0gZGVsaW1pdGVyO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSByZW1haW5pbmcgc3RyaW5nXG4gICAgICAgICAgICAgICAgdmFsdWUgPSByZXN0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn07XG5cbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gVXRpbDtcbn1cbiJdfQ==
