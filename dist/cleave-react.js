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

        target.initValue = opts.initValue || '';

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
                        } else if (parseInt(sub, 10) === 0) {
                            //sub = '01';
                        }
                        break;
                    case 'm':
                        if (parseInt(sub, 10) > 12) {
                            sub = '12';
                        } else if (parseInt(sub, 10) === 0) {
                            //sub = '01';
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZWFjdC5qcyIsInNyYy9DbGVhdmUucmVhY3QuanMiLCJzcmMvY29tbW9uL0RlZmF1bHRQcm9wZXJ0aWVzLmpzIiwic3JjL3Nob3J0Y3V0cy9DcmVkaXRDYXJkRGV0ZWN0b3IuanMiLCJzcmMvc2hvcnRjdXRzL0RhdGVGb3JtYXR0ZXIuanMiLCJzcmMvc2hvcnRjdXRzL051bWVyYWxGb3JtYXR0ZXIuanMiLCJzcmMvc2hvcnRjdXRzL1Bob25lRm9ybWF0dGVyLmpzIiwic3JjL3V0aWxzL1V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQTs7Ozs7Ozs7OztBQ0FBOzs7Ozs7QUFFQSxJQUFJLFFBQVEsUUFBUSxPQUFSLENBQVo7O0FBRUEsSUFBSSxtQkFBbUIsUUFBUSw4QkFBUixDQUF2QjtBQUNBLElBQUksZ0JBQWdCLFFBQVEsMkJBQVIsQ0FBcEI7QUFDQSxJQUFJLGlCQUFpQixRQUFRLDRCQUFSLENBQXJCO0FBQ0EsSUFBSSxxQkFBcUIsUUFBUSxnQ0FBUixDQUF6QjtBQUNBLElBQUksT0FBTyxRQUFRLGNBQVIsQ0FBWDtBQUNBLElBQUksb0JBQW9CLFFBQVEsNEJBQVIsQ0FBeEI7O0FBRUEsSUFBSSxTQUFTLE1BQU0sV0FBTixDQUFrQjtBQUFBOztBQUMzQix1QkFBbUIsNkJBQVk7QUFDM0IsYUFBSyxJQUFMO0FBQ0gsS0FIMEI7O0FBSzNCLCtCQUEyQixtQ0FBVSxTQUFWLEVBQXFCO0FBQzVDLFlBQUksUUFBUSxJQUFaO0FBQUEsWUFDSSxrQkFBa0IsVUFBVSxPQUFWLENBQWtCLGVBRHhDO0FBQUEsWUFFSSxXQUFXLFVBQVUsS0FGekI7O0FBSUEsWUFBSSxRQUFKLEVBQWM7QUFDVixrQkFBTSxPQUFOLENBQWMsUUFBZDtBQUNIOzs7QUFHRCxZQUFJLG1CQUFtQixvQkFBb0IsTUFBTSxVQUFOLENBQWlC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dW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IENsZWF2ZSBmcm9tICcuL3NyYy9DbGVhdmUucmVhY3QnO1xuXG5leHBvcnQgZGVmYXVsdCBDbGVhdmU7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBOdW1lcmFsRm9ybWF0dGVyID0gcmVxdWlyZSgnLi9zaG9ydGN1dHMvTnVtZXJhbEZvcm1hdHRlcicpO1xudmFyIERhdGVGb3JtYXR0ZXIgPSByZXF1aXJlKCcuL3Nob3J0Y3V0cy9EYXRlRm9ybWF0dGVyJyk7XG52YXIgUGhvbmVGb3JtYXR0ZXIgPSByZXF1aXJlKCcuL3Nob3J0Y3V0cy9QaG9uZUZvcm1hdHRlcicpO1xudmFyIENyZWRpdENhcmREZXRlY3RvciA9IHJlcXVpcmUoJy4vc2hvcnRjdXRzL0NyZWRpdENhcmREZXRlY3RvcicpO1xudmFyIFV0aWwgPSByZXF1aXJlKCcuL3V0aWxzL1V0aWwnKTtcbnZhciBEZWZhdWx0UHJvcGVydGllcyA9IHJlcXVpcmUoJy4vY29tbW9uL0RlZmF1bHRQcm9wZXJ0aWVzJyk7XG5cbnZhciBDbGVhdmUgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXh0UHJvcHMpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIHBob25lUmVnaW9uQ29kZSA9IG5leHRQcm9wcy5vcHRpb25zLnBob25lUmVnaW9uQ29kZSxcbiAgICAgICAgICAgIG5ld1ZhbHVlID0gbmV4dFByb3BzLnZhbHVlO1xuXG4gICAgICAgIGlmIChuZXdWYWx1ZSkge1xuICAgICAgICAgICAgb3duZXIub25JbnB1dChuZXdWYWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB1cGRhdGUgcGhvbmUgcmVnaW9uIGNvZGVcbiAgICAgICAgaWYgKHBob25lUmVnaW9uQ29kZSAmJiBwaG9uZVJlZ2lvbkNvZGUgIT09IG93bmVyLnByb3BlcnRpZXMucGhvbmVSZWdpb25Db2RlKSB7XG4gICAgICAgICAgICBvd25lci5wcm9wZXJ0aWVzLnBob25lUmVnaW9uQ29kZSA9IHBob25lUmVnaW9uQ29kZTtcbiAgICAgICAgICAgIG93bmVyLmluaXRQaG9uZUZvcm1hdHRlcigpO1xuICAgICAgICAgICAgb3duZXIub25JbnB1dChvd25lci5wcm9wZXJ0aWVzLnJlc3VsdCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICB7IHZhbHVlLCBvcHRpb25zLCBvbktleURvd24sIG9uQ2hhbmdlLCAuLi5vdGhlciB9ID0gb3duZXIucHJvcHM7XG5cbiAgICAgICAgb3duZXIucmVnaXN0ZXJlZEV2ZW50cyA9IHtcbiAgICAgICAgICAgIG9uQ2hhbmdlOiAgb25DaGFuZ2UgfHwgVXRpbC5ub29wLFxuICAgICAgICAgICAgb25LZXlEb3duOiBvbktleURvd24gfHwgVXRpbC5ub29wXG4gICAgICAgIH07XG5cbiAgICAgICAgb3B0aW9ucy5pbml0VmFsdWUgPSB2YWx1ZTtcblxuICAgICAgICBvd25lci5wcm9wZXJ0aWVzID0gRGVmYXVsdFByb3BlcnRpZXMuYXNzaWduKHt9LCBvcHRpb25zKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgb3RoZXI6IG90aGVyLFxuICAgICAgICAgICAgdmFsdWU6IG93bmVyLnByb3BlcnRpZXMucmVzdWx0XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XG5cbiAgICAgICAgLy8gc28gbm8gbmVlZCBmb3IgdGhpcyBsaWIgYXQgYWxsXG4gICAgICAgIGlmICghcHBzLm51bWVyYWwgJiYgIXBwcy5waG9uZSAmJiAhcHBzLmNyZWRpdENhcmQgJiYgIXBwcy5kYXRlICYmIChwcHMuYmxvY2tzTGVuZ3RoID09PSAwICYmICFwcHMucHJlZml4KSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcHBzLm1heExlbmd0aCA9IFV0aWwuZ2V0TWF4TGVuZ3RoKHBwcy5ibG9ja3MpO1xuXG4gICAgICAgIG93bmVyLmluaXRQaG9uZUZvcm1hdHRlcigpO1xuICAgICAgICBvd25lci5pbml0RGF0ZUZvcm1hdHRlcigpO1xuICAgICAgICBvd25lci5pbml0TnVtZXJhbEZvcm1hdHRlcigpO1xuXG4gICAgICAgIG93bmVyLm9uSW5wdXQocHBzLmluaXRWYWx1ZSk7XG4gICAgfSxcblxuICAgIGluaXROdW1lcmFsRm9ybWF0dGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIGlmICghcHBzLm51bWVyYWwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHBwcy5udW1lcmFsRm9ybWF0dGVyID0gbmV3IE51bWVyYWxGb3JtYXR0ZXIoXG4gICAgICAgICAgICBwcHMubnVtZXJhbERlY2ltYWxNYXJrLFxuICAgICAgICAgICAgcHBzLm51bWVyYWxEZWNpbWFsU2NhbGUsXG4gICAgICAgICAgICBwcHMubnVtZXJhbFRob3VzYW5kc0dyb3VwU3R5bGUsXG4gICAgICAgICAgICBwcHMuZGVsaW1pdGVyXG4gICAgICAgICk7XG4gICAgfSxcblxuICAgIGluaXREYXRlRm9ybWF0dGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIGlmICghcHBzLmRhdGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHBwcy5kYXRlRm9ybWF0dGVyID0gbmV3IERhdGVGb3JtYXR0ZXIocHBzLmRhdGVQYXR0ZXJuKTtcbiAgICAgICAgcHBzLmJsb2NrcyA9IHBwcy5kYXRlRm9ybWF0dGVyLmdldEJsb2NrcygpO1xuICAgICAgICBwcHMuYmxvY2tzTGVuZ3RoID0gcHBzLmJsb2Nrcy5sZW5ndGg7XG4gICAgICAgIHBwcy5tYXhMZW5ndGggPSBVdGlsLmdldE1heExlbmd0aChwcHMuYmxvY2tzKTtcbiAgICB9LFxuXG4gICAgaW5pdFBob25lRm9ybWF0dGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIGlmICghcHBzLnBob25lKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDbGVhdmUuQXNZb3VUeXBlRm9ybWF0dGVyIHNob3VsZCBiZSBwcm92aWRlZCBieVxuICAgICAgICAvLyBleHRlcm5hbCBnb29nbGUgY2xvc3VyZSBsaWJcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHBwcy5waG9uZUZvcm1hdHRlciA9IG5ldyBQaG9uZUZvcm1hdHRlcihcbiAgICAgICAgICAgICAgICBuZXcgd2luZG93LkNsZWF2ZS5Bc1lvdVR5cGVGb3JtYXR0ZXIocHBzLnBob25lUmVnaW9uQ29kZSksXG4gICAgICAgICAgICAgICAgcHBzLmRlbGltaXRlclxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUGxlYXNlIGluY2x1ZGUgcGhvbmUtdHlwZS1mb3JtYXR0ZXIue2NvdW50cnl9LmpzIGxpYicpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIG9uS2V5RG93bjogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICBwcHMgPSBvd25lci5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgY2hhckNvZGUgPSBldmVudC53aGljaCB8fCBldmVudC5rZXlDb2RlO1xuXG4gICAgICAgIC8vIGhpdCBiYWNrc3BhY2Ugd2hlbiBsYXN0IGNoYXJhY3RlciBpcyBkZWxpbWl0ZXJcbiAgICAgICAgaWYgKGNoYXJDb2RlID09PSA4ICYmIHBwcy5yZXN1bHQuc2xpY2UoLTEpID09PSBwcHMuZGVsaW1pdGVyKSB7XG4gICAgICAgICAgICBwcHMuYmFja3NwYWNlID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBwcy5iYWNrc3BhY2UgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIG93bmVyLnJlZ2lzdGVyZWRFdmVudHMub25LZXlEb3duKGV2ZW50KTtcbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIG93bmVyLm9uSW5wdXQoZXZlbnQudGFyZ2V0LnZhbHVlKTtcblxuICAgICAgICBldmVudC50YXJnZXQucmF3VmFsdWUgPSBVdGlsLnN0cmlwKHBwcy5yZXN1bHQsIHBwcy5kZWxpbWl0ZXJSRSk7XG5cbiAgICAgICAgb3duZXIucmVnaXN0ZXJlZEV2ZW50cy5vbkNoYW5nZShldmVudCk7XG4gICAgfSxcblxuICAgIG9uSW5wdXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwcHMgPSBvd25lci5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgcHJldiA9IHBwcy5yZXN1bHQ7XG5cbiAgICAgICAgLy8gY2FzZSAxOiBkZWxldGUgb25lIG1vcmUgY2hhcmFjdGVyIFwiNFwiXG4gICAgICAgIC8vIDEyMzQqfCAtPiBoaXQgYmFja3NwYWNlIC0+IDEyM3xcbiAgICAgICAgLy8gY2FzZSAyOiBsYXN0IGNoYXJhY3RlciBpcyBub3QgZGVsaW1pdGVyIHdoaWNoIGlzOlxuICAgICAgICAvLyAxMnwzNCogLT4gaGl0IGJhY2tzcGFjZSAtPiAxfDM0KlxuXG4gICAgICAgIGlmIChwcHMuYmFja3NwYWNlICYmIHZhbHVlLnNsaWNlKC0xKSAhPT0gcHBzLmRlbGltaXRlcikge1xuICAgICAgICAgICAgdmFsdWUgPSBVdGlsLmhlYWRTdHIodmFsdWUsIHZhbHVlLmxlbmd0aCAtIDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcGhvbmUgZm9ybWF0dGVyXG4gICAgICAgIGlmIChwcHMucGhvbmUpIHtcbiAgICAgICAgICAgIHBwcy5yZXN1bHQgPSBwcHMucGhvbmVGb3JtYXR0ZXIuZm9ybWF0KHZhbHVlKTtcbiAgICAgICAgICAgIG93bmVyLnVwZGF0ZVZhbHVlU3RhdGUoKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbnVtZXJhbCBmb3JtYXR0ZXJcbiAgICAgICAgaWYgKHBwcy5udW1lcmFsKSB7XG4gICAgICAgICAgICBwcHMucmVzdWx0ID0gcHBzLnByZWZpeCArIHBwcy5udW1lcmFsRm9ybWF0dGVyLmZvcm1hdCh2YWx1ZSk7XG4gICAgICAgICAgICBvd25lci51cGRhdGVWYWx1ZVN0YXRlKCk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGRhdGVcbiAgICAgICAgaWYgKHBwcy5kYXRlKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHBwcy5kYXRlRm9ybWF0dGVyLmdldFZhbGlkYXRlZERhdGUodmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3RyaXAgZGVsaW1pdGVyc1xuICAgICAgICB2YWx1ZSA9IFV0aWwuc3RyaXAodmFsdWUsIHBwcy5kZWxpbWl0ZXJSRSk7XG5cbiAgICAgICAgLy8gc3RyaXAgcHJlZml4XG4gICAgICAgIHZhbHVlID0gVXRpbC5nZXRQcmVmaXhTdHJpcHBlZFZhbHVlKHZhbHVlLCBwcHMucHJlZml4TGVuZ3RoKTtcblxuICAgICAgICAvLyBzdHJpcCBub24tbnVtZXJpYyBjaGFyYWN0ZXJzXG4gICAgICAgIHZhbHVlID0gcHBzLm51bWVyaWNPbmx5ID8gVXRpbC5zdHJpcCh2YWx1ZSwgL1teXFxkXS9nKSA6IHZhbHVlO1xuXG4gICAgICAgIC8vIGNvbnZlcnQgY2FzZVxuICAgICAgICB2YWx1ZSA9IHBwcy51cHBlcmNhc2UgPyB2YWx1ZS50b1VwcGVyQ2FzZSgpIDogdmFsdWU7XG4gICAgICAgIHZhbHVlID0gcHBzLmxvd2VyY2FzZSA/IHZhbHVlLnRvTG93ZXJDYXNlKCkgOiB2YWx1ZTtcblxuICAgICAgICAvLyBwcmVmaXhcbiAgICAgICAgaWYgKHBwcy5wcmVmaXgpIHtcbiAgICAgICAgICAgIHZhbHVlID0gcHBzLnByZWZpeCArIHZhbHVlO1xuXG4gICAgICAgICAgICAvLyBubyBibG9ja3Mgc3BlY2lmaWVkLCBubyBuZWVkIHRvIGRvIGZvcm1hdHRpbmdcbiAgICAgICAgICAgIGlmIChwcHMuYmxvY2tzTGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcHBzLnJlc3VsdCA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIG93bmVyLnVwZGF0ZVZhbHVlU3RhdGUoKTtcblxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHVwZGF0ZSBjcmVkaXQgY2FyZCBwcm9wc1xuICAgICAgICBpZiAocHBzLmNyZWRpdENhcmQpIHtcbiAgICAgICAgICAgIG93bmVyLnVwZGF0ZUNyZWRpdENhcmRQcm9wc0J5VmFsdWUodmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3RyaXAgb3ZlciBsZW5ndGggY2hhcmFjdGVyc1xuICAgICAgICB2YWx1ZSA9IFV0aWwuaGVhZFN0cih2YWx1ZSwgcHBzLm1heExlbmd0aCk7XG5cbiAgICAgICAgLy8gYXBwbHkgYmxvY2tzXG4gICAgICAgIHBwcy5yZXN1bHQgPSBVdGlsLmdldEZvcm1hdHRlZFZhbHVlKHZhbHVlLCBwcHMuYmxvY2tzLCBwcHMuYmxvY2tzTGVuZ3RoLCBwcHMuZGVsaW1pdGVyKTtcblxuICAgICAgICAvLyBub3RoaW5nIGNoYW5nZWRcbiAgICAgICAgLy8gcHJldmVudCB1cGRhdGUgdmFsdWUgdG8gYXZvaWQgY2FyZXQgcG9zaXRpb24gY2hhbmdlXG4gICAgICAgIGlmIChwcmV2ID09PSBwcHMucmVzdWx0ICYmIHByZXYgIT09IHBwcy5wcmVmaXgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIG93bmVyLnVwZGF0ZVZhbHVlU3RhdGUoKTtcbiAgICB9LFxuXG4gICAgdXBkYXRlQ3JlZGl0Q2FyZFByb3BzQnlWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHBwcyA9IG93bmVyLnByb3BlcnRpZXMsXG4gICAgICAgICAgICBjcmVkaXRDYXJkSW5mbztcblxuICAgICAgICAvLyBBdCBsZWFzdCBvbmUgb2YgdGhlIGZpcnN0IDQgY2hhcmFjdGVycyBoYXMgY2hhbmdlZFxuICAgICAgICBpZiAoVXRpbC5oZWFkU3RyKHBwcy5yZXN1bHQsIDQpID09PSBVdGlsLmhlYWRTdHIodmFsdWUsIDQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjcmVkaXRDYXJkSW5mbyA9IENyZWRpdENhcmREZXRlY3Rvci5nZXRJbmZvKHZhbHVlLCBwcHMuY3JlZGl0Q2FyZFN0cmljdE1vZGUpO1xuXG4gICAgICAgIHBwcy5ibG9ja3MgPSBjcmVkaXRDYXJkSW5mby5ibG9ja3M7XG4gICAgICAgIHBwcy5ibG9ja3NMZW5ndGggPSBwcHMuYmxvY2tzLmxlbmd0aDtcbiAgICAgICAgcHBzLm1heExlbmd0aCA9IFV0aWwuZ2V0TWF4TGVuZ3RoKHBwcy5ibG9ja3MpO1xuXG4gICAgICAgIC8vIGNyZWRpdCBjYXJkIHR5cGUgY2hhbmdlZFxuICAgICAgICBpZiAocHBzLmNyZWRpdENhcmRUeXBlICE9PSBjcmVkaXRDYXJkSW5mby50eXBlKSB7XG4gICAgICAgICAgICBwcHMuY3JlZGl0Q2FyZFR5cGUgPSBjcmVkaXRDYXJkSW5mby50eXBlO1xuXG4gICAgICAgICAgICBwcHMub25DcmVkaXRDYXJkVHlwZUNoYW5nZWQuY2FsbChvd25lciwgcHBzLmNyZWRpdENhcmRUeXBlKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICB1cGRhdGVWYWx1ZVN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3ZhbHVlOiB0aGlzLnByb3BlcnRpZXMucmVzdWx0fSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiB7Li4ub3duZXIuc3RhdGUub3RoZXJ9XG4gICAgICAgICAgICAgICAgICAgdmFsdWU9e293bmVyLnN0YXRlLnZhbHVlfVxuICAgICAgICAgICAgICAgICAgIG9uS2V5RG93bj17b3duZXIub25LZXlEb3dufVxuICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtvd25lci5vbkNoYW5nZX0vPlxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy5DbGVhdmUgPSBDbGVhdmU7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogUHJvcHMgQXNzaWdubWVudFxuICpcbiAqIFNlcGFyYXRlIHRoaXMsIHNvIHJlYWN0IG1vZHVsZSBjYW4gc2hhcmUgdGhlIHVzYWdlXG4gKi9cbnZhciBEZWZhdWx0UHJvcGVydGllcyA9IHtcbiAgICAvLyBNYXliZSBjaGFuZ2UgdG8gb2JqZWN0LWFzc2lnblxuICAgIC8vIGZvciBub3cganVzdCBrZWVwIGl0IGFzIHNpbXBsZVxuICAgIGFzc2lnbjogZnVuY3Rpb24gKHRhcmdldCwgb3B0cykge1xuICAgICAgICB0YXJnZXQgPSB0YXJnZXQgfHwge307XG4gICAgICAgIG9wdHMgPSBvcHRzIHx8IHt9O1xuXG4gICAgICAgIC8vIGNyZWRpdCBjYXJkXG4gICAgICAgIHRhcmdldC5jcmVkaXRDYXJkID0gISFvcHRzLmNyZWRpdENhcmQ7XG4gICAgICAgIHRhcmdldC5jcmVkaXRDYXJkU3RyaWN0TW9kZSA9ICEhb3B0cy5jcmVkaXRDYXJkU3RyaWN0TW9kZTtcbiAgICAgICAgdGFyZ2V0LmNyZWRpdENhcmRUeXBlID0gJyc7XG4gICAgICAgIHRhcmdldC5vbkNyZWRpdENhcmRUeXBlQ2hhbmdlZCA9IG9wdHMub25DcmVkaXRDYXJkVHlwZUNoYW5nZWQgfHwgKGZ1bmN0aW9uICgpIHt9KTtcblxuICAgICAgICAvLyBwaG9uZVxuICAgICAgICB0YXJnZXQucGhvbmUgPSAhIW9wdHMucGhvbmU7XG4gICAgICAgIHRhcmdldC5waG9uZVJlZ2lvbkNvZGUgPSBvcHRzLnBob25lUmVnaW9uQ29kZSB8fCAnQVUnO1xuICAgICAgICB0YXJnZXQucGhvbmVGb3JtYXR0ZXIgPSB7fTtcblxuICAgICAgICAvLyBkYXRlXG4gICAgICAgIHRhcmdldC5kYXRlID0gISFvcHRzLmRhdGU7XG4gICAgICAgIHRhcmdldC5kYXRlUGF0dGVybiA9IG9wdHMuZGF0ZVBhdHRlcm4gfHwgWydkJywgJ20nLCAnWSddO1xuICAgICAgICB0YXJnZXQuZGF0ZUZvcm1hdHRlciA9IHt9O1xuXG4gICAgICAgIC8vIG51bWVyYWxcbiAgICAgICAgdGFyZ2V0Lm51bWVyYWwgPSAhIW9wdHMubnVtZXJhbDtcbiAgICAgICAgdGFyZ2V0Lm51bWVyYWxEZWNpbWFsU2NhbGUgPSBvcHRzLm51bWVyYWxEZWNpbWFsU2NhbGUgfHwgMjtcbiAgICAgICAgdGFyZ2V0Lm51bWVyYWxEZWNpbWFsTWFyayA9IG9wdHMubnVtZXJhbERlY2ltYWxNYXJrIHx8ICcuJztcbiAgICAgICAgdGFyZ2V0Lm51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlID0gb3B0cy5udW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSB8fCAndGhvdXNhbmQnO1xuXG4gICAgICAgIC8vIG90aGVyc1xuICAgICAgICB0YXJnZXQubnVtZXJpY09ubHkgPSB0YXJnZXQuY3JlZGl0Q2FyZCB8fCB0YXJnZXQuZGF0ZSB8fCAhIW9wdHMubnVtZXJpY09ubHk7XG5cbiAgICAgICAgdGFyZ2V0LnVwcGVyY2FzZSA9ICEhb3B0cy51cHBlcmNhc2U7XG4gICAgICAgIHRhcmdldC5sb3dlcmNhc2UgPSAhIW9wdHMubG93ZXJjYXNlO1xuXG4gICAgICAgIHRhcmdldC5wcmVmaXggPSAodGFyZ2V0LmNyZWRpdENhcmQgfHwgdGFyZ2V0LnBob25lIHx8IHRhcmdldC5kYXRlKSA/ICcnIDogKG9wdHMucHJlZml4IHx8ICcnKTtcbiAgICAgICAgdGFyZ2V0LnByZWZpeExlbmd0aCA9IHRhcmdldC5wcmVmaXgubGVuZ3RoO1xuXG4gICAgICAgIHRhcmdldC5pbml0VmFsdWUgPSBvcHRzLmluaXRWYWx1ZSB8fCAnJztcblxuICAgICAgICB0YXJnZXQuZGVsaW1pdGVyID0gb3B0cy5kZWxpbWl0ZXIgfHwgKHRhcmdldC5kYXRlID8gJy8nIDogKHRhcmdldC5udW1lcmFsID8gJywnIDogJyAnKSk7XG4gICAgICAgIHRhcmdldC5kZWxpbWl0ZXJSRSA9IG5ldyBSZWdFeHAoJ1xcXFwnICsgdGFyZ2V0LmRlbGltaXRlciwgJ2cnKTtcblxuICAgICAgICB0YXJnZXQuYmxvY2tzID0gb3B0cy5ibG9ja3MgfHwgW107XG4gICAgICAgIHRhcmdldC5ibG9ja3NMZW5ndGggPSB0YXJnZXQuYmxvY2tzLmxlbmd0aDtcblxuICAgICAgICB0YXJnZXQubWF4TGVuZ3RoID0gMDtcblxuICAgICAgICB0YXJnZXQuYmFja3NwYWNlID0gZmFsc2U7XG4gICAgICAgIHRhcmdldC5yZXN1bHQgPSAnJztcblxuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbn07XG5cbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gRGVmYXVsdFByb3BlcnRpZXM7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDcmVkaXRDYXJkRGV0ZWN0b3IgPSB7XG4gICAgYmxvY2tzOiB7XG4gICAgICAgIHVhdHA6ICAgICAgICAgIFs0LCA1LCA2XSxcbiAgICAgICAgYW1leDogICAgICAgICAgWzQsIDYsIDVdLFxuICAgICAgICBkaW5lcnM6ICAgICAgICBbNCwgNiwgNF0sXG4gICAgICAgIGRpc2NvdmVyOiAgICAgIFs0LCA0LCA0LCA0XSxcbiAgICAgICAgbWFzdGVyY2FyZDogICAgWzQsIDQsIDQsIDRdLFxuICAgICAgICBkYW5rb3J0OiAgICAgICBbNCwgNCwgNCwgNF0sXG4gICAgICAgIGluc3RhcGF5bWVudDogIFs0LCA0LCA0LCA0XSxcbiAgICAgICAgamNiOiAgICAgICAgICAgWzQsIDQsIDQsIDRdLFxuICAgICAgICB2aXNhOiAgICAgICAgICBbNCwgNCwgNCwgNF0sXG4gICAgICAgIGdlbmVyYWxMb29zZTogIFs0LCA0LCA0LCA0XSxcbiAgICAgICAgZ2VuZXJhbFN0cmljdDogWzQsIDQsIDQsIDddXG4gICAgfSxcblxuICAgIHJlOiB7XG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDE7IDE1IGRpZ2l0cywgbm90IHN0YXJ0cyB3aXRoIDE4MDAgKGpjYiBjYXJkKVxuICAgICAgICB1YXRwOiAvXig/ITE4MDApMVxcZHswLDE0fS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggMzQvMzc7IDE1IGRpZ2l0c1xuICAgICAgICBhbWV4OiAvXjNbNDddXFxkezAsMTN9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCA2MDExLzY1LzY0NC02NDk7IDE2IGRpZ2l0c1xuICAgICAgICBkaXNjb3ZlcjogL14oPzo2MDExfDY1XFxkezAsMn18NjRbNC05XVxcZD8pXFxkezAsMTJ9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCAzMDAtMzA1LzMwOSBvciAzNi8zOC8zOTsgMTQgZGlnaXRzXG4gICAgICAgIGRpbmVyczogL14zKD86MChbMC01XXw5KXxbNjg5XVxcZD8pXFxkezAsMTF9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCA1MS01NS8yMi0yNzsgMTYgZGlnaXRzXG4gICAgICAgIG1hc3RlcmNhcmQ6IC9eKDVbMS01XXwyWzItN10pXFxkezAsMTR9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCA1MDE5LzQxNzUvNDU3MTsgMTYgZGlnaXRzXG4gICAgICAgIGRhbmtvcnQ6IC9eKDUwMTl8NDE3NXw0NTcxKVxcZHswLDEyfS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggNjM3LTYzOTsgMTYgZGlnaXRzXG4gICAgICAgIGluc3RhcGF5bWVudDogL142M1s3LTldXFxkezAsMTN9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCAyMTMxLzE4MDAvMzU7IDE2IGRpZ2l0c1xuICAgICAgICBqY2I6IC9eKD86MjEzMXwxODAwfDM1XFxkezAsMn0pXFxkezAsMTJ9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCA0OyAxNiBkaWdpdHNcbiAgICAgICAgdmlzYTogL140XFxkezAsMTV9L1xuICAgIH0sXG5cbiAgICBnZXRJbmZvOiBmdW5jdGlvbiAodmFsdWUsIHN0cmljdE1vZGUpIHtcbiAgICAgICAgdmFyIGJsb2NrcyA9IENyZWRpdENhcmREZXRlY3Rvci5ibG9ja3MsXG4gICAgICAgICAgICByZSA9IENyZWRpdENhcmREZXRlY3Rvci5yZTtcblxuICAgICAgICAvLyBJbiB0aGVvcnksIHZpc2EgY3JlZGl0IGNhcmQgY2FuIGhhdmUgdXAgdG8gMTkgZGlnaXRzIG51bWJlci5cbiAgICAgICAgLy8gU2V0IHN0cmljdE1vZGUgdG8gdHJ1ZSB3aWxsIHJlbW92ZSB0aGUgMTYgbWF4LWxlbmd0aCByZXN0cmFpbixcbiAgICAgICAgLy8gaG93ZXZlciwgSSBuZXZlciBmb3VuZCBhbnkgd2Vic2l0ZSB2YWxpZGF0ZSBjYXJkIG51bWJlciBsaWtlXG4gICAgICAgIC8vIHRoaXMsIGhlbmNlIHByb2JhYmx5IHlvdSBkb24ndCBuZWVkIHRvIGVuYWJsZSB0aGlzIG9wdGlvbi5cbiAgICAgICAgc3RyaWN0TW9kZSA9ICEhc3RyaWN0TW9kZTtcblxuICAgICAgICBpZiAocmUuYW1leC50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAgICdhbWV4JyxcbiAgICAgICAgICAgICAgICBibG9ja3M6IGJsb2Nrcy5hbWV4XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKHJlLnVhdHAudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogICAndWF0cCcsXG4gICAgICAgICAgICAgICAgYmxvY2tzOiBibG9ja3MudWF0cFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChyZS5kaW5lcnMudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogICAnZGluZXJzJyxcbiAgICAgICAgICAgICAgICBibG9ja3M6IGJsb2Nrcy5kaW5lcnNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAocmUuZGlzY292ZXIudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogICAnZGlzY292ZXInLFxuICAgICAgICAgICAgICAgIGJsb2NrczogYmxvY2tzLmRpc2NvdmVyXG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKHJlLm1hc3RlcmNhcmQudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogICAnbWFzdGVyY2FyZCcsXG4gICAgICAgICAgICAgICAgYmxvY2tzOiBibG9ja3MubWFzdGVyY2FyZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChyZS5kYW5rb3J0LnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICAgJ2RhbmtvcnQnLFxuICAgICAgICAgICAgICAgIGJsb2NrczogYmxvY2tzLmRhbmtvcnRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAocmUuaW5zdGFwYXltZW50LnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICAgJ2luc3RhcGF5bWVudCcsXG4gICAgICAgICAgICAgICAgYmxvY2tzOiBibG9ja3MuaW5zdGFwYXltZW50XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKHJlLmpjYi50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAgICdqY2InLFxuICAgICAgICAgICAgICAgIGJsb2NrczogYmxvY2tzLmpjYlxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChyZS52aXNhLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICAgJ3Zpc2EnLFxuICAgICAgICAgICAgICAgIGJsb2NrczogYmxvY2tzLnZpc2FcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSBpZiAoc3RyaWN0TW9kZSkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAgICd1bmtub3duJyxcbiAgICAgICAgICAgICAgICBibG9ja3M6IGJsb2Nrcy5nZW5lcmFsU3RyaWN0XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAgICd1bmtub3duJyxcbiAgICAgICAgICAgICAgICBibG9ja3M6IGJsb2Nrcy5nZW5lcmFsTG9vc2VcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IENyZWRpdENhcmREZXRlY3Rvcjtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIERhdGVGb3JtYXR0ZXIgPSBmdW5jdGlvbiAoZGF0ZVBhdHRlcm4pIHtcbiAgICB2YXIgb3duZXIgPSB0aGlzO1xuXG4gICAgb3duZXIuYmxvY2tzID0gW107XG4gICAgb3duZXIuZGF0ZVBhdHRlcm4gPSBkYXRlUGF0dGVybjtcbiAgICBvd25lci5pbml0QmxvY2tzKCk7XG59O1xuXG5EYXRlRm9ybWF0dGVyLnByb3RvdHlwZSA9IHtcbiAgICBpbml0QmxvY2tzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXM7XG4gICAgICAgIG93bmVyLmRhdGVQYXR0ZXJuLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09ICdZJykge1xuICAgICAgICAgICAgICAgIG93bmVyLmJsb2Nrcy5wdXNoKDQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvd25lci5ibG9ja3MucHVzaCgyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGdldEJsb2NrczogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ibG9ja3M7XG4gICAgfSxcblxuICAgIGdldFZhbGlkYXRlZERhdGU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCByZXN1bHQgPSAnJztcblxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL1teXFxkXS9nLCAnJyk7XG5cbiAgICAgICAgb3duZXIuYmxvY2tzLmZvckVhY2goZnVuY3Rpb24gKGxlbmd0aCwgaW5kZXgpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1YiA9IHZhbHVlLnNsaWNlKDAsIGxlbmd0aCksXG4gICAgICAgICAgICAgICAgICAgIHJlc3QgPSB2YWx1ZS5zbGljZShsZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgc3dpdGNoIChvd25lci5kYXRlUGF0dGVybltpbmRleF0pIHtcbiAgICAgICAgICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnNlSW50KHN1YiwgMTApID4gMzEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YiA9ICczMSc7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyc2VJbnQoc3ViLCAxMCkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vc3ViID0gJzAxJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdtJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnNlSW50KHN1YiwgMTApID4gMTIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YiA9ICcxMic7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyc2VJbnQoc3ViLCAxMCkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vc3ViID0gJzAxJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gc3ViO1xuXG4gICAgICAgICAgICAgICAgLy8gdXBkYXRlIHJlbWFpbmluZyBzdHJpbmdcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHJlc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufTtcblxuaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBEYXRlRm9ybWF0dGVyO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgTnVtZXJhbEZvcm1hdHRlciA9IGZ1bmN0aW9uIChudW1lcmFsRGVjaW1hbE1hcmssXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudW1lcmFsRGVjaW1hbFNjYWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtZXJhbFRob3VzYW5kc0dyb3VwU3R5bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxpbWl0ZXIpIHtcbiAgICB2YXIgb3duZXIgPSB0aGlzO1xuXG4gICAgb3duZXIubnVtZXJhbERlY2ltYWxNYXJrID0gbnVtZXJhbERlY2ltYWxNYXJrIHx8ICcuJztcbiAgICBvd25lci5udW1lcmFsRGVjaW1hbFNjYWxlID0gbnVtZXJhbERlY2ltYWxTY2FsZSB8fCAyO1xuICAgIG93bmVyLm51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlID0gbnVtZXJhbFRob3VzYW5kc0dyb3VwU3R5bGUgfHwgTnVtZXJhbEZvcm1hdHRlci5ncm91cFN0eWxlLnRob3VzYW5kO1xuICAgIG93bmVyLmRlbGltaXRlciA9IGRlbGltaXRlciB8fCAnLCc7XG59O1xuXG5OdW1lcmFsRm9ybWF0dGVyLmdyb3VwU3R5bGUgPSB7XG4gICAgdGhvdXNhbmQ6ICd0aG91c2FuZCcsXG4gICAgbGFraDogICAgICdsYWtoJyxcbiAgICB3YW46ICAgICAgJ3dhbidcbn07XG5cbk51bWVyYWxGb3JtYXR0ZXIucHJvdG90eXBlID0ge1xuICAgIGZvcm1hdDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHBhcnRzLCBwYXJ0SW50ZWdlciwgcGFydERlY2ltYWwgPSAnJztcblxuICAgICAgICAvLyBzdHJpcCBhbHBoYWJldCBsZXR0ZXJzXG4gICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvW0EtWmEtel0vZywgJycpXG5cbiAgICAgICAgICAgIC8vIHJlcGxhY2UgdGhlIGZpcnN0IGRlY2ltYWwgbWFyayB3aXRoIHJlc2VydmVkIHBsYWNlaG9sZGVyXG4gICAgICAgICAgICAucmVwbGFjZShvd25lci5udW1lcmFsRGVjaW1hbE1hcmssICdNJylcblxuICAgICAgICAgICAgLy8gc3RyaXAgdGhlIG5vbiBudW1lcmljIGxldHRlcnMgZXhjZXB0IE1cbiAgICAgICAgICAgIC5yZXBsYWNlKC9bXlxcZE1dL2csICcnKVxuXG4gICAgICAgICAgICAvLyByZXBsYWNlIG1hcmtcbiAgICAgICAgICAgIC5yZXBsYWNlKCdNJywgb3duZXIubnVtZXJhbERlY2ltYWxNYXJrKVxuXG4gICAgICAgICAgICAvLyBzdHJpcCBsZWFkaW5nIDBcbiAgICAgICAgICAgIC5yZXBsYWNlKC9eKC0pPzArKD89XFxkKS8sICckMScpO1xuXG4gICAgICAgIHBhcnRJbnRlZ2VyID0gdmFsdWU7XG5cbiAgICAgICAgaWYgKHZhbHVlLmluZGV4T2Yob3duZXIubnVtZXJhbERlY2ltYWxNYXJrKSA+PSAwKSB7XG4gICAgICAgICAgICBwYXJ0cyA9IHZhbHVlLnNwbGl0KG93bmVyLm51bWVyYWxEZWNpbWFsTWFyayk7XG4gICAgICAgICAgICBwYXJ0SW50ZWdlciA9IHBhcnRzWzBdO1xuICAgICAgICAgICAgcGFydERlY2ltYWwgPSBvd25lci5udW1lcmFsRGVjaW1hbE1hcmsgKyBwYXJ0c1sxXS5zbGljZSgwLCBvd25lci5udW1lcmFsRGVjaW1hbFNjYWxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXRjaCAob3duZXIubnVtZXJhbFRob3VzYW5kc0dyb3VwU3R5bGUpIHtcbiAgICAgICAgY2FzZSBOdW1lcmFsRm9ybWF0dGVyLmdyb3VwU3R5bGUubGFraDpcbiAgICAgICAgICAgIHBhcnRJbnRlZ2VyID0gcGFydEludGVnZXIucmVwbGFjZSgvKFxcZCkoPz0oXFxkXFxkKStcXGQkKS9nLCAnJDEnICsgb3duZXIuZGVsaW1pdGVyKTtcblxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBOdW1lcmFsRm9ybWF0dGVyLmdyb3VwU3R5bGUud2FuOlxuICAgICAgICAgICAgcGFydEludGVnZXIgPSBwYXJ0SW50ZWdlci5yZXBsYWNlKC8oXFxkKSg/PShcXGR7NH0pKyQpL2csICckMScgKyBvd25lci5kZWxpbWl0ZXIpO1xuXG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcGFydEludGVnZXIgPSBwYXJ0SW50ZWdlci5yZXBsYWNlKC8oXFxkKSg/PShcXGR7M30pKyQpL2csICckMScgKyBvd25lci5kZWxpbWl0ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcnRJbnRlZ2VyLnRvU3RyaW5nKCkgKyBwYXJ0RGVjaW1hbC50b1N0cmluZygpO1xuICAgIH1cbn07XG5cbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gTnVtZXJhbEZvcm1hdHRlcjtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFBob25lRm9ybWF0dGVyID0gZnVuY3Rpb24gKGZvcm1hdHRlciwgZGVsaW1pdGVyKSB7XG4gICAgdmFyIG93bmVyID0gdGhpcztcblxuICAgIG93bmVyLmRlbGltaXRlciA9IGRlbGltaXRlciB8fCAnICc7XG4gICAgb3duZXIuZGVsaW1pdGVyUkUgPSBuZXcgUmVnRXhwKCdcXFxcJyArIG93bmVyLmRlbGltaXRlciwgJ2cnKTtcbiAgICBvd25lci5mb3JtYXR0ZXIgPSBmb3JtYXR0ZXI7XG59O1xuXG5QaG9uZUZvcm1hdHRlci5wcm90b3R5cGUgPSB7XG4gICAgc2V0Rm9ybWF0dGVyOiBmdW5jdGlvbiAoZm9ybWF0dGVyKSB7XG4gICAgICAgIHRoaXMuZm9ybWF0dGVyID0gZm9ybWF0dGVyO1xuICAgIH0sXG5cbiAgICBmb3JtYXQ6IGZ1bmN0aW9uIChwaG9uZU51bWJlcikge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzO1xuXG4gICAgICAgIG93bmVyLmZvcm1hdHRlci5jbGVhcigpO1xuXG4gICAgICAgIC8vIG9ubHkga2VlcCBudW1iZXIgYW5kICtcbiAgICAgICAgcGhvbmVOdW1iZXIgPSBwaG9uZU51bWJlci5yZXBsYWNlKC9bXlxcZCtdL2csICcnKTtcblxuICAgICAgICAvLyBzdHJpcCBkZWxpbWl0ZXJcbiAgICAgICAgcGhvbmVOdW1iZXIgPSBwaG9uZU51bWJlci5yZXBsYWNlKG93bmVyLmRlbGltaXRlclJFLCAnJyk7XG5cbiAgICAgICAgdmFyIHJlc3VsdCA9ICcnLCBjdXJyZW50LCB2YWxpZGF0ZWQgPSBmYWxzZTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMCwgaU1heCA9IHBob25lTnVtYmVyLmxlbmd0aDsgaSA8IGlNYXg7IGkrKykge1xuICAgICAgICAgICAgY3VycmVudCA9IG93bmVyLmZvcm1hdHRlci5pbnB1dERpZ2l0KHBob25lTnVtYmVyLmNoYXJBdChpKSk7XG5cbiAgICAgICAgICAgIC8vIGhhcyAoKS0gb3Igc3BhY2UgaW5zaWRlXG4gICAgICAgICAgICBpZiAoL1tcXHMoKS1dL2cudGVzdChjdXJyZW50KSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGN1cnJlbnQ7XG5cbiAgICAgICAgICAgICAgICB2YWxpZGF0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIXZhbGlkYXRlZCkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBjdXJyZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBlbHNlOiBvdmVyIGxlbmd0aCBpbnB1dFxuICAgICAgICAgICAgICAgIC8vIGl0IHR1cm5zIHRvIGludmFsaWQgbnVtYmVyIGFnYWluXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzdHJpcCAoKVxuICAgICAgICAvLyBlLmcuIFVTOiA3MTYxMjM0NTY3IHJldHVybnMgKDcxNikgMTIzLTQ1NjdcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoL1soKV0vZywgJycpO1xuICAgICAgICAvLyByZXBsYWNlIGxpYnJhcnkgZGVsaW1pdGVyIHdpdGggdXNlciBjdXN0b21pemVkIGRlbGltaXRlclxuICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZSgvW1xccy1dL2csIG93bmVyLmRlbGltaXRlcik7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59O1xuXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IFBob25lRm9ybWF0dGVyO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgVXRpbCA9IHtcbiAgICBub29wOiBmdW5jdGlvbiAoKSB7XG4gICAgfSxcblxuICAgIHN0cmlwOiBmdW5jdGlvbiAodmFsdWUsIHJlKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKHJlLCAnJyk7XG4gICAgfSxcblxuICAgIGhlYWRTdHI6IGZ1bmN0aW9uIChzdHIsIGxlbmd0aCkge1xuICAgICAgICByZXR1cm4gc3RyLnNsaWNlKDAsIGxlbmd0aCk7XG4gICAgfSxcblxuICAgIGdldE1heExlbmd0aDogZnVuY3Rpb24gKGJsb2Nrcykge1xuICAgICAgICByZXR1cm4gYmxvY2tzLnJlZHVjZShmdW5jdGlvbiAocHJldmlvdXMsIGN1cnJlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBwcmV2aW91cyArIGN1cnJlbnQ7XG4gICAgICAgIH0sIDApO1xuICAgIH0sXG5cbiAgICAvLyBzdHJpcCB2YWx1ZSBieSBwcmVmaXggbGVuZ3RoXG4gICAgLy8gZm9yIHByZWZpeDogUFJFXG4gICAgLy8gKFBSRTEyMywgMykgLT4gMTIzXG4gICAgLy8gKFBSMTIzLCAzKSAtPiAyMyB0aGlzIGhhcHBlbnMgd2hlbiB1c2VyIGhpdHMgYmFja3NwYWNlIGluIGZyb250IG9mIFwiUFJFXCJcbiAgICBnZXRQcmVmaXhTdHJpcHBlZFZhbHVlOiBmdW5jdGlvbiAodmFsdWUsIHByZWZpeExlbmd0aCkge1xuICAgICAgICByZXR1cm4gdmFsdWUuc2xpY2UocHJlZml4TGVuZ3RoKTtcbiAgICB9LFxuXG4gICAgZ2V0Rm9ybWF0dGVkVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSwgYmxvY2tzLCBibG9ja3NMZW5ndGgsIGRlbGltaXRlcikge1xuICAgICAgICB2YXIgcmVzdWx0ID0gJyc7XG5cbiAgICAgICAgYmxvY2tzLmZvckVhY2goZnVuY3Rpb24gKGxlbmd0aCwgaW5kZXgpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1YiA9IHZhbHVlLnNsaWNlKDAsIGxlbmd0aCksXG4gICAgICAgICAgICAgICAgICAgIHJlc3QgPSB2YWx1ZS5zbGljZShsZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IHN1YjtcblxuICAgICAgICAgICAgICAgIGlmIChzdWIubGVuZ3RoID09PSBsZW5ndGggJiYgaW5kZXggPCBibG9ja3NMZW5ndGggLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCArPSBkZWxpbWl0ZXI7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gdXBkYXRlIHJlbWFpbmluZyBzdHJpbmdcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHJlc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufTtcblxuaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBVdGlsO1xufVxuIl19
