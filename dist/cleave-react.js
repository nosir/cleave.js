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

        // make sure that prefix has a value, even if it's an empty string
        pps.prefix = !pps.prefix ? '' : pps.prefix;

        // so no need for this lib at all
        if (!pps.numeral && !pps.phone && !pps.creditCard && !pps.date && pps.blocks.length === 0 && pps.prefix === '') {
            return;
        }

        if (pps.blocks.length) {
            pps.maxLength = Util.getMaxLength(pps.blocks);
        }

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

        pps.numeralFormatter = new NumeralFormatter(pps.numeralDecimalMark, pps.numeralDecimalScale, pps.numeralThousandsGroupStyle, pps.delimiter, pps.prefix);
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
            var formattedNumber = pps.numeralFormatter.format(value);
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
        if (pps.maxLength) {
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
                target.initValue = opts.initValue || '';

                target.numericOnly = target.creditCard || target.date || !!opts.numericOnly;

                target.uppercase = !!opts.uppercase;
                target.lowercase = !!opts.lowercase;

                target.prefix = target.creditCard || target.phone || target.date ? '' : opts.prefix || '';

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

var NumeralFormatter = function NumeralFormatter(numeralDecimalMark, numeralDecimalScale, numeralThousandsGroupStyle, delimiter, prefix) {
    var owner = this;

    owner.numeralDecimalMark = numeralDecimalMark || '.';
    owner.numeralDecimalScale = numeralDecimalScale || 2;
    owner.numeralThousandsGroupStyle = numeralThousandsGroupStyle || NumeralFormatter.groupStyle.thousand;
    owner.delimiter = delimiter || ',';
    owner.prefix = prefix;
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
        var prefixRegExp = new RegExp('[^\\dM' + owner.prefix + ']', 'g');

        // strip alphabet letters
        value = value.replace(/[A-Za-z]/g, '')

        // replace the first decimal mark with reserved placeholder
        .replace(owner.numeralDecimalMark, 'M')

        // strip the non numeric letters except M
        .replace(prefixRegExp, '')

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

    getPrefixAppliedValue: function getPrefixAppliedValue(value, prefix) {
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

        return result !== '' ? result : value;
    }
};

if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && _typeof(module.exports) === 'object') {
    module.exports = exports = Util;
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZWFjdC5qcyIsInNyY1xcc3JjXFxDbGVhdmUucmVhY3QuanMiLCJzcmNcXGNvbW1vblxcRGVmYXVsdFByb3BlcnRpZXMuanMiLCJzcmNcXHNob3J0Y3V0c1xcQ3JlZGl0Q2FyZERldGVjdG9yLmpzIiwic3JjXFxzaG9ydGN1dHNcXERhdGVGb3JtYXR0ZXIuanMiLCJzcmNcXHNob3J0Y3V0c1xcTnVtZXJhbEZvcm1hdHRlci5qcyIsInNyY1xcc2hvcnRjdXRzXFxQaG9uZUZvcm1hdHRlci5qcyIsInNyY1xcdXRpbHNcXFV0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQTs7Ozs7Ozs7OztBQ0FBOzs7Ozs7QUFFQSxJQUFJLFFBQVEsUUFBUSxPQUFSLENBQVo7O0FBRUEsSUFBSSxtQkFBbUIsUUFBUSw4QkFBUixDQUF2QjtBQUNBLElBQUksZ0JBQWdCLFFBQVEsMkJBQVIsQ0FBcEI7QUFDQSxJQUFJLGlCQUFpQixRQUFRLDRCQUFSLENBQXJCO0FBQ0EsSUFBSSxxQkFBcUIsUUFBUSxnQ0FBUixDQUF6QjtBQUNBLElBQUksT0FBTyxRQUFRLGNBQVIsQ0FBWDtBQUNBLElBQUksb0JBQW9CLFFBQVEsNEJBQVIsQ0FBeEI7O0FBRUEsSUFBSSxTQUFTLE1BQU0sV0FBTixDQUFrQjtBQUFBOztBQUMzQix1QkFBbUIsNkJBQVk7QUFDM0IsYUFBSyxJQUFMO0FBQ0gsS0FIMEI7O0FBSzNCLCtCQUEyQixtQ0FBVSxTQUFWLEVBQXFCO0FBQzVDLFlBQUksUUFBUSxJQUFaO0FBQUEsWUFDSSxrQkFBa0IsVUFBVSxPQUFWLENBQWtCLGVBRHhDOzs7QUFJQSxZQUFJLG1CQUFtQixvQkFBb0IsTUFBTSxVQUFOLENBQWlCLGVBQTVELEVBQTZFO0FBQ3pFLGtCQUFNLFVBQU4sQ0FBaUIsZUFBakIsR0FBbUMsZUFBbkM7QUFDQSxrQkFBTSxrQkFBTjtBQUNBLGtCQUFNLE9B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QkFBVSxTQUFWO0FBQ0g7OztBQUdELHdCQUFRLElBQVI7QUFDSDtBQUNKLFNBZEQ7O0FBZ0JBLGVBQVEsV0FBVyxFQUFaLEdBQWtCLE1BQWxCLEdBQTJCLEtBQWxDO0FBQ0g7QUF6RE0sQ0FBWDs7QUE0REEsSUFBSSxRQUFPLE1BQVAseUNBQU8sTUFBUCxPQUFrQixRQUFsQixJQUE4QixRQUFPLE9BQU8sT0FBZCxNQUEwQixRQUE1RCxFQUFzRTtBQUNsRSxXQUFPLE9BQVAsR0FBaUIsVUFBVSxJQUEzQjtBQUNIIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBDbGVhdmUgZnJvbSAnLi9zcmMvQ2xlYXZlLnJlYWN0JztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IENsZWF2ZTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcclxuXHJcbnZhciBOdW1lcmFsRm9ybWF0dGVyID0gcmVxdWlyZSgnLi9zaG9ydGN1dHMvTnVtZXJhbEZvcm1hdHRlcicpO1xyXG52YXIgRGF0ZUZvcm1hdHRlciA9IHJlcXVpcmUoJy4vc2hvcnRjdXRzL0RhdGVGb3JtYXR0ZXInKTtcclxudmFyIFBob25lRm9ybWF0dGVyID0gcmVxdWlyZSgnLi9zaG9ydGN1dHMvUGhvbmVGb3JtYXR0ZXInKTtcclxudmFyIENyZWRpdENhcmREZXRlY3RvciA9IHJlcXVpcmUoJy4vc2hvcnRjdXRzL0NyZWRpdENhcmREZXRlY3RvcicpO1xyXG52YXIgVXRpbCA9IHJlcXVpcmUoJy4vdXRpbHMvVXRpbCcpO1xyXG52YXIgRGVmYXVsdFByb3BlcnRpZXMgPSByZXF1aXJlKCcuL2NvbW1vbi9EZWZhdWx0UHJvcGVydGllcycpO1xyXG5cclxudmFyIENsZWF2ZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcclxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXh0UHJvcHMpIHtcclxuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxyXG4gICAgICAgICAgICBwaG9uZVJlZ2lvbkNvZGUgPSBuZXh0UHJvcHMub3B0aW9ucy5waG9uZVJlZ2lvbkNvZGU7XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBwaG9uZSByZWdpb24gY29kZVxyXG4gICAgICAgIGlmIChwaG9uZVJlZ2lvbkNvZGUgJiYgcGhvbmVSZWdpb25Db2RlICE9PSBvd25lci5wcm9wZXJ0aWVzLnBob25lUmVnaW9uQ29kZSkge1xyXG4gICAgICAgICAgICBvd25lci5wcm9wZXJ0aWVzLnBob25lUmVnaW9uQ29kZSA9IHBob25lUmVnaW9uQ29kZTtcclxuICAgICAgICAgICAgb3duZXIuaW5pdFBob25lRm9ybWF0dGVyKCk7XHJcbiAgICAgICAgICAgIG93bmVyLm9uSW5wdXQob3duZXIucHJvcGVydGllcy5yZXN1bHQpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcclxuICAgICAgICAgICAgeyB2YWx1ZSwgb3B0aW9ucywgb25LZXlEb3duLCBvbkNoYW5nZSwgLi4ub3RoZXIgfSA9IG93bmVyLnByb3BzO1xyXG5cclxuICAgICAgICBvd25lci5yZWdpc3RlcmVkRXZlbnRzID0ge1xyXG4gICAgICAgICAgICBvbkNoYW5nZTogIG9uQ2hhbmdlIHx8IFV0aWwubm9vcCxcclxuICAgICAgICAgICAgb25LZXlEb3duOiBvbktleURvd24gfHwgVXRpbC5ub29wXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgb3B0aW9ucy5pbml0VmFsdWUgPSB2YWx1ZTtcclxuXHJcbiAgICAgICAgb3duZXIucHJvcGVydGllcyA9IERlZmF1bHRQcm9wZXJ0aWVzLmFzc2lnbih7fSwgb3B0aW9ucyk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG90aGVyOiBvdGhlcixcclxuICAgICAgICAgICAgdmFsdWU6IG93bmVyLnByb3BlcnRpZXMucmVzdWx0XHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcblxyXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXHJcbiAgICAgICAgICAgIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XHJcblxyXG4gICAgICAgIC8vIG1ha2Ugc3VyZSB0aGF0IHByZWZpeCBoYXMgYSB2YWx1ZSwgZXZlbiBpZiBpdCdzIGFuIGVtcHR5IHN0cmluZ1xyXG4gICAgICAgIHBwcy5wcmVmaXggPSAoIXBwcy5wcmVmaXgpID8gJycgOiBwcHMucHJlZml4O1xyXG5cclxuICAgICAgICAvLyBzbyBubyBuZWVkIGZvciB0aGlzIGxpYiBhdCBhbGxcclxuICAgICAgICBpZiAoIXBwcy5udW1lcmFsICYmICFwcHMucGhvbmUgJiYgIXBwcy5jcmVkaXRDYXJkICYmICFwcHMuZGF0ZSAmJiBwcHMuYmxvY2tzLmxlbmd0aCA9PT0gMCAmJiBwcHMucHJlZml4ID09PSAnJykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZihwcHMuYmxvY2tzLmxlbmd0aCkge1xyXG4gICAgICAgICAgcHBzLm1heExlbmd0aCA9IFV0aWwuZ2V0TWF4TGVuZ3RoKHBwcy5ibG9ja3MpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgb3duZXIuaW5pdFBob25lRm9ybWF0dGVyKCk7XHJcbiAgICAgICAgb3duZXIuaW5pdERhdGVGb3JtYXR0ZXIoKTtcclxuICAgICAgICBvd25lci5pbml0TnVtZXJhbEZvcm1hdHRlcigpO1xyXG5cclxuICAgICAgICBvd25lci5vbklucHV0KHBwcy5pbml0VmFsdWUpO1xyXG4gICAgfSxcclxuXHJcbiAgICBpbml0TnVtZXJhbEZvcm1hdHRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXHJcbiAgICAgICAgICAgIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XHJcblxyXG4gICAgICAgIGlmICghcHBzLm51bWVyYWwpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHBzLm51bWVyYWxGb3JtYXR0ZXIgPSBuZXcgTnVtZXJhbEZvcm1hdHRlcihcclxuICAgICAgICAgICAgcHBzLm51bWVyYWxEZWNpbWFsTWFyayxcclxuICAgICAgICAgICAgcHBzLm51bWVyYWxEZWNpbWFsU2NhbGUsXHJcbiAgICAgICAgICAgIHBwcy5udW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSxcclxuICAgICAgICAgICAgcHBzLmRlbGltaXRlcixcclxuICAgICAgICAgICAgcHBzLnByZWZpeFxyXG4gICAgICAgICk7XHJcbiAgICB9LFxyXG5cclxuICAgIGluaXREYXRlRm9ybWF0dGVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcclxuICAgICAgICAgICAgcHBzID0gb3duZXIucHJvcGVydGllcztcclxuXHJcbiAgICAgICAgaWYgKCFwcHMuZGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcHMuZGF0ZUZvcm1hdHRlciA9IG5ldyBEYXRlRm9ybWF0dGVyKHBwcy5kYXRlUGF0dGVybik7XHJcbiAgICAgICAgcHBzLmJsb2NrcyA9IHBwcy5kYXRlRm9ybWF0dGVyLmdldEJsb2NrcygpO1xyXG4gICAgICAgIHBwcy5ibG9ja3NMZW5ndGggPSBwcHMuYmxvY2tzLmxlbmd0aDtcclxuICAgICAgICBwcHMubWF4TGVuZ3RoID0gVXRpbC5nZXRNYXhMZW5ndGgocHBzLmJsb2Nrcyk7XHJcbiAgICB9LFxyXG5cclxuICAgIGluaXRQaG9uZUZvcm1hdHRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXHJcbiAgICAgICAgICAgIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XHJcblxyXG4gICAgICAgIGlmICghcHBzLnBob25lKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENsZWF2ZS5Bc1lvdVR5cGVGb3JtYXR0ZXIgc2hvdWxkIGJlIHByb3ZpZGVkIGJ5XHJcbiAgICAgICAgLy8gZXh0ZXJuYWwgZ29vZ2xlIGNsb3N1cmUgbGliXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgcHBzLnBob25lRm9ybWF0dGVyID0gbmV3IFBob25lRm9ybWF0dGVyKFxyXG4gICAgICAgICAgICAgICAgbmV3IHdpbmRvdy5DbGVhdmUuQXNZb3VUeXBlRm9ybWF0dGVyKHBwcy5waG9uZVJlZ2lvbkNvZGUpLFxyXG4gICAgICAgICAgICAgICAgcHBzLmRlbGltaXRlclxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH0gY2F0Y2ggKGV4KSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUGxlYXNlIGluY2x1ZGUgcGhvbmUtdHlwZS1mb3JtYXR0ZXIue2NvdW50cnl9LmpzIGxpYicpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgb25LZXlEb3duOiBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxyXG4gICAgICAgICAgICBwcHMgPSBvd25lci5wcm9wZXJ0aWVzLFxyXG4gICAgICAgICAgICBjaGFyQ29kZSA9IGV2ZW50LndoaWNoIHx8IGV2ZW50LmtleUNvZGU7XHJcblxyXG4gICAgICAgIC8vIGhpdCBiYWNrc3BhY2Ugd2hlbiBsYXN0IGNoYXJhY3RlciBpcyBkZWxpbWl0ZXJcclxuICAgICAgICBpZiAoY2hhckNvZGUgPT09IDggJiYgcHBzLnJlc3VsdC5zbGljZSgtMSkgPT09IHBwcy5kZWxpbWl0ZXIpIHtcclxuICAgICAgICAgICAgcHBzLmJhY2tzcGFjZSA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcHBzLmJhY2tzcGFjZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgb3duZXIucmVnaXN0ZXJlZEV2ZW50cy5vbktleURvd24oZXZlbnQpO1xyXG4gICAgfSxcclxuXHJcbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcHBzID0gb3duZXIucHJvcGVydGllcztcclxuXHJcbiAgICAgICAgb3duZXIub25JbnB1dChldmVudC50YXJnZXQudmFsdWUpO1xyXG5cclxuICAgICAgICBldmVudC50YXJnZXQucmF3VmFsdWUgPSBVdGlsLnN0cmlwKHBwcy5yZXN1bHQsIHBwcy5kZWxpbWl0ZXJSRSk7XHJcblxyXG4gICAgICAgIG93bmVyLnJlZ2lzdGVyZWRFdmVudHMub25DaGFuZ2UoZXZlbnQpO1xyXG4gICAgfSxcclxuXHJcbiAgICBvbklucHV0OiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwcHMgPSBvd25lci5wcm9wZXJ0aWVzLFxyXG4gICAgICAgICAgICBwcmV2ID0gcHBzLnJlc3VsdDtcclxuXHJcbiAgICAgICAgLy8gY2FzZSAxOiBkZWxldGUgb25lIG1vcmUgY2hhcmFjdGVyIFwiNFwiXHJcbiAgICAgICAgLy8gMTIzNCp8IC0+IGhpdCBiYWNrc3BhY2UgLT4gMTIzfFxyXG4gICAgICAgIC8vIGNhc2UgMjogbGFzdCBjaGFyYWN0ZXIgaXMgbm90IGRlbGltaXRlciB3aGljaCBpczpcclxuICAgICAgICAvLyAxMnwzNCogLT4gaGl0IGJhY2tzcGFjZSAtPiAxfDM0KlxyXG5cclxuICAgICAgICBpZiAocHBzLmJhY2tzcGFjZSAmJiB2YWx1ZS5zbGljZSgtMSkgIT09IHBwcy5kZWxpbWl0ZXIpIHtcclxuICAgICAgICAgICAgdmFsdWUgPSBVdGlsLmhlYWRTdHIodmFsdWUsIHZhbHVlLmxlbmd0aCAtIDEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gcGhvbmUgZm9ybWF0dGVyXHJcbiAgICAgICAgaWYgKHBwcy5waG9uZSkge1xyXG4gICAgICAgICAgICBwcHMucmVzdWx0ID0gcHBzLnBob25lRm9ybWF0dGVyLmZvcm1hdCh2YWx1ZSk7XHJcbiAgICAgICAgICAgIG93bmVyLnVwZGF0ZVZhbHVlU3RhdGUoKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIG51bWVyYWwgZm9ybWF0dGVyXHJcbiAgICAgICAgaWYgKHBwcy5udW1lcmFsKSB7XHJcbiAgICAgICAgICAgIHZhciBmb3JtYXR0ZWROdW1iZXI9IHBwcy5udW1lcmFsRm9ybWF0dGVyLmZvcm1hdCh2YWx1ZSk7XHJcbiAgICAgICAgICAgIHBwcy5yZXN1bHQgPSBVdGlsLmdldFByZWZpeEFwcGxpZWRWYWx1ZShmb3JtYXR0ZWROdW1iZXIsIHBwcy5wcmVmaXgpO1xyXG4gICAgICAgICAgICBvd25lci51cGRhdGVWYWx1ZVN0YXRlKCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBkYXRlXHJcbiAgICAgICAgaWYgKHBwcy5kYXRlKSB7XHJcbiAgICAgICAgICAgIHZhbHVlID0gcHBzLmRhdGVGb3JtYXR0ZXIuZ2V0VmFsaWRhdGVkRGF0ZSh2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBzdHJpcCBkZWxpbWl0ZXJzXHJcbiAgICAgICAgdmFsdWUgPSBVdGlsLnN0cmlwKHZhbHVlLCBwcHMuZGVsaW1pdGVyUkUpO1xyXG5cclxuICAgICAgICAvLyBwcmVmaXhcclxuICAgICAgICB2YWx1ZSA9IFV0aWwuZ2V0UHJlZml4QXBwbGllZFZhbHVlKHZhbHVlLCBwcHMucHJlZml4KTtcclxuXHJcbiAgICAgICAgLy8gc3RyaXAgbm9uLW51bWVyaWMgY2hhcmFjdGVycyBidXQgcHJlc2VydmUgcHJlZml4XHJcbiAgICAgICAgaWYgKHBwcy5udW1lcmljT25seSkge1xyXG4gICAgICAgICAgICB2YXIgcHJlZml4UmVnRXhwID0gbmV3IFJlZ0V4cCgnW15cXFxcZCcgKyBwcHMucHJlZml4ICsgJ10nLCAnZycpO1xyXG4gICAgICAgICAgICB2YWx1ZSA9IFV0aWwuc3RyaXAodmFsdWUsIHByZWZpeFJlZ0V4cCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyB1cGRhdGUgY3JlZGl0IGNhcmQgcHJvcHNcclxuICAgICAgICBpZiAocHBzLmNyZWRpdENhcmQpIHtcclxuICAgICAgICAgICAgb3duZXIudXBkYXRlQ3JlZGl0Q2FyZFByb3BzQnlWYWx1ZSh2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBzdHJpcCBvdmVyIGxlbmd0aCBjaGFyYWN0ZXJzXHJcbiAgICAgICAgaWYocHBzLm1heExlbmd0aCkge1xyXG4gICAgICAgICAgdmFsdWUgPSBVdGlsLmhlYWRTdHIodmFsdWUsIHBwcy5tYXhMZW5ndGgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gY29udmVydCBjYXNlXHJcbiAgICAgICAgdmFsdWUgPSBwcHMudXBwZXJjYXNlID8gdmFsdWUudG9VcHBlckNhc2UoKSA6IHZhbHVlO1xyXG4gICAgICAgIHZhbHVlID0gcHBzLmxvd2VyY2FzZSA/IHZhbHVlLnRvTG93ZXJDYXNlKCkgOiB2YWx1ZTtcclxuXHJcbiAgICAgICAgLy8gYXBwbHkgYmxvY2tzXHJcbiAgICAgICAgcHBzLnJlc3VsdCA9IFV0aWwuZ2V0Rm9ybWF0dGVkVmFsdWUodmFsdWUsIHBwcy5ibG9ja3MsIHBwcy5ibG9ja3NMZW5ndGgsIHBwcy5kZWxpbWl0ZXIpO1xyXG5cclxuICAgICAgICAvLyBub3RoaW5nIGNoYW5nZWRcclxuICAgICAgICAvLyBwcmV2ZW50IHVwZGF0ZSB2YWx1ZSB0byBhdm9pZCBjYXJldCBwb3NpdGlvbiBjaGFuZ2VcclxuICAgICAgICBpZiAocHJldiA9PT0gcHBzLnJlc3VsdCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBvd25lci51cGRhdGVWYWx1ZVN0YXRlKCk7XHJcbiAgICB9LFxyXG5cclxuICAgIHVwZGF0ZUNyZWRpdENhcmRQcm9wc0J5VmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHBwcyA9IG93bmVyLnByb3BlcnRpZXMsXHJcbiAgICAgICAgICAgIGNyZWRpdENhcmRJbmZvO1xyXG5cclxuICAgICAgICAvLyBBdCBsZWFzdCBvbmUgb2YgdGhlIGZpcnN0IDQgY2hhcmFjdGVycyBoYXMgY2hhbmdlZFxyXG4gICAgICAgIGlmIChVdGlsLmhlYWRTdHIocHBzLnJlc3VsdCwgNCkgPT09IFV0aWwuaGVhZFN0cih2YWx1ZSwgNCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY3JlZGl0Q2FyZEluZm8gPSBDcmVkaXRDYXJkRGV0ZWN0b3IuZ2V0SW5mbyh2YWx1ZSwgcHBzLmNyZWRpdENhcmRTdHJpY3RNb2RlKTtcclxuXHJcbiAgICAgICAgcHBzLmJsb2NrcyA9IGNyZWRpdENhcmRJbmZvLmJsb2NrcztcclxuICAgICAgICBwcHMuYmxvY2tzTGVuZ3RoID0gcHBzLmJsb2Nrcy5sZW5ndGg7XHJcbiAgICAgICAgcHBzLm1heExlbmd0aCA9IFV0aWwuZ2V0TWF4TGVuZ3RoKHBwcy5ibG9ja3MpO1xyXG5cclxuICAgICAgICAvLyBjcmVkaXQgY2FyZCB0eXBlIGNoYW5nZWRcclxuICAgICAgICBpZiAocHBzLmNyZWRpdENhcmRUeXBlICE9PSBjcmVkaXRDYXJkSW5mby50eXBlKSB7XHJcbiAgICAgICAgICAgIHBwcy5jcmVkaXRDYXJkVHlwZSA9IGNyZWRpdENhcmRJbmZvLnR5cGU7XHJcblxyXG4gICAgICAgICAgICBwcHMub25DcmVkaXRDYXJkVHlwZUNoYW5nZWQuY2FsbChvd25lciwgcHBzLmNyZWRpdENhcmRUeXBlKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHVwZGF0ZVZhbHVlU3RhdGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnNldFN0YXRlKHt2YWx1ZTogdGhpcy5wcm9wZXJ0aWVzLnJlc3VsdH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgb3duZXIgPSB0aGlzO1xyXG5cclxuICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiB7Li4ub3duZXIuc3RhdGUub3RoZXJ9XHJcbiAgICAgICAgICAgICAgICAgICB2YWx1ZT17b3duZXIuc3RhdGUudmFsdWV9XHJcbiAgICAgICAgICAgICAgICAgICBvbktleURvd249e293bmVyLm9uS2V5RG93bn1cclxuICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtvd25lci5vbkNoYW5nZX0vPlxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cuQ2xlYXZlID0gQ2xlYXZlO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG4vKipcclxuICogUHJvcHMgQXNzaWdubWVudFxyXG4gKlxyXG4gKiBTZXBhcmF0ZSB0aGlzLCBzbyByZWFjdCBtb2R1bGUgY2FuIHNoYXJlIHRoZSB1c2FnZVxyXG4gKi9cclxudmFyIERlZmF1bHRQcm9wZXJ0aWVzID0ge1xyXG4gICAgLy8gTWF5YmUgY2hhbmdlIHRvIG9iamVjdC1hc3NpZ25cclxuICAgIC8vIGZvciBub3cganVzdCBrZWVwIGl0IGFzIHNpbXBsZVxyXG4gICAgYXNzaWduOiBmdW5jdGlvbiAodGFyZ2V0LCBvcHRzKSB7XHJcbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0IHx8IHt9O1xyXG4gICAgICAgIG9wdHMgPSBvcHRzIHx8IHt9O1xyXG5cclxuICAgICAgICAvLyBjcmVkaXQgY2FyZFxyXG4gICAgICAgIHRhcmdldC5jcmVkaXRDYXJkID0gISFvcHRzLmNyZWRpdENhcmQ7XHJcbiAgICAgICAgdGFyZ2V0LmNyZWRpdENhcmRTdHJpY3RNb2RlID0gISFvcHRzLmNyZWRpdENhcmRTdHJpY3RNb2RlO1xyXG4gICAgICAgIHRhcmdldC5jcmVkaXRDYXJkVHlwZSA9ICcnO1xyXG4gICAgICAgIHRhcmdldC5vbkNyZWRpdENhcmRUeXBlQ2hhbmdlZCA9IG9wdHMub25DcmVkaXRDYXJkVHlwZUNoYW5nZWQgfHwgKGZ1bmN0aW9uICgpIHt9KTtcclxuXHJcbiAgICAgICAgLy8gcGhvbmVcclxuICAgICAgICB0YXJnZXQucGhvbmUgPSAhIW9wdHMucGhvbmU7XHJcbiAgICAgICAgdGFyZ2V0LnBob25lUmVnaW9uQ29kZSA9IG9wdHMucGhvbmVSZWdpb25Db2RlIHx8ICdBVSc7XHJcbiAgICAgICAgdGFyZ2V0LnBob25lRm9ybWF0dGVyID0ge307XHJcblxyXG4gICAgICAgIC8vIGRhdGVcclxuICAgICAgICB0YXJnZXQuZGF0ZSA9ICEhb3B0cy5kYXRlO1xyXG4gICAgICAgIHRhcmdldC5kYXRlUGF0dGVybiA9IG9wdHMuZGF0ZVBhdHRlcm4gfHwgWydkJywgJ20nLCAnWSddO1xyXG4gICAgICAgIHRhcmdldC5kYXRlRm9ybWF0dGVyID0ge307XHJcblxyXG4gICAgICAgIC8vIG51bWVyYWxcclxuICAgICAgICB0YXJnZXQubnVtZXJhbCA9ICEhb3B0cy5udW1lcmFsO1xyXG4gICAgICAgIHRhcmdldC5udW1lcmFsRGVjaW1hbFNjYWxlID0gb3B0cy5udW1lcmFsRGVjaW1hbFNjYWxlIHx8IDI7XHJcbiAgICAgICAgdGFyZ2V0Lm51bWVyYWxEZWNpbWFsTWFyayA9IG9wdHMubnVtZXJhbERlY2ltYWxNYXJrIHx8ICcuJztcclxuICAgICAgICB0YXJnZXQubnVtZXJhbFRob3VzYW5kc0dyb3VwU3R5bGUgPSBvcHRzLm51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlIHx8ICd0aG91c2FuZCc7XHJcblxyXG4gICAgICAgIC8vIG90aGVyc1xyXG4gICAgICAgIHRhcmdldC5pbml0VmFsdWUgPSBvcHRzLmluaXRWYWx1ZSB8fCAnJztcclxuXHJcbiAgICAgICAgdGFyZ2V0Lm51bWVyaWNPbmx5ID0gdGFyZ2V0LmNyZWRpdENhcmQgfHwgdGFyZ2V0LmRhdGUgfHwgISFvcHRzLm51bWVyaWNPbmx5O1xyXG5cclxuICAgICAgICB0YXJnZXQudXBwZXJjYXNlID0gISFvcHRzLnVwcGVyY2FzZTtcclxuICAgICAgICB0YXJnZXQubG93ZXJjYXNlID0gISFvcHRzLmxvd2VyY2FzZTtcclxuXHJcbiAgICAgICAgdGFyZ2V0LnByZWZpeCA9ICh0YXJnZXQuY3JlZGl0Q2FyZCB8fCB0YXJnZXQucGhvbmUgfHwgdGFyZ2V0LmRhdGUpID8gJycgOiAob3B0cy5wcmVmaXggfHwgJycpO1xyXG5cclxuICAgICAgICB0YXJnZXQuZGVsaW1pdGVyID0gb3B0cy5kZWxpbWl0ZXIgfHwgKHRhcmdldC5kYXRlID8gJy8nIDogKHRhcmdldC5udW1lcmFsID8gJywnIDogJyAnKSk7XHJcbiAgICAgICAgdGFyZ2V0LmRlbGltaXRlclJFID0gbmV3IFJlZ0V4cCh0YXJnZXQuZGVsaW1pdGVyLCAnZycpO1xyXG5cclxuICAgICAgICB0YXJnZXQuYmxvY2tzID0gb3B0cy5ibG9ja3MgfHwgW107XHJcbiAgICAgICAgdGFyZ2V0LmJsb2Nrc0xlbmd0aCA9IHRhcmdldC5ibG9ja3MubGVuZ3RoO1xyXG5cclxuICAgICAgICB0YXJnZXQubWF4TGVuZ3RoID0gMDtcclxuXHJcbiAgICAgICAgdGFyZ2V0LmJhY2tzcGFjZSA9IGZhbHNlO1xyXG4gICAgICAgIHRhcmdldC5yZXN1bHQgPSAnJztcclxuXHJcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcclxuICAgIH1cclxufTtcclxuXHJcbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBEZWZhdWx0UHJvcGVydGllcztcclxufVxyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgQ3JlZGl0Q2FyZERldGVjdG9yID0ge1xyXG4gICAgYmxvY2tzOiB7XHJcbiAgICAgICAgdWF0cDogICAgICAgICAgWzQsIDUsIDZdLFxyXG4gICAgICAgIGFtZXg6ICAgICAgICAgIFs0LCA2LCA1XSxcclxuICAgICAgICBkaW5lcnM6ICAgICAgICBbNCwgNiwgNF0sXHJcbiAgICAgICAgZGlzY292ZXI6ICAgICAgWzQsIDQsIDQsIDRdLFxyXG4gICAgICAgIG1hc3RlcmNhcmQ6ICAgIFs0LCA0LCA0LCA0XSxcclxuICAgICAgICBkYW5rb3J0OiAgICAgICBbNCwgNCwgNCwgNF0sXHJcbiAgICAgICAgaW5zdGFwYXltZW50OiAgWzQsIDQsIDQsIDRdLFxyXG4gICAgICAgIGpjYjogICAgICAgICAgIFs0LCA0LCA0LCA0XSxcclxuICAgICAgICB2aXNhOiAgICAgICAgICBbNCwgNCwgNCwgNF0sXHJcbiAgICAgICAgZ2VuZXJhbExvb3NlOiAgWzQsIDQsIDQsIDRdLFxyXG4gICAgICAgIGdlbmVyYWxTdHJpY3Q6IFs0LCA0LCA0LCA3XVxyXG4gICAgfSxcclxuXHJcbiAgICByZToge1xyXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDE7IDE1IGRpZ2l0cywgbm90IHN0YXJ0cyB3aXRoIDE4MDAgKGpjYiBjYXJkKVxyXG4gICAgICAgIHVhdHA6IC9eKD8hMTgwMCkxXFxkezAsMTR9LyxcclxuXHJcbiAgICAgICAgLy8gc3RhcnRzIHdpdGggMzQvMzc7IDE1IGRpZ2l0c1xyXG4gICAgICAgIGFtZXg6IC9eM1s0N11cXGR7MCwxM30vLFxyXG5cclxuICAgICAgICAvLyBzdGFydHMgd2l0aCA2MDExLzY1LzY0NC02NDk7IDE2IGRpZ2l0c1xyXG4gICAgICAgIGRpc2NvdmVyOiAvXig/OjYwMTF8NjVcXGR7MCwyfXw2NFs0LTldXFxkPylcXGR7MCwxMn0vLFxyXG5cclxuICAgICAgICAvLyBzdGFydHMgd2l0aCAzMDAtMzA1LzMwOSBvciAzNi8zOC8zOTsgMTQgZGlnaXRzXHJcbiAgICAgICAgZGluZXJzOiAvXjMoPzowKFswLTVdfDkpfFs2ODldXFxkPylcXGR7MCwxMX0vLFxyXG5cclxuICAgICAgICAvLyBzdGFydHMgd2l0aCA1MS01NS8yMi0yNzsgMTYgZGlnaXRzXHJcbiAgICAgICAgbWFzdGVyY2FyZDogL14oNVsxLTVdfDJbMi03XSlcXGR7MCwxNH0vLFxyXG5cclxuICAgICAgICAvLyBzdGFydHMgd2l0aCA1MDE5LzQxNzUvNDU3MTsgMTYgZGlnaXRzXHJcbiAgICAgICAgZGFua29ydDogL14oNTAxOXw0MTc1fDQ1NzEpXFxkezAsMTJ9LyxcclxuXHJcbiAgICAgICAgLy8gc3RhcnRzIHdpdGggNjM3LTYzOTsgMTYgZGlnaXRzXHJcbiAgICAgICAgaW5zdGFwYXltZW50OiAvXjYzWzctOV1cXGR7MCwxM30vLFxyXG5cclxuICAgICAgICAvLyBzdGFydHMgd2l0aCAyMTMxLzE4MDAvMzU7IDE2IGRpZ2l0c1xyXG4gICAgICAgIGpjYjogL14oPzoyMTMxfDE4MDB8MzVcXGR7MCwyfSlcXGR7MCwxMn0vLFxyXG5cclxuICAgICAgICAvLyBzdGFydHMgd2l0aCA0OyAxNiBkaWdpdHNcclxuICAgICAgICB2aXNhOiAvXjRcXGR7MCwxNX0vXHJcbiAgICB9LFxyXG5cclxuICAgIGdldEluZm86IGZ1bmN0aW9uICh2YWx1ZSwgc3RyaWN0TW9kZSkge1xyXG4gICAgICAgIHZhciBibG9ja3MgPSBDcmVkaXRDYXJkRGV0ZWN0b3IuYmxvY2tzLFxyXG4gICAgICAgICAgICByZSA9IENyZWRpdENhcmREZXRlY3Rvci5yZTtcclxuXHJcbiAgICAgICAgLy8gSW4gdGhlb3J5LCB2aXNhIGNyZWRpdCBjYXJkIGNhbiBoYXZlIHVwIHRvIDE5IGRpZ2l0cyBudW1iZXIuXHJcbiAgICAgICAgLy8gU2V0IHN0cmljdE1vZGUgdG8gdHJ1ZSB3aWxsIHJlbW92ZSB0aGUgMTYgbWF4LWxlbmd0aCByZXN0cmFpbixcclxuICAgICAgICAvLyBob3dldmVyLCBJIG5ldmVyIGZvdW5kIGFueSB3ZWJzaXRlIHZhbGlkYXRlIGNhcmQgbnVtYmVyIGxpa2VcclxuICAgICAgICAvLyB0aGlzLCBoZW5jZSBwcm9iYWJseSB5b3UgZG9uJ3QgbmVlZCB0byBlbmFibGUgdGhpcyBvcHRpb24uXHJcbiAgICAgICAgc3RyaWN0TW9kZSA9ICEhc3RyaWN0TW9kZTtcclxuXHJcbiAgICAgICAgaWYgKHJlLmFtZXgudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICAgJ2FtZXgnLFxyXG4gICAgICAgICAgICAgICAgYmxvY2tzOiBibG9ja3MuYW1leFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSBpZiAocmUudWF0cC50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogICAndWF0cCcsXHJcbiAgICAgICAgICAgICAgICBibG9ja3M6IGJsb2Nrcy51YXRwXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIGlmIChyZS5kaW5lcnMudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICAgJ2RpbmVycycsXHJcbiAgICAgICAgICAgICAgICBibG9ja3M6IGJsb2Nrcy5kaW5lcnNcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGVsc2UgaWYgKHJlLmRpc2NvdmVyLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAgICdkaXNjb3ZlcicsXHJcbiAgICAgICAgICAgICAgICBibG9ja3M6IGJsb2Nrcy5kaXNjb3ZlclxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSBpZiAocmUubWFzdGVyY2FyZC50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogICAnbWFzdGVyY2FyZCcsXHJcbiAgICAgICAgICAgICAgICBibG9ja3M6IGJsb2Nrcy5tYXN0ZXJjYXJkXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIGlmIChyZS5kYW5rb3J0LnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAgICdkYW5rb3J0JyxcclxuICAgICAgICAgICAgICAgIGJsb2NrczogYmxvY2tzLmRhbmtvcnRcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGVsc2UgaWYgKHJlLmluc3RhcGF5bWVudC50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogICAnaW5zdGFwYXltZW50JyxcclxuICAgICAgICAgICAgICAgIGJsb2NrczogYmxvY2tzLmluc3RhcGF5bWVudFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSBpZiAocmUuamNiLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAgICdqY2InLFxyXG4gICAgICAgICAgICAgICAgYmxvY2tzOiBibG9ja3MuamNiXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIGlmIChyZS52aXNhLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAgICd2aXNhJyxcclxuICAgICAgICAgICAgICAgIGJsb2NrczogYmxvY2tzLnZpc2FcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGVsc2UgaWYgKHN0cmljdE1vZGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICAgJ3Vua25vd24nLFxyXG4gICAgICAgICAgICAgICAgYmxvY2tzOiBibG9ja3MuZ2VuZXJhbFN0cmljdFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAgICd1bmtub3duJyxcclxuICAgICAgICAgICAgICAgIGJsb2NrczogYmxvY2tzLmdlbmVyYWxMb29zZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBDcmVkaXRDYXJkRGV0ZWN0b3I7XHJcbn1cclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIERhdGVGb3JtYXR0ZXIgPSBmdW5jdGlvbiAoZGF0ZVBhdHRlcm4pIHtcclxuICAgIHZhciBvd25lciA9IHRoaXM7XHJcblxyXG4gICAgb3duZXIuYmxvY2tzID0gW107XHJcbiAgICBvd25lci5kYXRlUGF0dGVybiA9IGRhdGVQYXR0ZXJuO1xyXG4gICAgb3duZXIuaW5pdEJsb2NrcygpO1xyXG59O1xyXG5cclxuRGF0ZUZvcm1hdHRlci5wcm90b3R5cGUgPSB7XHJcbiAgICBpbml0QmxvY2tzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcztcclxuICAgICAgICBvd25lci5kYXRlUGF0dGVybi5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09ICdZJykge1xyXG4gICAgICAgICAgICAgICAgb3duZXIuYmxvY2tzLnB1c2goNCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBvd25lci5ibG9ja3MucHVzaCgyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRCbG9ja3M6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ibG9ja3M7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldFZhbGlkYXRlZERhdGU6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHJlc3VsdCA9ICcnO1xyXG5cclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL1teXFxkXS9nLCAnJyk7XHJcblxyXG4gICAgICAgIG93bmVyLmJsb2Nrcy5mb3JFYWNoKGZ1bmN0aW9uIChsZW5ndGgsIGluZGV4KSB7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3ViID0gdmFsdWUuc2xpY2UoMCwgbGVuZ3RoKSxcclxuICAgICAgICAgICAgICAgICAgICByZXN0ID0gdmFsdWUuc2xpY2UobGVuZ3RoKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKG93bmVyLmRhdGVQYXR0ZXJuW2luZGV4XSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnZCc6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnNlSW50KHN1YiwgMTApID4gMzEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3ViID0gJzMxJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdtJzpcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyc2VJbnQoc3ViLCAxMCkgPiAxMikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWIgPSAnMTInO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gc3ViO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSByZW1haW5pbmcgc3RyaW5nXHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHJlc3Q7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxufTtcclxuXHJcbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBEYXRlRm9ybWF0dGVyO1xyXG59XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBOdW1lcmFsRm9ybWF0dGVyID0gZnVuY3Rpb24gKG51bWVyYWxEZWNpbWFsTWFyayxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtZXJhbERlY2ltYWxTY2FsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtZXJhbFRob3VzYW5kc0dyb3VwU3R5bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGltaXRlcixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlZml4KSB7XHJcbiAgICB2YXIgb3duZXIgPSB0aGlzO1xyXG5cclxuICAgIG93bmVyLm51bWVyYWxEZWNpbWFsTWFyayA9IG51bWVyYWxEZWNpbWFsTWFyayB8fCAnLic7XHJcbiAgICBvd25lci5udW1lcmFsRGVjaW1hbFNjYWxlID0gbnVtZXJhbERlY2ltYWxTY2FsZSB8fCAyO1xyXG4gICAgb3duZXIubnVtZXJhbFRob3VzYW5kc0dyb3VwU3R5bGUgPSBudW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSB8fCBOdW1lcmFsRm9ybWF0dGVyLmdyb3VwU3R5bGUudGhvdXNhbmQ7XHJcbiAgICBvd25lci5kZWxpbWl0ZXIgPSBkZWxpbWl0ZXIgfHwgJywnO1xyXG4gICAgb3duZXIucHJlZml4ID0gcHJlZml4O1xyXG59O1xyXG5cclxuTnVtZXJhbEZvcm1hdHRlci5ncm91cFN0eWxlID0ge1xyXG4gICAgdGhvdXNhbmQ6ICd0aG91c2FuZCcsXHJcbiAgICBsYWtoOiAgICAgJ2xha2gnLFxyXG4gICAgd2FuOiAgICAgICd3YW4nXHJcbn07XHJcblxyXG5OdW1lcmFsRm9ybWF0dGVyLnByb3RvdHlwZSA9IHtcclxuICAgIGZvcm1hdDogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcGFydHMsIHBhcnRJbnRlZ2VyLCBwYXJ0RGVjaW1hbCA9ICcnO1xyXG4gICAgICAgIHZhciBwcmVmaXhSZWdFeHAgPSBuZXcgUmVnRXhwKCdbXlxcXFxkTScgKyBvd25lci5wcmVmaXggKyAnXScsICdnJyk7XHJcblxyXG4gICAgICAgIC8vIHN0cmlwIGFscGhhYmV0IGxldHRlcnNcclxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL1tBLVphLXpdL2csICcnKVxyXG5cclxuICAgICAgICAgICAgLy8gcmVwbGFjZSB0aGUgZmlyc3QgZGVjaW1hbCBtYXJrIHdpdGggcmVzZXJ2ZWQgcGxhY2Vob2xkZXJcclxuICAgICAgICAgICAgLnJlcGxhY2Uob3duZXIubnVtZXJhbERlY2ltYWxNYXJrLCAnTScpXHJcblxyXG4gICAgICAgICAgICAvLyBzdHJpcCB0aGUgbm9uIG51bWVyaWMgbGV0dGVycyBleGNlcHQgTVxyXG4gICAgICAgICAgICAucmVwbGFjZShwcmVmaXhSZWdFeHAsICcnKVxyXG5cclxuICAgICAgICAgICAgLy8gcmVwbGFjZSBtYXJrXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKCdNJywgb3duZXIubnVtZXJhbERlY2ltYWxNYXJrKVxyXG5cclxuICAgICAgICAgICAgLy8gc3RyaXAgbGVhZGluZyAwXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC9eKC0pPzArKD89XFxkKS8sICckMScpO1xyXG5cclxuICAgICAgICBwYXJ0SW50ZWdlciA9IHZhbHVlO1xyXG5cclxuICAgICAgICBpZiAodmFsdWUuaW5kZXhPZihvd25lci5udW1lcmFsRGVjaW1hbE1hcmspID49IDApIHtcclxuICAgICAgICAgICAgcGFydHMgPSB2YWx1ZS5zcGxpdChvd25lci5udW1lcmFsRGVjaW1hbE1hcmspO1xyXG4gICAgICAgICAgICBwYXJ0SW50ZWdlciA9IHBhcnRzWzBdO1xyXG4gICAgICAgICAgICBwYXJ0RGVjaW1hbCA9IG93bmVyLm51bWVyYWxEZWNpbWFsTWFyayArIHBhcnRzWzFdLnNsaWNlKDAsIG93bmVyLm51bWVyYWxEZWNpbWFsU2NhbGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3dpdGNoIChvd25lci5udW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSkge1xyXG4gICAgICAgIGNhc2UgTnVtZXJhbEZvcm1hdHRlci5ncm91cFN0eWxlLmxha2g6XHJcbiAgICAgICAgICAgIHBhcnRJbnRlZ2VyID0gcGFydEludGVnZXIucmVwbGFjZSgvKFxcZCkoPz0oXFxkXFxkKStcXGQkKS9nLCAnJDEnICsgb3duZXIuZGVsaW1pdGVyKTtcclxuXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIE51bWVyYWxGb3JtYXR0ZXIuZ3JvdXBTdHlsZS53YW46XHJcbiAgICAgICAgICAgIHBhcnRJbnRlZ2VyID0gcGFydEludGVnZXIucmVwbGFjZSgvKFxcZCkoPz0oXFxkezR9KSskKS9nLCAnJDEnICsgb3duZXIuZGVsaW1pdGVyKTtcclxuXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICBwYXJ0SW50ZWdlciA9IHBhcnRJbnRlZ2VyLnJlcGxhY2UoLyhcXGQpKD89KFxcZHszfSkrJCkvZywgJyQxJyArIG93bmVyLmRlbGltaXRlcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcGFydEludGVnZXIudG9TdHJpbmcoKSArIHBhcnREZWNpbWFsLnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gTnVtZXJhbEZvcm1hdHRlcjtcclxufVxyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgUGhvbmVGb3JtYXR0ZXIgPSBmdW5jdGlvbiAoZm9ybWF0dGVyLCBkZWxpbWl0ZXIpIHtcclxuICAgIHZhciBvd25lciA9IHRoaXM7XHJcblxyXG4gICAgb3duZXIuZGVsaW1pdGVyID0gZGVsaW1pdGVyIHx8ICcgJztcclxuICAgIG93bmVyLmRlbGltaXRlclJFID0gbmV3IFJlZ0V4cChvd25lci5kZWxpbWl0ZXIsICdnJyk7XHJcbiAgICBvd25lci5mb3JtYXR0ZXIgPSBmb3JtYXR0ZXI7XHJcbn07XHJcblxyXG5QaG9uZUZvcm1hdHRlci5wcm90b3R5cGUgPSB7XHJcbiAgICBzZXRGb3JtYXR0ZXI6IGZ1bmN0aW9uIChmb3JtYXR0ZXIpIHtcclxuICAgICAgICB0aGlzLmZvcm1hdHRlciA9IGZvcm1hdHRlcjtcclxuICAgIH0sXHJcblxyXG4gICAgZm9ybWF0OiBmdW5jdGlvbiAocGhvbmVOdW1iZXIpIHtcclxuICAgICAgICB2YXIgb3duZXIgPSB0aGlzO1xyXG5cclxuICAgICAgICBvd25lci5mb3JtYXR0ZXIuY2xlYXIoKTtcclxuXHJcbiAgICAgICAgLy8gb25seSBrZWVwIG51bWJlciBhbmQgK1xyXG4gICAgICAgIHBob25lTnVtYmVyID0gcGhvbmVOdW1iZXIucmVwbGFjZSgvW15cXGQrXS9nLCAnJyk7XHJcblxyXG4gICAgICAgIC8vIHN0cmlwIGRlbGltaXRlclxyXG4gICAgICAgIHBob25lTnVtYmVyID0gcGhvbmVOdW1iZXIucmVwbGFjZShvd25lci5kZWxpbWl0ZXJSRSwgJycpO1xyXG5cclxuICAgICAgICB2YXIgcmVzdWx0ID0gJycsIGN1cnJlbnQsIHZhbGlkYXRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgaU1heCA9IHBob25lTnVtYmVyLmxlbmd0aDsgaSA8IGlNYXg7IGkrKykge1xyXG4gICAgICAgICAgICBjdXJyZW50ID0gb3duZXIuZm9ybWF0dGVyLmlucHV0RGlnaXQocGhvbmVOdW1iZXIuY2hhckF0KGkpKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGhhcyAoKS0gb3Igc3BhY2UgaW5zaWRlXHJcbiAgICAgICAgICAgIGlmICgvW1xccygpLV0vZy50ZXN0KGN1cnJlbnQpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBjdXJyZW50O1xyXG5cclxuICAgICAgICAgICAgICAgIHZhbGlkYXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXZhbGlkYXRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGN1cnJlbnQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBlbHNlOiBvdmVyIGxlbmd0aCBpbnB1dFxyXG4gICAgICAgICAgICAgICAgLy8gaXQgdHVybnMgdG8gaW52YWxpZCBudW1iZXIgYWdhaW5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gc3RyaXAgKClcclxuICAgICAgICAvLyBlLmcuIFVTOiA3MTYxMjM0NTY3IHJldHVybnMgKDcxNikgMTIzLTQ1NjdcclxuICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZSgvWygpXS9nLCAnJyk7XHJcbiAgICAgICAgLy8gcmVwbGFjZSBsaWJyYXJ5IGRlbGltaXRlciB3aXRoIHVzZXIgY3VzdG9taXplZCBkZWxpbWl0ZXJcclxuICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZSgvW1xccy1dL2csIG93bmVyLmRlbGltaXRlcik7XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbn07XHJcblxyXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gUGhvbmVGb3JtYXR0ZXI7XHJcbn1cclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIFV0aWwgPSB7XHJcbiAgICBub29wOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB9LFxyXG5cclxuICAgIHN0cmlwOiBmdW5jdGlvbiAodmFsdWUsIHJlKSB7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UocmUsICcnKTtcclxuICAgIH0sXHJcblxyXG4gICAgaGVhZFN0cjogZnVuY3Rpb24gKHN0ciwgbGVuZ3RoKSB7XHJcbiAgICAgICAgcmV0dXJuIHN0ci5zbGljZSgwLCBsZW5ndGgpO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRNYXhMZW5ndGg6IGZ1bmN0aW9uIChibG9ja3MpIHtcclxuICAgICAgICByZXR1cm4gYmxvY2tzLnJlZHVjZShmdW5jdGlvbiAocHJldmlvdXMsIGN1cnJlbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHByZXZpb3VzICsgY3VycmVudDtcclxuICAgICAgICB9LCAwKTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0UHJlZml4QXBwbGllZFZhbHVlOiBmdW5jdGlvbiAodmFsdWUsIHByZWZpeCkge1xyXG4gICAgICAgIHZhciBwcmVmaXhMZW5ndGggPSBwcmVmaXgubGVuZ3RoLFxyXG4gICAgICAgICAgICBwcmVmaXhMZW5ndGhWYWx1ZTtcclxuXHJcbiAgICAgICAgaWYgKHByZWZpeExlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcmVmaXhMZW5ndGhWYWx1ZSA9IHZhbHVlLnNsaWNlKDAsIHByZWZpeExlbmd0aCk7XHJcblxyXG4gICAgICAgIGlmIChwcmVmaXhMZW5ndGhWYWx1ZS5sZW5ndGggPCBwcmVmaXhMZW5ndGgpIHtcclxuICAgICAgICAgICAgdmFsdWUgPSBwcmVmaXg7XHJcbiAgICAgICAgfSBlbHNlIGlmIChwcmVmaXhMZW5ndGhWYWx1ZSAhPT0gcHJlZml4KSB7XHJcbiAgICAgICAgICAgIHZhbHVlID0gcHJlZml4ICsgdmFsdWUuc2xpY2UocHJlZml4TGVuZ3RoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0Rm9ybWF0dGVkVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSwgYmxvY2tzLCBibG9ja3NMZW5ndGgsIGRlbGltaXRlcikge1xyXG4gICAgICAgIHZhciByZXN1bHQgPSAnJztcclxuXHJcbiAgICAgICAgYmxvY2tzLmZvckVhY2goZnVuY3Rpb24gKGxlbmd0aCwgaW5kZXgpIHtcclxuICAgICAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHZhciBzdWIgPSB2YWx1ZS5zbGljZSgwLCBsZW5ndGgpLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3QgPSB2YWx1ZS5zbGljZShsZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBzdWI7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHN1Yi5sZW5ndGggPT09IGxlbmd0aCAmJiBpbmRleCA8IGJsb2Nrc0xlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgKz0gZGVsaW1pdGVyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSByZW1haW5pbmcgc3RyaW5nXHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHJlc3Q7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIChyZXN1bHQgIT09ICcnKSA/IHJlc3VsdCA6IHZhbHVlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcclxuICAgIG1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IFV0aWw7XHJcbn1cclxuIl19
