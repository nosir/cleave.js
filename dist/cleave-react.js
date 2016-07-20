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
        value = Util.getPrefixStrippedValue(value, pps.prefix);

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
    getPrefixStrippedValue: function getPrefixStrippedValue(value, prefix) {
        var escapedPrefix = this.getRegexpEscapedString(prefix);
        var pattern = new RegExp('^(' + escapedPrefix + ')+|$', 'g');

        return value.replace(pattern, '');
    },

    getRegexpEscapedString: function getRegexpEscapedString(str) {
        return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZWFjdC5qcyIsInNyY1xcc3JjXFxDbGVhdmUucmVhY3QuanMiLCJzcmNcXGNvbW1vblxcRGVmYXVsdFByb3BlcnRpZXMuanMiLCJzcmNcXHNob3J0Y3V0c1xcQ3JlZGl0Q2FyZERldGVjdG9yLmpzIiwic3JjXFxzaG9ydGN1dHNcXERhdGVGb3JtYXR0ZXIuanMiLCJzcmNcXHNob3J0Y3V0c1xcTnVtZXJhbEZvcm1hdHRlci5qcyIsInNyY1xcc2hvcnRjdXRzXFxQaG9uZUZvcm1hdHRlci5qcyIsInNyY1xcdXRpbHNcXFV0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQTs7Ozs7Ozs7OztBQ0FBOzs7Ozs7QUFFQSxJQUFJLFFBQVEsUUFBUSxPQUFSLENBQVo7O0FBRUEsSUFBSSxtQkFBbUIsUUFBUSw4QkFBUixDQUF2QjtBQUNBLElBQUksZ0JBQWdCLFFBQVEsMkJBQVIsQ0FBcEI7QUFDQSxJQUFJLGlCQUFpQixRQUFRLDRCQUFSLENBQXJCO0FBQ0EsSUFBSSxxQkFBcUIsUUFBUSxnQ0FBUixDQUF6QjtBQUNBLElBQUksT0FBTyxRQUFRLGNBQVIsQ0FBWDtBQUNBLElBQUksb0JBQW9CLFFBQVEsNEJBQVIsQ0FBeEI7O0FBRUEsSUFBSSxTQUFTLE1BQU0sV0FBTixDQUFrQjtBQUFBOztBQUMzQix1QkFBbUIsNkJBQVk7QUFDM0IsYUFBSyxJQUFMO0FBQ0gsS0FIMEI7O0FBSzNCLCtCQUEyQixtQ0FBVSxTQUFWLEVBQXFCO0FBQzVDLFlBQUksUUFBUSxJQUFaO0FBQUEsWUFDSSxrQkFBa0IsVUFBVSxPQUFWLENBQWtCLGVBRHhDO0FBQUEsWUFFSSxXQUFXLFVBQVUsS0FGekI7O0FBSUEsWUFBSSxRQUFKLEVBQWM7QUFDVixrQkFBTSxPQUFOLENBQWMsUUFBZDtBQUNIOztBQUVEO0FBQ0EsWUFBSSxtQkFBbUIsb0JBQW9CLE1BQU0sVUFBTixDQUFpQixl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VUFBVSxJQUEzQjtBQUNIIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBDbGVhdmUgZnJvbSAnLi9zcmMvQ2xlYXZlLnJlYWN0JztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IENsZWF2ZTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcclxuXHJcbnZhciBOdW1lcmFsRm9ybWF0dGVyID0gcmVxdWlyZSgnLi9zaG9ydGN1dHMvTnVtZXJhbEZvcm1hdHRlcicpO1xyXG52YXIgRGF0ZUZvcm1hdHRlciA9IHJlcXVpcmUoJy4vc2hvcnRjdXRzL0RhdGVGb3JtYXR0ZXInKTtcclxudmFyIFBob25lRm9ybWF0dGVyID0gcmVxdWlyZSgnLi9zaG9ydGN1dHMvUGhvbmVGb3JtYXR0ZXInKTtcclxudmFyIENyZWRpdENhcmREZXRlY3RvciA9IHJlcXVpcmUoJy4vc2hvcnRjdXRzL0NyZWRpdENhcmREZXRlY3RvcicpO1xyXG52YXIgVXRpbCA9IHJlcXVpcmUoJy4vdXRpbHMvVXRpbCcpO1xyXG52YXIgRGVmYXVsdFByb3BlcnRpZXMgPSByZXF1aXJlKCcuL2NvbW1vbi9EZWZhdWx0UHJvcGVydGllcycpO1xyXG5cclxudmFyIENsZWF2ZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcclxuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXh0UHJvcHMpIHtcclxuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxyXG4gICAgICAgICAgICBwaG9uZVJlZ2lvbkNvZGUgPSBuZXh0UHJvcHMub3B0aW9ucy5waG9uZVJlZ2lvbkNvZGUsXHJcbiAgICAgICAgICAgIG5ld1ZhbHVlID0gbmV4dFByb3BzLnZhbHVlO1xyXG5cclxuICAgICAgICBpZiAobmV3VmFsdWUpIHtcclxuICAgICAgICAgICAgb3duZXIub25JbnB1dChuZXdWYWx1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyB1cGRhdGUgcGhvbmUgcmVnaW9uIGNvZGVcclxuICAgICAgICBpZiAocGhvbmVSZWdpb25Db2RlICYmIHBob25lUmVnaW9uQ29kZSAhPT0gb3duZXIucHJvcGVydGllcy5waG9uZVJlZ2lvbkNvZGUpIHtcclxuICAgICAgICAgICAgb3duZXIucHJvcGVydGllcy5waG9uZVJlZ2lvbkNvZGUgPSBwaG9uZVJlZ2lvbkNvZGU7XHJcbiAgICAgICAgICAgIG93bmVyLmluaXRQaG9uZUZvcm1hdHRlcigpO1xyXG4gICAgICAgICAgICBvd25lci5vbklucHV0KG93bmVyLnByb3BlcnRpZXMucmVzdWx0KTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXHJcbiAgICAgICAgICAgIHsgdmFsdWUsIG9wdGlvbnMsIG9uS2V5RG93biwgb25DaGFuZ2UsIC4uLm90aGVyIH0gPSBvd25lci5wcm9wcztcclxuXHJcbiAgICAgICAgb3duZXIucmVnaXN0ZXJlZEV2ZW50cyA9IHtcclxuICAgICAgICAgICAgb25DaGFuZ2U6ICBvbkNoYW5nZSB8fCBVdGlsLm5vb3AsXHJcbiAgICAgICAgICAgIG9uS2V5RG93bjogb25LZXlEb3duIHx8IFV0aWwubm9vcFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIG9wdGlvbnMuaW5pdFZhbHVlID0gdmFsdWU7XHJcblxyXG4gICAgICAgIG93bmVyLnByb3BlcnRpZXMgPSBEZWZhdWx0UHJvcGVydGllcy5hc3NpZ24oe30sIG9wdGlvbnMpO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBvdGhlcjogb3RoZXIsXHJcbiAgICAgICAgICAgIHZhbHVlOiBvd25lci5wcm9wZXJ0aWVzLnJlc3VsdFxyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG5cclxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxyXG4gICAgICAgICAgICBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xyXG5cclxuICAgICAgICAvLyBzbyBubyBuZWVkIGZvciB0aGlzIGxpYiBhdCBhbGxcclxuICAgICAgICBpZiAoIXBwcy5udW1lcmFsICYmICFwcHMucGhvbmUgJiYgIXBwcy5jcmVkaXRDYXJkICYmICFwcHMuZGF0ZSAmJiAocHBzLmJsb2Nrc0xlbmd0aCA9PT0gMCAmJiAhcHBzLnByZWZpeCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHBzLm1heExlbmd0aCA9IFV0aWwuZ2V0TWF4TGVuZ3RoKHBwcy5ibG9ja3MpO1xyXG5cclxuICAgICAgICBvd25lci5pbml0UGhvbmVGb3JtYXR0ZXIoKTtcclxuICAgICAgICBvd25lci5pbml0RGF0ZUZvcm1hdHRlcigpO1xyXG4gICAgICAgIG93bmVyLmluaXROdW1lcmFsRm9ybWF0dGVyKCk7XHJcblxyXG4gICAgICAgIG93bmVyLm9uSW5wdXQocHBzLmluaXRWYWx1ZSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGluaXROdW1lcmFsRm9ybWF0dGVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcclxuICAgICAgICAgICAgcHBzID0gb3duZXIucHJvcGVydGllcztcclxuXHJcbiAgICAgICAgaWYgKCFwcHMubnVtZXJhbCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcHMubnVtZXJhbEZvcm1hdHRlciA9IG5ldyBOdW1lcmFsRm9ybWF0dGVyKFxyXG4gICAgICAgICAgICBwcHMubnVtZXJhbERlY2ltYWxNYXJrLFxyXG4gICAgICAgICAgICBwcHMubnVtZXJhbERlY2ltYWxTY2FsZSxcclxuICAgICAgICAgICAgcHBzLm51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlLFxyXG4gICAgICAgICAgICBwcHMuZGVsaW1pdGVyXHJcbiAgICAgICAgKTtcclxuICAgIH0sXHJcblxyXG4gICAgaW5pdERhdGVGb3JtYXR0ZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxyXG4gICAgICAgICAgICBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xyXG5cclxuICAgICAgICBpZiAoIXBwcy5kYXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBwcy5kYXRlRm9ybWF0dGVyID0gbmV3IERhdGVGb3JtYXR0ZXIocHBzLmRhdGVQYXR0ZXJuKTtcclxuICAgICAgICBwcHMuYmxvY2tzID0gcHBzLmRhdGVGb3JtYXR0ZXIuZ2V0QmxvY2tzKCk7XHJcbiAgICAgICAgcHBzLmJsb2Nrc0xlbmd0aCA9IHBwcy5ibG9ja3MubGVuZ3RoO1xyXG4gICAgICAgIHBwcy5tYXhMZW5ndGggPSBVdGlsLmdldE1heExlbmd0aChwcHMuYmxvY2tzKTtcclxuICAgIH0sXHJcblxyXG4gICAgaW5pdFBob25lRm9ybWF0dGVyOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcclxuICAgICAgICAgICAgcHBzID0gb3duZXIucHJvcGVydGllcztcclxuXHJcbiAgICAgICAgaWYgKCFwcHMucGhvbmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQ2xlYXZlLkFzWW91VHlwZUZvcm1hdHRlciBzaG91bGQgYmUgcHJvdmlkZWQgYnlcclxuICAgICAgICAvLyBleHRlcm5hbCBnb29nbGUgY2xvc3VyZSBsaWJcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBwcHMucGhvbmVGb3JtYXR0ZXIgPSBuZXcgUGhvbmVGb3JtYXR0ZXIoXHJcbiAgICAgICAgICAgICAgICBuZXcgd2luZG93LkNsZWF2ZS5Bc1lvdVR5cGVGb3JtYXR0ZXIocHBzLnBob25lUmVnaW9uQ29kZSksXHJcbiAgICAgICAgICAgICAgICBwcHMuZGVsaW1pdGVyXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXgpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQbGVhc2UgaW5jbHVkZSBwaG9uZS10eXBlLWZvcm1hdHRlci57Y291bnRyeX0uanMgbGliJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBvbktleURvd246IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXHJcbiAgICAgICAgICAgIHBwcyA9IG93bmVyLnByb3BlcnRpZXMsXHJcbiAgICAgICAgICAgIGNoYXJDb2RlID0gZXZlbnQud2hpY2ggfHwgZXZlbnQua2V5Q29kZTtcclxuXHJcbiAgICAgICAgLy8gaGl0IGJhY2tzcGFjZSB3aGVuIGxhc3QgY2hhcmFjdGVyIGlzIGRlbGltaXRlclxyXG4gICAgICAgIGlmIChjaGFyQ29kZSA9PT0gOCAmJiBwcHMucmVzdWx0LnNsaWNlKC0xKSA9PT0gcHBzLmRlbGltaXRlcikge1xyXG4gICAgICAgICAgICBwcHMuYmFja3NwYWNlID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBwcHMuYmFja3NwYWNlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBvd25lci5yZWdpc3RlcmVkRXZlbnRzLm9uS2V5RG93bihldmVudCk7XHJcbiAgICB9LFxyXG5cclxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xyXG5cclxuICAgICAgICBvd25lci5vbklucHV0KGV2ZW50LnRhcmdldC52YWx1ZSk7XHJcblxyXG4gICAgICAgIGlmIChwcHMubnVtZXJhbCkge1xyXG4gICAgICAgICAgICBldmVudC50YXJnZXQucmF3VmFsdWUgPSBwcHMubnVtZXJhbEZvcm1hdHRlci5nZXRSYXdWYWx1ZShwcHMucmVzdWx0KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBldmVudC50YXJnZXQucmF3VmFsdWUgPSBVdGlsLnN0cmlwKHBwcy5yZXN1bHQsIHBwcy5kZWxpbWl0ZXJSRSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBvd25lci5yZWdpc3RlcmVkRXZlbnRzLm9uQ2hhbmdlKGV2ZW50KTtcclxuICAgIH0sXHJcblxyXG4gICAgb25JbnB1dDogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcHBzID0gb3duZXIucHJvcGVydGllcyxcclxuICAgICAgICAgICAgcHJldiA9IHBwcy5yZXN1bHQ7XHJcblxyXG4gICAgICAgIC8vIGNhc2UgMTogZGVsZXRlIG9uZSBtb3JlIGNoYXJhY3RlciBcIjRcIlxyXG4gICAgICAgIC8vIDEyMzQqfCAtPiBoaXQgYmFja3NwYWNlIC0+IDEyM3xcclxuICAgICAgICAvLyBjYXNlIDI6IGxhc3QgY2hhcmFjdGVyIGlzIG5vdCBkZWxpbWl0ZXIgd2hpY2ggaXM6XHJcbiAgICAgICAgLy8gMTJ8MzQqIC0+IGhpdCBiYWNrc3BhY2UgLT4gMXwzNCpcclxuXHJcbiAgICAgICAgaWYgKCFwcHMubnVtZXJhbCAmJiBwcHMuYmFja3NwYWNlICYmIHZhbHVlLnNsaWNlKC0xKSAhPT0gcHBzLmRlbGltaXRlcikge1xyXG4gICAgICAgICAgICB2YWx1ZSA9IFV0aWwuaGVhZFN0cih2YWx1ZSwgdmFsdWUubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBwaG9uZSBmb3JtYXR0ZXJcclxuICAgICAgICBpZiAocHBzLnBob25lKSB7XHJcbiAgICAgICAgICAgIHBwcy5yZXN1bHQgPSBwcHMucGhvbmVGb3JtYXR0ZXIuZm9ybWF0KHZhbHVlKTtcclxuICAgICAgICAgICAgb3duZXIudXBkYXRlVmFsdWVTdGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gbnVtZXJhbCBmb3JtYXR0ZXJcclxuICAgICAgICBpZiAocHBzLm51bWVyYWwpIHtcclxuICAgICAgICAgICAgcHBzLnJlc3VsdCA9IHBwcy5wcmVmaXggKyBwcHMubnVtZXJhbEZvcm1hdHRlci5mb3JtYXQodmFsdWUpO1xyXG4gICAgICAgICAgICBvd25lci51cGRhdGVWYWx1ZVN0YXRlKCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBkYXRlXHJcbiAgICAgICAgaWYgKHBwcy5kYXRlKSB7XHJcbiAgICAgICAgICAgIHZhbHVlID0gcHBzLmRhdGVGb3JtYXR0ZXIuZ2V0VmFsaWRhdGVkRGF0ZSh2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBzdHJpcCBkZWxpbWl0ZXJzXHJcbiAgICAgICAgdmFsdWUgPSBVdGlsLnN0cmlwKHZhbHVlLCBwcHMuZGVsaW1pdGVyUkUpO1xyXG5cclxuICAgICAgICAvLyBzdHJpcCBwcmVmaXhcclxuICAgICAgICB2YWx1ZSA9IFV0aWwuZ2V0UHJlZml4U3RyaXBwZWRWYWx1ZSh2YWx1ZSwgcHBzLnByZWZpeCk7XHJcblxyXG4gICAgICAgIC8vIHN0cmlwIG5vbi1udW1lcmljIGNoYXJhY3RlcnNcclxuICAgICAgICB2YWx1ZSA9IHBwcy5udW1lcmljT25seSA/IFV0aWwuc3RyaXAodmFsdWUsIC9bXlxcZF0vZykgOiB2YWx1ZTtcclxuXHJcbiAgICAgICAgLy8gY29udmVydCBjYXNlXHJcbiAgICAgICAgdmFsdWUgPSBwcHMudXBwZXJjYXNlID8gdmFsdWUudG9VcHBlckNhc2UoKSA6IHZhbHVlO1xyXG4gICAgICAgIHZhbHVlID0gcHBzLmxvd2VyY2FzZSA/IHZhbHVlLnRvTG93ZXJDYXNlKCkgOiB2YWx1ZTtcclxuXHJcbiAgICAgICAgLy8gcHJlZml4XHJcbiAgICAgICAgaWYgKHBwcy5wcmVmaXgpIHtcclxuICAgICAgICAgICAgdmFsdWUgPSBwcHMucHJlZml4ICsgdmFsdWU7XHJcblxyXG4gICAgICAgICAgICAvLyBubyBibG9ja3Mgc3BlY2lmaWVkLCBubyBuZWVkIHRvIGRvIGZvcm1hdHRpbmdcclxuICAgICAgICAgICAgaWYgKHBwcy5ibG9ja3NMZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHBwcy5yZXN1bHQgPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIG93bmVyLnVwZGF0ZVZhbHVlU3RhdGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBjcmVkaXQgY2FyZCBwcm9wc1xyXG4gICAgICAgIGlmIChwcHMuY3JlZGl0Q2FyZCkge1xyXG4gICAgICAgICAgICBvd25lci51cGRhdGVDcmVkaXRDYXJkUHJvcHNCeVZhbHVlKHZhbHVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHN0cmlwIG92ZXIgbGVuZ3RoIGNoYXJhY3RlcnNcclxuICAgICAgICB2YWx1ZSA9IFV0aWwuaGVhZFN0cih2YWx1ZSwgcHBzLm1heExlbmd0aCk7XHJcblxyXG4gICAgICAgIC8vIGFwcGx5IGJsb2Nrc1xyXG4gICAgICAgIHBwcy5yZXN1bHQgPSBVdGlsLmdldEZvcm1hdHRlZFZhbHVlKHZhbHVlLCBwcHMuYmxvY2tzLCBwcHMuYmxvY2tzTGVuZ3RoLCBwcHMuZGVsaW1pdGVyKTtcclxuXHJcbiAgICAgICAgLy8gbm90aGluZyBjaGFuZ2VkXHJcbiAgICAgICAgLy8gcHJldmVudCB1cGRhdGUgdmFsdWUgdG8gYXZvaWQgY2FyZXQgcG9zaXRpb24gY2hhbmdlXHJcbiAgICAgICAgaWYgKHByZXYgPT09IHBwcy5yZXN1bHQgJiYgcHJldiAhPT0gcHBzLnByZWZpeCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBvd25lci51cGRhdGVWYWx1ZVN0YXRlKCk7XHJcbiAgICB9LFxyXG5cclxuICAgIHVwZGF0ZUNyZWRpdENhcmRQcm9wc0J5VmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHBwcyA9IG93bmVyLnByb3BlcnRpZXMsXHJcbiAgICAgICAgICAgIGNyZWRpdENhcmRJbmZvO1xyXG5cclxuICAgICAgICAvLyBBdCBsZWFzdCBvbmUgb2YgdGhlIGZpcnN0IDQgY2hhcmFjdGVycyBoYXMgY2hhbmdlZFxyXG4gICAgICAgIGlmIChVdGlsLmhlYWRTdHIocHBzLnJlc3VsdCwgNCkgPT09IFV0aWwuaGVhZFN0cih2YWx1ZSwgNCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY3JlZGl0Q2FyZEluZm8gPSBDcmVkaXRDYXJkRGV0ZWN0b3IuZ2V0SW5mbyh2YWx1ZSwgcHBzLmNyZWRpdENhcmRTdHJpY3RNb2RlKTtcclxuXHJcbiAgICAgICAgcHBzLmJsb2NrcyA9IGNyZWRpdENhcmRJbmZvLmJsb2NrcztcclxuICAgICAgICBwcHMuYmxvY2tzTGVuZ3RoID0gcHBzLmJsb2Nrcy5sZW5ndGg7XHJcbiAgICAgICAgcHBzLm1heExlbmd0aCA9IFV0aWwuZ2V0TWF4TGVuZ3RoKHBwcy5ibG9ja3MpO1xyXG5cclxuICAgICAgICAvLyBjcmVkaXQgY2FyZCB0eXBlIGNoYW5nZWRcclxuICAgICAgICBpZiAocHBzLmNyZWRpdENhcmRUeXBlICE9PSBjcmVkaXRDYXJkSW5mby50eXBlKSB7XHJcbiAgICAgICAgICAgIHBwcy5jcmVkaXRDYXJkVHlwZSA9IGNyZWRpdENhcmRJbmZvLnR5cGU7XHJcblxyXG4gICAgICAgICAgICBwcHMub25DcmVkaXRDYXJkVHlwZUNoYW5nZWQuY2FsbChvd25lciwgcHBzLmNyZWRpdENhcmRUeXBlKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHVwZGF0ZVZhbHVlU3RhdGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnNldFN0YXRlKHt2YWx1ZTogdGhpcy5wcm9wZXJ0aWVzLnJlc3VsdH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICByZW5kZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgb3duZXIgPSB0aGlzO1xyXG5cclxuICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiB7Li4ub3duZXIuc3RhdGUub3RoZXJ9XHJcbiAgICAgICAgICAgICAgICAgICB2YWx1ZT17b3duZXIuc3RhdGUudmFsdWV9XHJcbiAgICAgICAgICAgICAgICAgICBvbktleURvd249e293bmVyLm9uS2V5RG93bn1cclxuICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtvd25lci5vbkNoYW5nZX0vPlxyXG4gICAgICAgICk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cuQ2xlYXZlID0gQ2xlYXZlO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG4vKipcclxuICogUHJvcHMgQXNzaWdubWVudFxyXG4gKlxyXG4gKiBTZXBhcmF0ZSB0aGlzLCBzbyByZWFjdCBtb2R1bGUgY2FuIHNoYXJlIHRoZSB1c2FnZVxyXG4gKi9cclxudmFyIERlZmF1bHRQcm9wZXJ0aWVzID0ge1xyXG4gICAgLy8gTWF5YmUgY2hhbmdlIHRvIG9iamVjdC1hc3NpZ25cclxuICAgIC8vIGZvciBub3cganVzdCBrZWVwIGl0IGFzIHNpbXBsZVxyXG4gICAgYXNzaWduOiBmdW5jdGlvbiAodGFyZ2V0LCBvcHRzKSB7XHJcbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0IHx8IHt9O1xyXG4gICAgICAgIG9wdHMgPSBvcHRzIHx8IHt9O1xyXG5cclxuICAgICAgICAvLyBjcmVkaXQgY2FyZFxyXG4gICAgICAgIHRhcmdldC5jcmVkaXRDYXJkID0gISFvcHRzLmNyZWRpdENhcmQ7XHJcbiAgICAgICAgdGFyZ2V0LmNyZWRpdENhcmRTdHJpY3RNb2RlID0gISFvcHRzLmNyZWRpdENhcmRTdHJpY3RNb2RlO1xyXG4gICAgICAgIHRhcmdldC5jcmVkaXRDYXJkVHlwZSA9ICcnO1xyXG4gICAgICAgIHRhcmdldC5vbkNyZWRpdENhcmRUeXBlQ2hhbmdlZCA9IG9wdHMub25DcmVkaXRDYXJkVHlwZUNoYW5nZWQgfHwgKGZ1bmN0aW9uICgpIHt9KTtcclxuXHJcbiAgICAgICAgLy8gcGhvbmVcclxuICAgICAgICB0YXJnZXQucGhvbmUgPSAhIW9wdHMucGhvbmU7XHJcbiAgICAgICAgdGFyZ2V0LnBob25lUmVnaW9uQ29kZSA9IG9wdHMucGhvbmVSZWdpb25Db2RlIHx8ICdBVSc7XHJcbiAgICAgICAgdGFyZ2V0LnBob25lRm9ybWF0dGVyID0ge307XHJcblxyXG4gICAgICAgIC8vIGRhdGVcclxuICAgICAgICB0YXJnZXQuZGF0ZSA9ICEhb3B0cy5kYXRlO1xyXG4gICAgICAgIHRhcmdldC5kYXRlUGF0dGVybiA9IG9wdHMuZGF0ZVBhdHRlcm4gfHwgWydkJywgJ20nLCAnWSddO1xyXG4gICAgICAgIHRhcmdldC5kYXRlRm9ybWF0dGVyID0ge307XHJcblxyXG4gICAgICAgIC8vIG51bWVyYWxcclxuICAgICAgICB0YXJnZXQubnVtZXJhbCA9ICEhb3B0cy5udW1lcmFsO1xyXG4gICAgICAgIHRhcmdldC5udW1lcmFsRGVjaW1hbFNjYWxlID0gb3B0cy5udW1lcmFsRGVjaW1hbFNjYWxlIHx8IDI7XHJcbiAgICAgICAgdGFyZ2V0Lm51bWVyYWxEZWNpbWFsTWFyayA9IG9wdHMubnVtZXJhbERlY2ltYWxNYXJrIHx8ICcuJztcclxuICAgICAgICB0YXJnZXQubnVtZXJhbFRob3VzYW5kc0dyb3VwU3R5bGUgPSBvcHRzLm51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlIHx8ICd0aG91c2FuZCc7XHJcblxyXG4gICAgICAgIC8vIG90aGVyc1xyXG4gICAgICAgIHRhcmdldC5udW1lcmljT25seSA9IHRhcmdldC5jcmVkaXRDYXJkIHx8IHRhcmdldC5kYXRlIHx8ICEhb3B0cy5udW1lcmljT25seTtcclxuXHJcbiAgICAgICAgdGFyZ2V0LnVwcGVyY2FzZSA9ICEhb3B0cy51cHBlcmNhc2U7XHJcbiAgICAgICAgdGFyZ2V0Lmxvd2VyY2FzZSA9ICEhb3B0cy5sb3dlcmNhc2U7XHJcblxyXG4gICAgICAgIHRhcmdldC5wcmVmaXggPSAodGFyZ2V0LmNyZWRpdENhcmQgfHwgdGFyZ2V0LnBob25lIHx8IHRhcmdldC5kYXRlKSA/ICcnIDogKG9wdHMucHJlZml4IHx8ICcnKTtcclxuXHJcbiAgICAgICAgdGFyZ2V0LmluaXRWYWx1ZSA9IG9wdHMuaW5pdFZhbHVlIHx8ICcnO1xyXG5cclxuICAgICAgICB0YXJnZXQuZGVsaW1pdGVyID1cclxuICAgICAgICAgICAgKG9wdHMuZGVsaW1pdGVyIHx8IG9wdHMuZGVsaW1pdGVyID09PSAnJykgPyBvcHRzLmRlbGltaXRlciA6XHJcbiAgICAgICAgICAgICAgICAob3B0cy5kYXRlID8gJy8nIDpcclxuICAgICAgICAgICAgICAgICAgICAob3B0cy5udW1lcmFsID8gJywnIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgKG9wdHMucGhvbmUgPyAnICcgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyAnKSkpO1xyXG4gICAgICAgIHRhcmdldC5kZWxpbWl0ZXJSRSA9IG5ldyBSZWdFeHAoJ1xcXFwnICsgKHRhcmdldC5kZWxpbWl0ZXIgfHwgJyAnKSwgJ2cnKTtcclxuXHJcbiAgICAgICAgdGFyZ2V0LmJsb2NrcyA9IG9wdHMuYmxvY2tzIHx8IFtdO1xyXG4gICAgICAgIHRhcmdldC5ibG9ja3NMZW5ndGggPSB0YXJnZXQuYmxvY2tzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgdGFyZ2V0Lm1heExlbmd0aCA9IDA7XHJcblxyXG4gICAgICAgIHRhcmdldC5iYWNrc3BhY2UgPSBmYWxzZTtcclxuICAgICAgICB0YXJnZXQucmVzdWx0ID0gJyc7XHJcblxyXG4gICAgICAgIHJldHVybiB0YXJnZXQ7XHJcbiAgICB9XHJcbn07XHJcblxyXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gRGVmYXVsdFByb3BlcnRpZXM7XHJcbn1cclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIENyZWRpdENhcmREZXRlY3RvciA9IHtcclxuICAgIGJsb2Nrczoge1xyXG4gICAgICAgIHVhdHA6ICAgICAgICAgIFs0LCA1LCA2XSxcclxuICAgICAgICBhbWV4OiAgICAgICAgICBbNCwgNiwgNV0sXHJcbiAgICAgICAgZGluZXJzOiAgICAgICAgWzQsIDYsIDRdLFxyXG4gICAgICAgIGRpc2NvdmVyOiAgICAgIFs0LCA0LCA0LCA0XSxcclxuICAgICAgICBtYXN0ZXJjYXJkOiAgICBbNCwgNCwgNCwgNF0sXHJcbiAgICAgICAgZGFua29ydDogICAgICAgWzQsIDQsIDQsIDRdLFxyXG4gICAgICAgIGluc3RhcGF5bWVudDogIFs0LCA0LCA0LCA0XSxcclxuICAgICAgICBqY2I6ICAgICAgICAgICBbNCwgNCwgNCwgNF0sXHJcbiAgICAgICAgdmlzYTogICAgICAgICAgWzQsIDQsIDQsIDRdLFxyXG4gICAgICAgIGdlbmVyYWxMb29zZTogIFs0LCA0LCA0LCA0XSxcclxuICAgICAgICBnZW5lcmFsU3RyaWN0OiBbNCwgNCwgNCwgN11cclxuICAgIH0sXHJcblxyXG4gICAgcmU6IHtcclxuICAgICAgICAvLyBzdGFydHMgd2l0aCAxOyAxNSBkaWdpdHMsIG5vdCBzdGFydHMgd2l0aCAxODAwIChqY2IgY2FyZClcclxuICAgICAgICB1YXRwOiAvXig/ITE4MDApMVxcZHswLDE0fS8sXHJcblxyXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDM0LzM3OyAxNSBkaWdpdHNcclxuICAgICAgICBhbWV4OiAvXjNbNDddXFxkezAsMTN9LyxcclxuXHJcbiAgICAgICAgLy8gc3RhcnRzIHdpdGggNjAxMS82NS82NDQtNjQ5OyAxNiBkaWdpdHNcclxuICAgICAgICBkaXNjb3ZlcjogL14oPzo2MDExfDY1XFxkezAsMn18NjRbNC05XVxcZD8pXFxkezAsMTJ9LyxcclxuXHJcbiAgICAgICAgLy8gc3RhcnRzIHdpdGggMzAwLTMwNS8zMDkgb3IgMzYvMzgvMzk7IDE0IGRpZ2l0c1xyXG4gICAgICAgIGRpbmVyczogL14zKD86MChbMC01XXw5KXxbNjg5XVxcZD8pXFxkezAsMTF9LyxcclxuXHJcbiAgICAgICAgLy8gc3RhcnRzIHdpdGggNTEtNTUvMjItMjc7IDE2IGRpZ2l0c1xyXG4gICAgICAgIG1hc3RlcmNhcmQ6IC9eKDVbMS01XXwyWzItN10pXFxkezAsMTR9LyxcclxuXHJcbiAgICAgICAgLy8gc3RhcnRzIHdpdGggNTAxOS80MTc1LzQ1NzE7IDE2IGRpZ2l0c1xyXG4gICAgICAgIGRhbmtvcnQ6IC9eKDUwMTl8NDE3NXw0NTcxKVxcZHswLDEyfS8sXHJcblxyXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDYzNy02Mzk7IDE2IGRpZ2l0c1xyXG4gICAgICAgIGluc3RhcGF5bWVudDogL142M1s3LTldXFxkezAsMTN9LyxcclxuXHJcbiAgICAgICAgLy8gc3RhcnRzIHdpdGggMjEzMS8xODAwLzM1OyAxNiBkaWdpdHNcclxuICAgICAgICBqY2I6IC9eKD86MjEzMXwxODAwfDM1XFxkezAsMn0pXFxkezAsMTJ9LyxcclxuXHJcbiAgICAgICAgLy8gc3RhcnRzIHdpdGggNDsgMTYgZGlnaXRzXHJcbiAgICAgICAgdmlzYTogL140XFxkezAsMTV9L1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRJbmZvOiBmdW5jdGlvbiAodmFsdWUsIHN0cmljdE1vZGUpIHtcclxuICAgICAgICB2YXIgYmxvY2tzID0gQ3JlZGl0Q2FyZERldGVjdG9yLmJsb2NrcyxcclxuICAgICAgICAgICAgcmUgPSBDcmVkaXRDYXJkRGV0ZWN0b3IucmU7XHJcblxyXG4gICAgICAgIC8vIEluIHRoZW9yeSwgdmlzYSBjcmVkaXQgY2FyZCBjYW4gaGF2ZSB1cCB0byAxOSBkaWdpdHMgbnVtYmVyLlxyXG4gICAgICAgIC8vIFNldCBzdHJpY3RNb2RlIHRvIHRydWUgd2lsbCByZW1vdmUgdGhlIDE2IG1heC1sZW5ndGggcmVzdHJhaW4sXHJcbiAgICAgICAgLy8gaG93ZXZlciwgSSBuZXZlciBmb3VuZCBhbnkgd2Vic2l0ZSB2YWxpZGF0ZSBjYXJkIG51bWJlciBsaWtlXHJcbiAgICAgICAgLy8gdGhpcywgaGVuY2UgcHJvYmFibHkgeW91IGRvbid0IG5lZWQgdG8gZW5hYmxlIHRoaXMgb3B0aW9uLlxyXG4gICAgICAgIHN0cmljdE1vZGUgPSAhIXN0cmljdE1vZGU7XHJcblxyXG4gICAgICAgIGlmIChyZS5hbWV4LnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAgICdhbWV4JyxcclxuICAgICAgICAgICAgICAgIGJsb2NrczogYmxvY2tzLmFtZXhcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGVsc2UgaWYgKHJlLnVhdHAudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICAgJ3VhdHAnLFxyXG4gICAgICAgICAgICAgICAgYmxvY2tzOiBibG9ja3MudWF0cFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSBpZiAocmUuZGluZXJzLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAgICdkaW5lcnMnLFxyXG4gICAgICAgICAgICAgICAgYmxvY2tzOiBibG9ja3MuZGluZXJzXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIGlmIChyZS5kaXNjb3Zlci50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogICAnZGlzY292ZXInLFxyXG4gICAgICAgICAgICAgICAgYmxvY2tzOiBibG9ja3MuZGlzY292ZXJcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGVsc2UgaWYgKHJlLm1hc3RlcmNhcmQudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICAgJ21hc3RlcmNhcmQnLFxyXG4gICAgICAgICAgICAgICAgYmxvY2tzOiBibG9ja3MubWFzdGVyY2FyZFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSBpZiAocmUuZGFua29ydC50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogICAnZGFua29ydCcsXHJcbiAgICAgICAgICAgICAgICBibG9ja3M6IGJsb2Nrcy5kYW5rb3J0XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIGlmIChyZS5pbnN0YXBheW1lbnQudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICAgJ2luc3RhcGF5bWVudCcsXHJcbiAgICAgICAgICAgICAgICBibG9ja3M6IGJsb2Nrcy5pbnN0YXBheW1lbnRcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGVsc2UgaWYgKHJlLmpjYi50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogICAnamNiJyxcclxuICAgICAgICAgICAgICAgIGJsb2NrczogYmxvY2tzLmpjYlxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSBpZiAocmUudmlzYS50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogICAndmlzYScsXHJcbiAgICAgICAgICAgICAgICBibG9ja3M6IGJsb2Nrcy52aXNhXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIGlmIChzdHJpY3RNb2RlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAgICd1bmtub3duJyxcclxuICAgICAgICAgICAgICAgIGJsb2NrczogYmxvY2tzLmdlbmVyYWxTdHJpY3RcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogICAndW5rbm93bicsXHJcbiAgICAgICAgICAgICAgICBibG9ja3M6IGJsb2Nrcy5nZW5lcmFsTG9vc2VcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gQ3JlZGl0Q2FyZERldGVjdG9yO1xyXG59XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBEYXRlRm9ybWF0dGVyID0gZnVuY3Rpb24gKGRhdGVQYXR0ZXJuKSB7XHJcbiAgICB2YXIgb3duZXIgPSB0aGlzO1xyXG5cclxuICAgIG93bmVyLmJsb2NrcyA9IFtdO1xyXG4gICAgb3duZXIuZGF0ZVBhdHRlcm4gPSBkYXRlUGF0dGVybjtcclxuICAgIG93bmVyLmluaXRCbG9ja3MoKTtcclxufTtcclxuXHJcbkRhdGVGb3JtYXR0ZXIucHJvdG90eXBlID0ge1xyXG4gICAgaW5pdEJsb2NrczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBvd25lciA9IHRoaXM7XHJcbiAgICAgICAgb3duZXIuZGF0ZVBhdHRlcm4uZm9yRWFjaChmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSAnWScpIHtcclxuICAgICAgICAgICAgICAgIG93bmVyLmJsb2Nrcy5wdXNoKDQpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgb3duZXIuYmxvY2tzLnB1c2goMik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0QmxvY2tzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tzO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRWYWxpZGF0ZWREYXRlOiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCByZXN1bHQgPSAnJztcclxuXHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9bXlxcZF0vZywgJycpO1xyXG5cclxuICAgICAgICBvd25lci5ibG9ja3MuZm9yRWFjaChmdW5jdGlvbiAobGVuZ3RoLCBpbmRleCkge1xyXG4gICAgICAgICAgICBpZiAodmFsdWUubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHN1YiA9IHZhbHVlLnNsaWNlKDAsIGxlbmd0aCksXHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdCA9IHZhbHVlLnNsaWNlKGxlbmd0aCk7XHJcblxyXG4gICAgICAgICAgICAgICAgc3dpdGNoIChvd25lci5kYXRlUGF0dGVybltpbmRleF0pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2QnOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJzZUludChzdWIsIDEwKSA+IDMxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YiA9ICczMSc7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXJzZUludChzdWIsIDEwKSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3N1YiA9ICcwMSc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnbSc6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnNlSW50KHN1YiwgMTApID4gMTIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3ViID0gJzEyJztcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhcnNlSW50KHN1YiwgMTApID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vc3ViID0gJzAxJztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IHN1YjtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyB1cGRhdGUgcmVtYWluaW5nIHN0cmluZ1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSByZXN0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbn07XHJcblxyXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gRGF0ZUZvcm1hdHRlcjtcclxufVxyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgTnVtZXJhbEZvcm1hdHRlciA9IGZ1bmN0aW9uIChudW1lcmFsRGVjaW1hbE1hcmssXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bWVyYWxEZWNpbWFsU2NhbGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxpbWl0ZXIpIHtcclxuICAgIHZhciBvd25lciA9IHRoaXM7XHJcblxyXG4gICAgb3duZXIubnVtZXJhbERlY2ltYWxNYXJrID0gbnVtZXJhbERlY2ltYWxNYXJrIHx8ICcuJztcclxuICAgIG93bmVyLm51bWVyYWxEZWNpbWFsU2NhbGUgPSBudW1lcmFsRGVjaW1hbFNjYWxlIHx8IDI7XHJcbiAgICBvd25lci5udW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSA9IG51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlIHx8IE51bWVyYWxGb3JtYXR0ZXIuZ3JvdXBTdHlsZS50aG91c2FuZDtcclxuICAgIG93bmVyLmRlbGltaXRlciA9IChkZWxpbWl0ZXIgfHwgZGVsaW1pdGVyID09PSAnJykgPyBkZWxpbWl0ZXIgOiAnLCc7XHJcbiAgICBvd25lci5kZWxpbWl0ZXJSRSA9IGRlbGltaXRlciA/IG5ldyBSZWdFeHAoJ1xcXFwnICsgZGVsaW1pdGVyLCAnZycpIDogJyc7XHJcbn07XHJcblxyXG5OdW1lcmFsRm9ybWF0dGVyLmdyb3VwU3R5bGUgPSB7XHJcbiAgICB0aG91c2FuZDogJ3Rob3VzYW5kJyxcclxuICAgIGxha2g6ICAgICAnbGFraCcsXHJcbiAgICB3YW46ICAgICAgJ3dhbidcclxufTtcclxuXHJcbk51bWVyYWxGb3JtYXR0ZXIucHJvdG90eXBlID0ge1xyXG4gICAgZ2V0UmF3VmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKHRoaXMuZGVsaW1pdGVyUkUsICcnKS5yZXBsYWNlKHRoaXMubnVtZXJhbERlY2ltYWxNYXJrLCAnLicpO1xyXG4gICAgfSxcclxuXHJcbiAgICBmb3JtYXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHBhcnRzLCBwYXJ0SW50ZWdlciwgcGFydERlY2ltYWwgPSAnJztcclxuXHJcbiAgICAgICAgLy8gc3RyaXAgYWxwaGFiZXQgbGV0dGVyc1xyXG4gICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvW0EtWmEtel0vZywgJycpXHJcblxyXG4gICAgICAgICAgICAvLyByZXBsYWNlIHRoZSBmaXJzdCBkZWNpbWFsIG1hcmsgd2l0aCByZXNlcnZlZCBwbGFjZWhvbGRlclxyXG4gICAgICAgICAgICAucmVwbGFjZShvd25lci5udW1lcmFsRGVjaW1hbE1hcmssICdNJylcclxuXHJcbiAgICAgICAgICAgIC8vIHN0cmlwIHRoZSBub24gbnVtZXJpYyBsZXR0ZXJzIGV4Y2VwdCBNXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC9bXlxcZE1dL2csICcnKVxyXG5cclxuICAgICAgICAgICAgLy8gcmVwbGFjZSBtYXJrXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKCdNJywgb3duZXIubnVtZXJhbERlY2ltYWxNYXJrKVxyXG5cclxuICAgICAgICAgICAgLy8gc3RyaXAgbGVhZGluZyAwXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC9eKC0pPzArKD89XFxkKS8sICckMScpO1xyXG5cclxuICAgICAgICBwYXJ0SW50ZWdlciA9IHZhbHVlO1xyXG5cclxuICAgICAgICBpZiAodmFsdWUuaW5kZXhPZihvd25lci5udW1lcmFsRGVjaW1hbE1hcmspID49IDApIHtcclxuICAgICAgICAgICAgcGFydHMgPSB2YWx1ZS5zcGxpdChvd25lci5udW1lcmFsRGVjaW1hbE1hcmspO1xyXG4gICAgICAgICAgICBwYXJ0SW50ZWdlciA9IHBhcnRzWzBdO1xyXG4gICAgICAgICAgICBwYXJ0RGVjaW1hbCA9IG93bmVyLm51bWVyYWxEZWNpbWFsTWFyayArIHBhcnRzWzFdLnNsaWNlKDAsIG93bmVyLm51bWVyYWxEZWNpbWFsU2NhbGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3dpdGNoIChvd25lci5udW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSkge1xyXG4gICAgICAgIGNhc2UgTnVtZXJhbEZvcm1hdHRlci5ncm91cFN0eWxlLmxha2g6XHJcbiAgICAgICAgICAgIHBhcnRJbnRlZ2VyID0gcGFydEludGVnZXIucmVwbGFjZSgvKFxcZCkoPz0oXFxkXFxkKStcXGQkKS9nLCAnJDEnICsgb3duZXIuZGVsaW1pdGVyKTtcclxuXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBjYXNlIE51bWVyYWxGb3JtYXR0ZXIuZ3JvdXBTdHlsZS53YW46XHJcbiAgICAgICAgICAgIHBhcnRJbnRlZ2VyID0gcGFydEludGVnZXIucmVwbGFjZSgvKFxcZCkoPz0oXFxkezR9KSskKS9nLCAnJDEnICsgb3duZXIuZGVsaW1pdGVyKTtcclxuXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICBwYXJ0SW50ZWdlciA9IHBhcnRJbnRlZ2VyLnJlcGxhY2UoLyhcXGQpKD89KFxcZHszfSkrJCkvZywgJyQxJyArIG93bmVyLmRlbGltaXRlcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcGFydEludGVnZXIudG9TdHJpbmcoKSArIHBhcnREZWNpbWFsLnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gTnVtZXJhbEZvcm1hdHRlcjtcclxufVxyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgUGhvbmVGb3JtYXR0ZXIgPSBmdW5jdGlvbiAoZm9ybWF0dGVyLCBkZWxpbWl0ZXIpIHtcclxuICAgIHZhciBvd25lciA9IHRoaXM7XHJcblxyXG4gICAgb3duZXIuZGVsaW1pdGVyID0gKGRlbGltaXRlciB8fCBkZWxpbWl0ZXIgPT09ICcnKSA/IGRlbGltaXRlciA6ICcgJztcclxuICAgIG93bmVyLmRlbGltaXRlclJFID0gZGVsaW1pdGVyID8gbmV3IFJlZ0V4cCgnXFxcXCcgKyBkZWxpbWl0ZXIsICdnJykgOiAnJztcclxuXHJcbiAgICBvd25lci5mb3JtYXR0ZXIgPSBmb3JtYXR0ZXI7XHJcbn07XHJcblxyXG5QaG9uZUZvcm1hdHRlci5wcm90b3R5cGUgPSB7XHJcbiAgICBzZXRGb3JtYXR0ZXI6IGZ1bmN0aW9uIChmb3JtYXR0ZXIpIHtcclxuICAgICAgICB0aGlzLmZvcm1hdHRlciA9IGZvcm1hdHRlcjtcclxuICAgIH0sXHJcblxyXG4gICAgZm9ybWF0OiBmdW5jdGlvbiAocGhvbmVOdW1iZXIpIHtcclxuICAgICAgICB2YXIgb3duZXIgPSB0aGlzO1xyXG5cclxuICAgICAgICBvd25lci5mb3JtYXR0ZXIuY2xlYXIoKTtcclxuXHJcbiAgICAgICAgLy8gb25seSBrZWVwIG51bWJlciBhbmQgK1xyXG4gICAgICAgIHBob25lTnVtYmVyID0gcGhvbmVOdW1iZXIucmVwbGFjZSgvW15cXGQrXS9nLCAnJyk7XHJcblxyXG4gICAgICAgIC8vIHN0cmlwIGRlbGltaXRlclxyXG4gICAgICAgIHBob25lTnVtYmVyID0gcGhvbmVOdW1iZXIucmVwbGFjZShvd25lci5kZWxpbWl0ZXJSRSwgJycpO1xyXG5cclxuICAgICAgICB2YXIgcmVzdWx0ID0gJycsIGN1cnJlbnQsIHZhbGlkYXRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgaU1heCA9IHBob25lTnVtYmVyLmxlbmd0aDsgaSA8IGlNYXg7IGkrKykge1xyXG4gICAgICAgICAgICBjdXJyZW50ID0gb3duZXIuZm9ybWF0dGVyLmlucHV0RGlnaXQocGhvbmVOdW1iZXIuY2hhckF0KGkpKTtcclxuXHJcbiAgICAgICAgICAgIC8vIGhhcyAoKS0gb3Igc3BhY2UgaW5zaWRlXHJcbiAgICAgICAgICAgIGlmICgvW1xccygpLV0vZy50ZXN0KGN1cnJlbnQpKSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBjdXJyZW50O1xyXG5cclxuICAgICAgICAgICAgICAgIHZhbGlkYXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXZhbGlkYXRlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGN1cnJlbnQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBlbHNlOiBvdmVyIGxlbmd0aCBpbnB1dFxyXG4gICAgICAgICAgICAgICAgLy8gaXQgdHVybnMgdG8gaW52YWxpZCBudW1iZXIgYWdhaW5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gc3RyaXAgKClcclxuICAgICAgICAvLyBlLmcuIFVTOiA3MTYxMjM0NTY3IHJldHVybnMgKDcxNikgMTIzLTQ1NjdcclxuICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZSgvWygpXS9nLCAnJyk7XHJcbiAgICAgICAgLy8gcmVwbGFjZSBsaWJyYXJ5IGRlbGltaXRlciB3aXRoIHVzZXIgY3VzdG9taXplZCBkZWxpbWl0ZXJcclxuICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZSgvW1xccy1dL2csIG93bmVyLmRlbGltaXRlcik7XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbn07XHJcblxyXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gUGhvbmVGb3JtYXR0ZXI7XHJcbn1cclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIFV0aWwgPSB7XHJcbiAgICBub29wOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB9LFxyXG5cclxuICAgIHN0cmlwOiBmdW5jdGlvbiAodmFsdWUsIHJlKSB7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UocmUsICcnKTtcclxuICAgIH0sXHJcblxyXG4gICAgaGVhZFN0cjogZnVuY3Rpb24gKHN0ciwgbGVuZ3RoKSB7XHJcbiAgICAgICAgcmV0dXJuIHN0ci5zbGljZSgwLCBsZW5ndGgpO1xyXG4gICAgfSxcclxuXHJcbiAgICBnZXRNYXhMZW5ndGg6IGZ1bmN0aW9uIChibG9ja3MpIHtcclxuICAgICAgICByZXR1cm4gYmxvY2tzLnJlZHVjZShmdW5jdGlvbiAocHJldmlvdXMsIGN1cnJlbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHByZXZpb3VzICsgY3VycmVudDtcclxuICAgICAgICB9LCAwKTtcclxuICAgIH0sXHJcblxyXG4gICAgLy8gc3RyaXAgdmFsdWUgYnkgcHJlZml4IGxlbmd0aFxyXG4gICAgLy8gZm9yIHByZWZpeDogUFJFXHJcbiAgICAvLyAoUFJFMTIzLCAzKSAtPiAxMjNcclxuICAgIC8vIChQUjEyMywgMykgLT4gMjMgdGhpcyBoYXBwZW5zIHdoZW4gdXNlciBoaXRzIGJhY2tzcGFjZSBpbiBmcm9udCBvZiBcIlBSRVwiXHJcbiAgICBnZXRQcmVmaXhTdHJpcHBlZFZhbHVlOiBmdW5jdGlvbiAodmFsdWUsIHByZWZpeCkge1xyXG4gICAgICAgIHZhciBlc2NhcGVkUHJlZml4ID0gdGhpcy5nZXRSZWdleHBFc2NhcGVkU3RyaW5nKHByZWZpeCk7XHJcbiAgICAgICAgdmFyIHBhdHRlcm4gPSBuZXcgUmVnRXhwKCdeKCcgKyBlc2NhcGVkUHJlZml4ICsgJykrfCQnLCAnZycpO1xyXG5cclxuICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZShwYXR0ZXJuLCAnJyk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldFJlZ2V4cEVzY2FwZWRTdHJpbmc6IGZ1bmN0aW9uKHN0cikge1xyXG4gICAgICAgIHJldHVybiBzdHIucmVwbGFjZSgvWy1bXFxde30oKSorPy4sXFxcXF4kfCNcXHNdL2csICdcXFxcJCYnKTtcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0Rm9ybWF0dGVkVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSwgYmxvY2tzLCBibG9ja3NMZW5ndGgsIGRlbGltaXRlcikge1xyXG4gICAgICAgIHZhciByZXN1bHQgPSAnJztcclxuXHJcbiAgICAgICAgYmxvY2tzLmZvckVhY2goZnVuY3Rpb24gKGxlbmd0aCwgaW5kZXgpIHtcclxuICAgICAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHZhciBzdWIgPSB2YWx1ZS5zbGljZSgwLCBsZW5ndGgpLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3QgPSB2YWx1ZS5zbGljZShsZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBzdWI7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHN1Yi5sZW5ndGggPT09IGxlbmd0aCAmJiBpbmRleCA8IGJsb2Nrc0xlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgKz0gZGVsaW1pdGVyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSByZW1haW5pbmcgc3RyaW5nXHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHJlc3Q7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxufTtcclxuXHJcbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBVdGlsO1xyXG59XHJcbiJdfQ==
