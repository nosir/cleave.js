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
                target.numeralDecimalScale = opts.numeralDecimalScale === 0 ? 0 : opts.numeralDecimalScale || 2;
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
    owner.numeralDecimalScale = numeralDecimalScale === 0 ? 0 : numeralDecimalScale || 2;
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
            if (owner.numeralDecimalScale > 0) partDecimal = owner.numeralDecimalMark + parts[1].slice(0, owner.numeralDecimalScale);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZWFjdC5qcyIsInNyY1xcc3JjXFxDbGVhdmUucmVhY3QuanMiLCJzcmNcXGNvbW1vblxcRGVmYXVsdFByb3BlcnRpZXMuanMiLCJzcmNcXHNob3J0Y3V0c1xcQ3JlZGl0Q2FyZERldGVjdG9yLmpzIiwic3JjXFxzaG9ydGN1dHNcXERhdGVGb3JtYXR0ZXIuanMiLCJzcmNcXHNob3J0Y3V0c1xcTnVtZXJhbEZvcm1hdHRlci5qcyIsInNyY1xcc2hvcnRjdXRzXFxQaG9uZUZvcm1hdHRlci5qcyIsInNyY1xcdXRpbHNcXFV0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQTs7Ozs7Ozs7OztBQ0FBOzs7Ozs7QUFFQSxJQUFJLFFBQVEsUUFBUSxPQUFSLENBQVo7O0FBRUEsSUFBSSxtQkFBbUIsUUFBUSw4QkFBUixDQUF2QjtBQUNBLElBQUksZ0JBQWdCLFFBQVEsMkJBQVIsQ0FBcEI7QUFDQSxJQUFJLGlCQUFpQixRQUFRLDRCQUFSLENBQXJCO0FBQ0EsSUFBSSxxQkFBcUIsUUFBUSxnQ0FBUixDQUF6QjtBQUNBLElBQUksT0FBTyxRQUFRLGNBQVIsQ0FBWDtBQUNBLElBQUksb0JBQW9CLFFBQVEsNEJBQVIsQ0FBeEI7O0FBRUEsSUFBSSxTQUFTLE1BQU0sV0FBTixDQUFrQjtBQUFBOztBQUMzQix1QkFBbUIsNkJBQVk7QUFDM0IsYUFBSyxJQUFMO0FBQ0gsS0FIMEI7O0FBSzNCLCtCQUEyQixtQ0FBVSxTQUFWLEVBQXFCO0FBQzVDLFlBQUksUUFBUSxJQUFaO0FBQUEsWUFDSSxrQkFBa0IsVUFBVSxPQUFWLENBQWtCLGVBRHhDO0FBQUEsWUFFSSxXQUFXLFVBQVUsS0FGekI7O0FBSUEsWUFBSSxRQUFKLEVBQWM7QUFDVixrQkFBTSxPQUFOLENBQWMsUUFBZDtBQUNIOztBQUVEO0FBQ0EsWUFBSSxtQkFBbUIsb0JBQW9CLE1BQU0sVUFBTixDQUFpQixl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IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IENsZWF2ZSBmcm9tICcuL3NyYy9DbGVhdmUucmVhY3QnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgQ2xlYXZlO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xyXG5cclxudmFyIE51bWVyYWxGb3JtYXR0ZXIgPSByZXF1aXJlKCcuL3Nob3J0Y3V0cy9OdW1lcmFsRm9ybWF0dGVyJyk7XHJcbnZhciBEYXRlRm9ybWF0dGVyID0gcmVxdWlyZSgnLi9zaG9ydGN1dHMvRGF0ZUZvcm1hdHRlcicpO1xyXG52YXIgUGhvbmVGb3JtYXR0ZXIgPSByZXF1aXJlKCcuL3Nob3J0Y3V0cy9QaG9uZUZvcm1hdHRlcicpO1xyXG52YXIgQ3JlZGl0Q2FyZERldGVjdG9yID0gcmVxdWlyZSgnLi9zaG9ydGN1dHMvQ3JlZGl0Q2FyZERldGVjdG9yJyk7XHJcbnZhciBVdGlsID0gcmVxdWlyZSgnLi91dGlscy9VdGlsJyk7XHJcbnZhciBEZWZhdWx0UHJvcGVydGllcyA9IHJlcXVpcmUoJy4vY29tbW9uL0RlZmF1bHRQcm9wZXJ0aWVzJyk7XHJcblxyXG52YXIgQ2xlYXZlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xyXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgIH0sXHJcblxyXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24gKG5leHRQcm9wcykge1xyXG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXHJcbiAgICAgICAgICAgIHBob25lUmVnaW9uQ29kZSA9IG5leHRQcm9wcy5vcHRpb25zLnBob25lUmVnaW9uQ29kZSxcclxuICAgICAgICAgICAgbmV3VmFsdWUgPSBuZXh0UHJvcHMudmFsdWU7XHJcblxyXG4gICAgICAgIGlmIChuZXdWYWx1ZSkge1xyXG4gICAgICAgICAgICBvd25lci5vbklucHV0KG5ld1ZhbHVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBwaG9uZSByZWdpb24gY29kZVxyXG4gICAgICAgIGlmIChwaG9uZVJlZ2lvbkNvZGUgJiYgcGhvbmVSZWdpb25Db2RlICE9PSBvd25lci5wcm9wZXJ0aWVzLnBob25lUmVnaW9uQ29kZSkge1xyXG4gICAgICAgICAgICBvd25lci5wcm9wZXJ0aWVzLnBob25lUmVnaW9uQ29kZSA9IHBob25lUmVnaW9uQ29kZTtcclxuICAgICAgICAgICAgb3duZXIuaW5pdFBob25lRm9ybWF0dGVyKCk7XHJcbiAgICAgICAgICAgIG93bmVyLm9uSW5wdXQob3duZXIucHJvcGVydGllcy5yZXN1bHQpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcclxuICAgICAgICAgICAgeyB2YWx1ZSwgb3B0aW9ucywgb25LZXlEb3duLCBvbkNoYW5nZSwgLi4ub3RoZXIgfSA9IG93bmVyLnByb3BzO1xyXG5cclxuICAgICAgICBvd25lci5yZWdpc3RlcmVkRXZlbnRzID0ge1xyXG4gICAgICAgICAgICBvbkNoYW5nZTogIG9uQ2hhbmdlIHx8IFV0aWwubm9vcCxcclxuICAgICAgICAgICAgb25LZXlEb3duOiBvbktleURvd24gfHwgVXRpbC5ub29wXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgb3B0aW9ucy5pbml0VmFsdWUgPSB2YWx1ZTtcclxuXHJcbiAgICAgICAgb3duZXIucHJvcGVydGllcyA9IERlZmF1bHRQcm9wZXJ0aWVzLmFzc2lnbih7fSwgb3B0aW9ucyk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG90aGVyOiBvdGhlcixcclxuICAgICAgICAgICAgdmFsdWU6IG93bmVyLnByb3BlcnRpZXMucmVzdWx0XHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcblxyXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXHJcbiAgICAgICAgICAgIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XHJcblxyXG4gICAgICAgIC8vIHNvIG5vIG5lZWQgZm9yIHRoaXMgbGliIGF0IGFsbFxyXG4gICAgICAgIGlmICghcHBzLm51bWVyYWwgJiYgIXBwcy5waG9uZSAmJiAhcHBzLmNyZWRpdENhcmQgJiYgIXBwcy5kYXRlICYmIChwcHMuYmxvY2tzTGVuZ3RoID09PSAwICYmICFwcHMucHJlZml4KSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcHMubWF4TGVuZ3RoID0gVXRpbC5nZXRNYXhMZW5ndGgocHBzLmJsb2Nrcyk7XHJcblxyXG4gICAgICAgIG93bmVyLmluaXRQaG9uZUZvcm1hdHRlcigpO1xyXG4gICAgICAgIG93bmVyLmluaXREYXRlRm9ybWF0dGVyKCk7XHJcbiAgICAgICAgb3duZXIuaW5pdE51bWVyYWxGb3JtYXR0ZXIoKTtcclxuXHJcbiAgICAgICAgb3duZXIub25JbnB1dChwcHMuaW5pdFZhbHVlKTtcclxuICAgIH0sXHJcblxyXG4gICAgaW5pdE51bWVyYWxGb3JtYXR0ZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxyXG4gICAgICAgICAgICBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xyXG5cclxuICAgICAgICBpZiAoIXBwcy5udW1lcmFsKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBwcy5udW1lcmFsRm9ybWF0dGVyID0gbmV3IE51bWVyYWxGb3JtYXR0ZXIoXHJcbiAgICAgICAgICAgIHBwcy5udW1lcmFsRGVjaW1hbE1hcmssXHJcbiAgICAgICAgICAgIHBwcy5udW1lcmFsRGVjaW1hbFNjYWxlLFxyXG4gICAgICAgICAgICBwcHMubnVtZXJhbFRob3VzYW5kc0dyb3VwU3R5bGUsXHJcbiAgICAgICAgICAgIHBwcy5kZWxpbWl0ZXJcclxuICAgICAgICApO1xyXG4gICAgfSxcclxuXHJcbiAgICBpbml0RGF0ZUZvcm1hdHRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXHJcbiAgICAgICAgICAgIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XHJcblxyXG4gICAgICAgIGlmICghcHBzLmRhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHBzLmRhdGVGb3JtYXR0ZXIgPSBuZXcgRGF0ZUZvcm1hdHRlcihwcHMuZGF0ZVBhdHRlcm4pO1xyXG4gICAgICAgIHBwcy5ibG9ja3MgPSBwcHMuZGF0ZUZvcm1hdHRlci5nZXRCbG9ja3MoKTtcclxuICAgICAgICBwcHMuYmxvY2tzTGVuZ3RoID0gcHBzLmJsb2Nrcy5sZW5ndGg7XHJcbiAgICAgICAgcHBzLm1heExlbmd0aCA9IFV0aWwuZ2V0TWF4TGVuZ3RoKHBwcy5ibG9ja3MpO1xyXG4gICAgfSxcclxuXHJcbiAgICBpbml0UGhvbmVGb3JtYXR0ZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxyXG4gICAgICAgICAgICBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xyXG5cclxuICAgICAgICBpZiAoIXBwcy5waG9uZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDbGVhdmUuQXNZb3VUeXBlRm9ybWF0dGVyIHNob3VsZCBiZSBwcm92aWRlZCBieVxyXG4gICAgICAgIC8vIGV4dGVybmFsIGdvb2dsZSBjbG9zdXJlIGxpYlxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHBwcy5waG9uZUZvcm1hdHRlciA9IG5ldyBQaG9uZUZvcm1hdHRlcihcclxuICAgICAgICAgICAgICAgIG5ldyB3aW5kb3cuQ2xlYXZlLkFzWW91VHlwZUZvcm1hdHRlcihwcHMucGhvbmVSZWdpb25Db2RlKSxcclxuICAgICAgICAgICAgICAgIHBwcy5kZWxpbWl0ZXJcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9IGNhdGNoIChleCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BsZWFzZSBpbmNsdWRlIHBob25lLXR5cGUtZm9ybWF0dGVyLntjb3VudHJ5fS5qcyBsaWInKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIG9uS2V5RG93bjogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcclxuICAgICAgICAgICAgcHBzID0gb3duZXIucHJvcGVydGllcyxcclxuICAgICAgICAgICAgY2hhckNvZGUgPSBldmVudC53aGljaCB8fCBldmVudC5rZXlDb2RlO1xyXG5cclxuICAgICAgICAvLyBoaXQgYmFja3NwYWNlIHdoZW4gbGFzdCBjaGFyYWN0ZXIgaXMgZGVsaW1pdGVyXHJcbiAgICAgICAgaWYgKGNoYXJDb2RlID09PSA4ICYmIHBwcy5yZXN1bHQuc2xpY2UoLTEpID09PSBwcHMuZGVsaW1pdGVyKSB7XHJcbiAgICAgICAgICAgIHBwcy5iYWNrc3BhY2UgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHBwcy5iYWNrc3BhY2UgPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG93bmVyLnJlZ2lzdGVyZWRFdmVudHMub25LZXlEb3duKGV2ZW50KTtcclxuICAgIH0sXHJcblxyXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XHJcblxyXG4gICAgICAgIG93bmVyLm9uSW5wdXQoZXZlbnQudGFyZ2V0LnZhbHVlKTtcclxuXHJcbiAgICAgICAgaWYgKHBwcy5udW1lcmFsKSB7XHJcbiAgICAgICAgICAgIGV2ZW50LnRhcmdldC5yYXdWYWx1ZSA9IHBwcy5udW1lcmFsRm9ybWF0dGVyLmdldFJhd1ZhbHVlKHBwcy5yZXN1bHQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGV2ZW50LnRhcmdldC5yYXdWYWx1ZSA9IFV0aWwuc3RyaXAocHBzLnJlc3VsdCwgcHBzLmRlbGltaXRlclJFKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG93bmVyLnJlZ2lzdGVyZWRFdmVudHMub25DaGFuZ2UoZXZlbnQpO1xyXG4gICAgfSxcclxuXHJcbiAgICBvbklucHV0OiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwcHMgPSBvd25lci5wcm9wZXJ0aWVzLFxyXG4gICAgICAgICAgICBwcmV2ID0gcHBzLnJlc3VsdDtcclxuXHJcbiAgICAgICAgLy8gY2FzZSAxOiBkZWxldGUgb25lIG1vcmUgY2hhcmFjdGVyIFwiNFwiXHJcbiAgICAgICAgLy8gMTIzNCp8IC0+IGhpdCBiYWNrc3BhY2UgLT4gMTIzfFxyXG4gICAgICAgIC8vIGNhc2UgMjogbGFzdCBjaGFyYWN0ZXIgaXMgbm90IGRlbGltaXRlciB3aGljaCBpczpcclxuICAgICAgICAvLyAxMnwzNCogLT4gaGl0IGJhY2tzcGFjZSAtPiAxfDM0KlxyXG5cclxuICAgICAgICBpZiAoIXBwcy5udW1lcmFsICYmIHBwcy5iYWNrc3BhY2UgJiYgdmFsdWUuc2xpY2UoLTEpICE9PSBwcHMuZGVsaW1pdGVyKSB7XHJcbiAgICAgICAgICAgIHZhbHVlID0gVXRpbC5oZWFkU3RyKHZhbHVlLCB2YWx1ZS5sZW5ndGggLSAxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHBob25lIGZvcm1hdHRlclxyXG4gICAgICAgIGlmIChwcHMucGhvbmUpIHtcclxuICAgICAgICAgICAgcHBzLnJlc3VsdCA9IHBwcy5waG9uZUZvcm1hdHRlci5mb3JtYXQodmFsdWUpO1xyXG4gICAgICAgICAgICBvd25lci51cGRhdGVWYWx1ZVN0YXRlKCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBudW1lcmFsIGZvcm1hdHRlclxyXG4gICAgICAgIGlmIChwcHMubnVtZXJhbCkge1xyXG4gICAgICAgICAgICBwcHMucmVzdWx0ID0gcHBzLnByZWZpeCArIHBwcy5udW1lcmFsRm9ybWF0dGVyLmZvcm1hdCh2YWx1ZSk7XHJcbiAgICAgICAgICAgIG93bmVyLnVwZGF0ZVZhbHVlU3RhdGUoKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGRhdGVcclxuICAgICAgICBpZiAocHBzLmRhdGUpIHtcclxuICAgICAgICAgICAgdmFsdWUgPSBwcHMuZGF0ZUZvcm1hdHRlci5nZXRWYWxpZGF0ZWREYXRlKHZhbHVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHN0cmlwIGRlbGltaXRlcnNcclxuICAgICAgICB2YWx1ZSA9IFV0aWwuc3RyaXAodmFsdWUsIHBwcy5kZWxpbWl0ZXJSRSk7XHJcblxyXG4gICAgICAgIC8vIHN0cmlwIHByZWZpeFxyXG4gICAgICAgIHZhbHVlID0gVXRpbC5nZXRQcmVmaXhTdHJpcHBlZFZhbHVlKHZhbHVlLCBwcHMucHJlZml4TGVuZ3RoKTtcclxuXHJcbiAgICAgICAgLy8gc3RyaXAgbm9uLW51bWVyaWMgY2hhcmFjdGVyc1xyXG4gICAgICAgIHZhbHVlID0gcHBzLm51bWVyaWNPbmx5ID8gVXRpbC5zdHJpcCh2YWx1ZSwgL1teXFxkXS9nKSA6IHZhbHVlO1xyXG5cclxuICAgICAgICAvLyBjb252ZXJ0IGNhc2VcclxuICAgICAgICB2YWx1ZSA9IHBwcy51cHBlcmNhc2UgPyB2YWx1ZS50b1VwcGVyQ2FzZSgpIDogdmFsdWU7XHJcbiAgICAgICAgdmFsdWUgPSBwcHMubG93ZXJjYXNlID8gdmFsdWUudG9Mb3dlckNhc2UoKSA6IHZhbHVlO1xyXG5cclxuICAgICAgICAvLyBwcmVmaXhcclxuICAgICAgICBpZiAocHBzLnByZWZpeCkge1xyXG4gICAgICAgICAgICB2YWx1ZSA9IHBwcy5wcmVmaXggKyB2YWx1ZTtcclxuXHJcbiAgICAgICAgICAgIC8vIG5vIGJsb2NrcyBzcGVjaWZpZWQsIG5vIG5lZWQgdG8gZG8gZm9ybWF0dGluZ1xyXG4gICAgICAgICAgICBpZiAocHBzLmJsb2Nrc0xlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcHBzLnJlc3VsdCA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgb3duZXIudXBkYXRlVmFsdWVTdGF0ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gdXBkYXRlIGNyZWRpdCBjYXJkIHByb3BzXHJcbiAgICAgICAgaWYgKHBwcy5jcmVkaXRDYXJkKSB7XHJcbiAgICAgICAgICAgIG93bmVyLnVwZGF0ZUNyZWRpdENhcmRQcm9wc0J5VmFsdWUodmFsdWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gc3RyaXAgb3ZlciBsZW5ndGggY2hhcmFjdGVyc1xyXG4gICAgICAgIHZhbHVlID0gVXRpbC5oZWFkU3RyKHZhbHVlLCBwcHMubWF4TGVuZ3RoKTtcclxuXHJcbiAgICAgICAgLy8gYXBwbHkgYmxvY2tzXHJcbiAgICAgICAgcHBzLnJlc3VsdCA9IFV0aWwuZ2V0Rm9ybWF0dGVkVmFsdWUodmFsdWUsIHBwcy5ibG9ja3MsIHBwcy5ibG9ja3NMZW5ndGgsIHBwcy5kZWxpbWl0ZXIpO1xyXG5cclxuICAgICAgICAvLyBub3RoaW5nIGNoYW5nZWRcclxuICAgICAgICAvLyBwcmV2ZW50IHVwZGF0ZSB2YWx1ZSB0byBhdm9pZCBjYXJldCBwb3NpdGlvbiBjaGFuZ2VcclxuICAgICAgICBpZiAocHJldiA9PT0gcHBzLnJlc3VsdCAmJiBwcmV2ICE9PSBwcHMucHJlZml4KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG93bmVyLnVwZGF0ZVZhbHVlU3RhdGUoKTtcclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlQ3JlZGl0Q2FyZFByb3BzQnlWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcHBzID0gb3duZXIucHJvcGVydGllcyxcclxuICAgICAgICAgICAgY3JlZGl0Q2FyZEluZm87XHJcblxyXG4gICAgICAgIC8vIEF0IGxlYXN0IG9uZSBvZiB0aGUgZmlyc3QgNCBjaGFyYWN0ZXJzIGhhcyBjaGFuZ2VkXHJcbiAgICAgICAgaWYgKFV0aWwuaGVhZFN0cihwcHMucmVzdWx0LCA0KSA9PT0gVXRpbC5oZWFkU3RyKHZhbHVlLCA0KSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjcmVkaXRDYXJkSW5mbyA9IENyZWRpdENhcmREZXRlY3Rvci5nZXRJbmZvKHZhbHVlLCBwcHMuY3JlZGl0Q2FyZFN0cmljdE1vZGUpO1xyXG5cclxuICAgICAgICBwcHMuYmxvY2tzID0gY3JlZGl0Q2FyZEluZm8uYmxvY2tzO1xyXG4gICAgICAgIHBwcy5ibG9ja3NMZW5ndGggPSBwcHMuYmxvY2tzLmxlbmd0aDtcclxuICAgICAgICBwcHMubWF4TGVuZ3RoID0gVXRpbC5nZXRNYXhMZW5ndGgocHBzLmJsb2Nrcyk7XHJcblxyXG4gICAgICAgIC8vIGNyZWRpdCBjYXJkIHR5cGUgY2hhbmdlZFxyXG4gICAgICAgIGlmIChwcHMuY3JlZGl0Q2FyZFR5cGUgIT09IGNyZWRpdENhcmRJbmZvLnR5cGUpIHtcclxuICAgICAgICAgICAgcHBzLmNyZWRpdENhcmRUeXBlID0gY3JlZGl0Q2FyZEluZm8udHlwZTtcclxuXHJcbiAgICAgICAgICAgIHBwcy5vbkNyZWRpdENhcmRUeXBlQ2hhbmdlZC5jYWxsKG93bmVyLCBwcHMuY3JlZGl0Q2FyZFR5cGUpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlVmFsdWVTdGF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3ZhbHVlOiB0aGlzLnByb3BlcnRpZXMucmVzdWx0fSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBvd25lciA9IHRoaXM7XHJcblxyXG4gICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIHsuLi5vd25lci5zdGF0ZS5vdGhlcn1cclxuICAgICAgICAgICAgICAgICAgIHZhbHVlPXtvd25lci5zdGF0ZS52YWx1ZX1cclxuICAgICAgICAgICAgICAgICAgIG9uS2V5RG93bj17b3duZXIub25LZXlEb3dufVxyXG4gICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e293bmVyLm9uQ2hhbmdlfS8+XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy5DbGVhdmUgPSBDbGVhdmU7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbi8qKlxyXG4gKiBQcm9wcyBBc3NpZ25tZW50XHJcbiAqXHJcbiAqIFNlcGFyYXRlIHRoaXMsIHNvIHJlYWN0IG1vZHVsZSBjYW4gc2hhcmUgdGhlIHVzYWdlXHJcbiAqL1xyXG52YXIgRGVmYXVsdFByb3BlcnRpZXMgPSB7XHJcbiAgICAvLyBNYXliZSBjaGFuZ2UgdG8gb2JqZWN0LWFzc2lnblxyXG4gICAgLy8gZm9yIG5vdyBqdXN0IGtlZXAgaXQgYXMgc2ltcGxlXHJcbiAgICBhc3NpZ246IGZ1bmN0aW9uICh0YXJnZXQsIG9wdHMpIHtcclxuICAgICAgICB0YXJnZXQgPSB0YXJnZXQgfHwge307XHJcbiAgICAgICAgb3B0cyA9IG9wdHMgfHwge307XHJcblxyXG4gICAgICAgIC8vIGNyZWRpdCBjYXJkXHJcbiAgICAgICAgdGFyZ2V0LmNyZWRpdENhcmQgPSAhIW9wdHMuY3JlZGl0Q2FyZDtcclxuICAgICAgICB0YXJnZXQuY3JlZGl0Q2FyZFN0cmljdE1vZGUgPSAhIW9wdHMuY3JlZGl0Q2FyZFN0cmljdE1vZGU7XHJcbiAgICAgICAgdGFyZ2V0LmNyZWRpdENhcmRUeXBlID0gJyc7XHJcbiAgICAgICAgdGFyZ2V0Lm9uQ3JlZGl0Q2FyZFR5cGVDaGFuZ2VkID0gb3B0cy5vbkNyZWRpdENhcmRUeXBlQ2hhbmdlZCB8fCAoZnVuY3Rpb24gKCkge30pO1xyXG5cclxuICAgICAgICAvLyBwaG9uZVxyXG4gICAgICAgIHRhcmdldC5waG9uZSA9ICEhb3B0cy5waG9uZTtcclxuICAgICAgICB0YXJnZXQucGhvbmVSZWdpb25Db2RlID0gb3B0cy5waG9uZVJlZ2lvbkNvZGUgfHwgJ0FVJztcclxuICAgICAgICB0YXJnZXQucGhvbmVGb3JtYXR0ZXIgPSB7fTtcclxuXHJcbiAgICAgICAgLy8gZGF0ZVxyXG4gICAgICAgIHRhcmdldC5kYXRlID0gISFvcHRzLmRhdGU7XHJcbiAgICAgICAgdGFyZ2V0LmRhdGVQYXR0ZXJuID0gb3B0cy5kYXRlUGF0dGVybiB8fCBbJ2QnLCAnbScsICdZJ107XHJcbiAgICAgICAgdGFyZ2V0LmRhdGVGb3JtYXR0ZXIgPSB7fTtcclxuXHJcbiAgICAgICAgLy8gbnVtZXJhbFxyXG4gICAgICAgIHRhcmdldC5udW1lcmFsID0gISFvcHRzLm51bWVyYWw7XHJcbiAgICAgICAgdGFyZ2V0Lm51bWVyYWxEZWNpbWFsU2NhbGUgPSBvcHRzLm51bWVyYWxEZWNpbWFsU2NhbGUgPT09IDAgPyAwIDogb3B0cy5udW1lcmFsRGVjaW1hbFNjYWxlIHx8IDI7XHJcbiAgICAgICAgdGFyZ2V0Lm51bWVyYWxEZWNpbWFsTWFyayA9IG9wdHMubnVtZXJhbERlY2ltYWxNYXJrIHx8ICcuJztcclxuICAgICAgICB0YXJnZXQubnVtZXJhbFRob3VzYW5kc0dyb3VwU3R5bGUgPSBvcHRzLm51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlIHx8ICd0aG91c2FuZCc7XHJcblxyXG4gICAgICAgIC8vIG90aGVyc1xyXG4gICAgICAgIHRhcmdldC5udW1lcmljT25seSA9IHRhcmdldC5jcmVkaXRDYXJkIHx8IHRhcmdldC5kYXRlIHx8ICEhb3B0cy5udW1lcmljT25seTtcclxuXHJcbiAgICAgICAgdGFyZ2V0LnVwcGVyY2FzZSA9ICEhb3B0cy51cHBlcmNhc2U7XHJcbiAgICAgICAgdGFyZ2V0Lmxvd2VyY2FzZSA9ICEhb3B0cy5sb3dlcmNhc2U7XHJcblxyXG4gICAgICAgIHRhcmdldC5wcmVmaXggPSAodGFyZ2V0LmNyZWRpdENhcmQgfHwgdGFyZ2V0LnBob25lIHx8IHRhcmdldC5kYXRlKSA/ICcnIDogKG9wdHMucHJlZml4IHx8ICcnKTtcclxuICAgICAgICB0YXJnZXQucHJlZml4TGVuZ3RoID0gdGFyZ2V0LnByZWZpeC5sZW5ndGg7XHJcblxyXG4gICAgICAgIHRhcmdldC5pbml0VmFsdWUgPSBvcHRzLmluaXRWYWx1ZSB8fCAnJztcclxuXHJcbiAgICAgICAgdGFyZ2V0LmRlbGltaXRlciA9XHJcbiAgICAgICAgICAgIChvcHRzLmRlbGltaXRlciB8fCBvcHRzLmRlbGltaXRlciA9PT0gJycpID8gb3B0cy5kZWxpbWl0ZXIgOlxyXG4gICAgICAgICAgICAgICAgKG9wdHMuZGF0ZSA/ICcvJyA6XHJcbiAgICAgICAgICAgICAgICAgICAgKG9wdHMubnVtZXJhbCA/ICcsJyA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChvcHRzLnBob25lID8gJyAnIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgJykpKTtcclxuICAgICAgICB0YXJnZXQuZGVsaW1pdGVyUkUgPSBuZXcgUmVnRXhwKCdcXFxcJyArICh0YXJnZXQuZGVsaW1pdGVyIHx8ICcgJyksICdnJyk7XHJcblxyXG4gICAgICAgIHRhcmdldC5ibG9ja3MgPSBvcHRzLmJsb2NrcyB8fCBbXTtcclxuICAgICAgICB0YXJnZXQuYmxvY2tzTGVuZ3RoID0gdGFyZ2V0LmJsb2Nrcy5sZW5ndGg7XHJcblxyXG4gICAgICAgIHRhcmdldC5tYXhMZW5ndGggPSAwO1xyXG5cclxuICAgICAgICB0YXJnZXQuYmFja3NwYWNlID0gZmFsc2U7XHJcbiAgICAgICAgdGFyZ2V0LnJlc3VsdCA9ICcnO1xyXG5cclxuICAgICAgICByZXR1cm4gdGFyZ2V0O1xyXG4gICAgfVxyXG59O1xyXG5cclxuaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcclxuICAgIG1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IERlZmF1bHRQcm9wZXJ0aWVzO1xyXG59XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBDcmVkaXRDYXJkRGV0ZWN0b3IgPSB7XHJcbiAgICBibG9ja3M6IHtcclxuICAgICAgICB1YXRwOiAgICAgICAgICBbNCwgNSwgNl0sXHJcbiAgICAgICAgYW1leDogICAgICAgICAgWzQsIDYsIDVdLFxyXG4gICAgICAgIGRpbmVyczogICAgICAgIFs0LCA2LCA0XSxcclxuICAgICAgICBkaXNjb3ZlcjogICAgICBbNCwgNCwgNCwgNF0sXHJcbiAgICAgICAgbWFzdGVyY2FyZDogICAgWzQsIDQsIDQsIDRdLFxyXG4gICAgICAgIGRhbmtvcnQ6ICAgICAgIFs0LCA0LCA0LCA0XSxcclxuICAgICAgICBpbnN0YXBheW1lbnQ6ICBbNCwgNCwgNCwgNF0sXHJcbiAgICAgICAgamNiOiAgICAgICAgICAgWzQsIDQsIDQsIDRdLFxyXG4gICAgICAgIHZpc2E6ICAgICAgICAgIFs0LCA0LCA0LCA0XSxcclxuICAgICAgICBnZW5lcmFsTG9vc2U6ICBbNCwgNCwgNCwgNF0sXHJcbiAgICAgICAgZ2VuZXJhbFN0cmljdDogWzQsIDQsIDQsIDddXHJcbiAgICB9LFxyXG5cclxuICAgIHJlOiB7XHJcbiAgICAgICAgLy8gc3RhcnRzIHdpdGggMTsgMTUgZGlnaXRzLCBub3Qgc3RhcnRzIHdpdGggMTgwMCAoamNiIGNhcmQpXHJcbiAgICAgICAgdWF0cDogL14oPyExODAwKTFcXGR7MCwxNH0vLFxyXG5cclxuICAgICAgICAvLyBzdGFydHMgd2l0aCAzNC8zNzsgMTUgZGlnaXRzXHJcbiAgICAgICAgYW1leDogL14zWzQ3XVxcZHswLDEzfS8sXHJcblxyXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDYwMTEvNjUvNjQ0LTY0OTsgMTYgZGlnaXRzXHJcbiAgICAgICAgZGlzY292ZXI6IC9eKD86NjAxMXw2NVxcZHswLDJ9fDY0WzQtOV1cXGQ/KVxcZHswLDEyfS8sXHJcblxyXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDMwMC0zMDUvMzA5IG9yIDM2LzM4LzM5OyAxNCBkaWdpdHNcclxuICAgICAgICBkaW5lcnM6IC9eMyg/OjAoWzAtNV18OSl8WzY4OV1cXGQ/KVxcZHswLDExfS8sXHJcblxyXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDUxLTU1LzIyLTI3OyAxNiBkaWdpdHNcclxuICAgICAgICBtYXN0ZXJjYXJkOiAvXig1WzEtNV18MlsyLTddKVxcZHswLDE0fS8sXHJcblxyXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDUwMTkvNDE3NS80NTcxOyAxNiBkaWdpdHNcclxuICAgICAgICBkYW5rb3J0OiAvXig1MDE5fDQxNzV8NDU3MSlcXGR7MCwxMn0vLFxyXG5cclxuICAgICAgICAvLyBzdGFydHMgd2l0aCA2MzctNjM5OyAxNiBkaWdpdHNcclxuICAgICAgICBpbnN0YXBheW1lbnQ6IC9eNjNbNy05XVxcZHswLDEzfS8sXHJcblxyXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDIxMzEvMTgwMC8zNTsgMTYgZGlnaXRzXHJcbiAgICAgICAgamNiOiAvXig/OjIxMzF8MTgwMHwzNVxcZHswLDJ9KVxcZHswLDEyfS8sXHJcblxyXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDQ7IDE2IGRpZ2l0c1xyXG4gICAgICAgIHZpc2E6IC9eNFxcZHswLDE1fS9cclxuICAgIH0sXHJcblxyXG4gICAgZ2V0SW5mbzogZnVuY3Rpb24gKHZhbHVlLCBzdHJpY3RNb2RlKSB7XHJcbiAgICAgICAgdmFyIGJsb2NrcyA9IENyZWRpdENhcmREZXRlY3Rvci5ibG9ja3MsXHJcbiAgICAgICAgICAgIHJlID0gQ3JlZGl0Q2FyZERldGVjdG9yLnJlO1xyXG5cclxuICAgICAgICAvLyBJbiB0aGVvcnksIHZpc2EgY3JlZGl0IGNhcmQgY2FuIGhhdmUgdXAgdG8gMTkgZGlnaXRzIG51bWJlci5cclxuICAgICAgICAvLyBTZXQgc3RyaWN0TW9kZSB0byB0cnVlIHdpbGwgcmVtb3ZlIHRoZSAxNiBtYXgtbGVuZ3RoIHJlc3RyYWluLFxyXG4gICAgICAgIC8vIGhvd2V2ZXIsIEkgbmV2ZXIgZm91bmQgYW55IHdlYnNpdGUgdmFsaWRhdGUgY2FyZCBudW1iZXIgbGlrZVxyXG4gICAgICAgIC8vIHRoaXMsIGhlbmNlIHByb2JhYmx5IHlvdSBkb24ndCBuZWVkIHRvIGVuYWJsZSB0aGlzIG9wdGlvbi5cclxuICAgICAgICBzdHJpY3RNb2RlID0gISFzdHJpY3RNb2RlO1xyXG5cclxuICAgICAgICBpZiAocmUuYW1leC50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogICAnYW1leCcsXHJcbiAgICAgICAgICAgICAgICBibG9ja3M6IGJsb2Nrcy5hbWV4XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIGlmIChyZS51YXRwLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAgICd1YXRwJyxcclxuICAgICAgICAgICAgICAgIGJsb2NrczogYmxvY2tzLnVhdHBcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGVsc2UgaWYgKHJlLmRpbmVycy50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogICAnZGluZXJzJyxcclxuICAgICAgICAgICAgICAgIGJsb2NrczogYmxvY2tzLmRpbmVyc1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSBpZiAocmUuZGlzY292ZXIudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICAgJ2Rpc2NvdmVyJyxcclxuICAgICAgICAgICAgICAgIGJsb2NrczogYmxvY2tzLmRpc2NvdmVyXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIGlmIChyZS5tYXN0ZXJjYXJkLnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAgICdtYXN0ZXJjYXJkJyxcclxuICAgICAgICAgICAgICAgIGJsb2NrczogYmxvY2tzLm1hc3RlcmNhcmRcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGVsc2UgaWYgKHJlLmRhbmtvcnQudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICAgJ2RhbmtvcnQnLFxyXG4gICAgICAgICAgICAgICAgYmxvY2tzOiBibG9ja3MuZGFua29ydFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSBpZiAocmUuaW5zdGFwYXltZW50LnRlc3QodmFsdWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAgICdpbnN0YXBheW1lbnQnLFxyXG4gICAgICAgICAgICAgICAgYmxvY2tzOiBibG9ja3MuaW5zdGFwYXltZW50XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIGlmIChyZS5qY2IudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICAgJ2pjYicsXHJcbiAgICAgICAgICAgICAgICBibG9ja3M6IGJsb2Nrcy5qY2JcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9IGVsc2UgaWYgKHJlLnZpc2EudGVzdCh2YWx1ZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICAgJ3Zpc2EnLFxyXG4gICAgICAgICAgICAgICAgYmxvY2tzOiBibG9ja3MudmlzYVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc3RyaWN0TW9kZSkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogICAndW5rbm93bicsXHJcbiAgICAgICAgICAgICAgICBibG9ja3M6IGJsb2Nrcy5nZW5lcmFsU3RyaWN0XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICAgJ3Vua25vd24nLFxyXG4gICAgICAgICAgICAgICAgYmxvY2tzOiBibG9ja3MuZ2VuZXJhbExvb3NlXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcclxuICAgIG1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IENyZWRpdENhcmREZXRlY3RvcjtcclxufVxyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgRGF0ZUZvcm1hdHRlciA9IGZ1bmN0aW9uIChkYXRlUGF0dGVybikge1xyXG4gICAgdmFyIG93bmVyID0gdGhpcztcclxuXHJcbiAgICBvd25lci5ibG9ja3MgPSBbXTtcclxuICAgIG93bmVyLmRhdGVQYXR0ZXJuID0gZGF0ZVBhdHRlcm47XHJcbiAgICBvd25lci5pbml0QmxvY2tzKCk7XHJcbn07XHJcblxyXG5EYXRlRm9ybWF0dGVyLnByb3RvdHlwZSA9IHtcclxuICAgIGluaXRCbG9ja3M6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgb3duZXIgPSB0aGlzO1xyXG4gICAgICAgIG93bmVyLmRhdGVQYXR0ZXJuLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gJ1knKSB7XHJcbiAgICAgICAgICAgICAgICBvd25lci5ibG9ja3MucHVzaCg0KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG93bmVyLmJsb2Nrcy5wdXNoKDIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldEJsb2NrczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmJsb2NrcztcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0VmFsaWRhdGVkRGF0ZTogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcmVzdWx0ID0gJyc7XHJcblxyXG4gICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvW15cXGRdL2csICcnKTtcclxuXHJcbiAgICAgICAgb3duZXIuYmxvY2tzLmZvckVhY2goZnVuY3Rpb24gKGxlbmd0aCwgaW5kZXgpIHtcclxuICAgICAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHZhciBzdWIgPSB2YWx1ZS5zbGljZSgwLCBsZW5ndGgpLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3QgPSB2YWx1ZS5zbGljZShsZW5ndGgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHN3aXRjaCAob3duZXIuZGF0ZVBhdHRlcm5baW5kZXhdKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdkJzpcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyc2VJbnQoc3ViLCAxMCkgPiAzMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdWIgPSAnMzEnO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyc2VJbnQoc3ViLCAxMCkgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9zdWIgPSAnMDEnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgJ20nOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJzZUludChzdWIsIDEwKSA+IDEyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YiA9ICcxMic7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXJzZUludChzdWIsIDEwKSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL3N1YiA9ICcwMSc7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBzdWI7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gdXBkYXRlIHJlbWFpbmluZyBzdHJpbmdcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gcmVzdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgfVxyXG59O1xyXG5cclxuaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcclxuICAgIG1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IERhdGVGb3JtYXR0ZXI7XHJcbn1cclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyIE51bWVyYWxGb3JtYXR0ZXIgPSBmdW5jdGlvbiAobnVtZXJhbERlY2ltYWxNYXJrLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudW1lcmFsRGVjaW1hbFNjYWxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsaW1pdGVyKSB7XHJcbiAgICB2YXIgb3duZXIgPSB0aGlzO1xyXG5cclxuICAgIG93bmVyLm51bWVyYWxEZWNpbWFsTWFyayA9IG51bWVyYWxEZWNpbWFsTWFyayB8fCAnLic7XHJcbiAgICBvd25lci5udW1lcmFsRGVjaW1hbFNjYWxlID0gbnVtZXJhbERlY2ltYWxTY2FsZSA9PT0gMCA/IDAgOiBudW1lcmFsRGVjaW1hbFNjYWxlIHx8IDI7XHJcbiAgICBvd25lci5udW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSA9IG51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlIHx8IE51bWVyYWxGb3JtYXR0ZXIuZ3JvdXBTdHlsZS50aG91c2FuZDtcclxuICAgIG93bmVyLmRlbGltaXRlciA9IChkZWxpbWl0ZXIgfHwgZGVsaW1pdGVyID09PSAnJykgPyBkZWxpbWl0ZXIgOiAnLCc7XHJcbiAgICBvd25lci5kZWxpbWl0ZXJSRSA9IGRlbGltaXRlciA/IG5ldyBSZWdFeHAoJ1xcXFwnICsgZGVsaW1pdGVyLCAnZycpIDogJyc7XHJcbn07XHJcblxyXG5OdW1lcmFsRm9ybWF0dGVyLmdyb3VwU3R5bGUgPSB7XHJcbiAgICB0aG91c2FuZDogJ3Rob3VzYW5kJyxcclxuICAgIGxha2g6ICAgICAnbGFraCcsXHJcbiAgICB3YW46ICAgICAgJ3dhbidcclxufTtcclxuXHJcbk51bWVyYWxGb3JtYXR0ZXIucHJvdG90eXBlID0ge1xyXG4gICAgZ2V0UmF3VmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKHRoaXMuZGVsaW1pdGVyUkUsICcnKS5yZXBsYWNlKHRoaXMubnVtZXJhbERlY2ltYWxNYXJrLCAnLicpO1xyXG4gICAgfSxcclxuXHJcbiAgICBmb3JtYXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHBhcnRzLCBwYXJ0SW50ZWdlciwgcGFydERlY2ltYWwgPSAnJztcclxuXHJcbiAgICAgICAgLy8gc3RyaXAgYWxwaGFiZXQgbGV0dGVyc1xyXG4gICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvW0EtWmEtel0vZywgJycpXHJcblxyXG4gICAgICAgICAgICAvLyByZXBsYWNlIHRoZSBmaXJzdCBkZWNpbWFsIG1hcmsgd2l0aCByZXNlcnZlZCBwbGFjZWhvbGRlclxyXG4gICAgICAgICAgICAucmVwbGFjZShvd25lci5udW1lcmFsRGVjaW1hbE1hcmssICdNJylcclxuXHJcbiAgICAgICAgICAgIC8vIHN0cmlwIHRoZSBub24gbnVtZXJpYyBsZXR0ZXJzIGV4Y2VwdCBNXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC9bXlxcZE1dL2csICcnKVxyXG5cclxuICAgICAgICAgICAgLy8gcmVwbGFjZSBtYXJrXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKCdNJywgb3duZXIubnVtZXJhbERlY2ltYWxNYXJrKVxyXG5cclxuICAgICAgICAgICAgLy8gc3RyaXAgbGVhZGluZyAwXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKC9eKC0pPzArKD89XFxkKS8sICckMScpO1xyXG5cclxuICAgICAgICBwYXJ0SW50ZWdlciA9IHZhbHVlO1xyXG5cclxuICAgICAgICBpZiAodmFsdWUuaW5kZXhPZihvd25lci5udW1lcmFsRGVjaW1hbE1hcmspID49IDApIHtcclxuICAgICAgICAgICAgcGFydHMgPSB2YWx1ZS5zcGxpdChvd25lci5udW1lcmFsRGVjaW1hbE1hcmspO1xyXG4gICAgICAgICAgICBwYXJ0SW50ZWdlciA9IHBhcnRzWzBdO1xyXG4gICAgICAgICAgICBpZihvd25lci5udW1lcmFsRGVjaW1hbFNjYWxlID4gMClcclxuICAgICAgICAgICAgICAgIHBhcnREZWNpbWFsID0gb3duZXIubnVtZXJhbERlY2ltYWxNYXJrICsgcGFydHNbMV0uc2xpY2UoMCwgb3duZXIubnVtZXJhbERlY2ltYWxTY2FsZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzd2l0Y2ggKG93bmVyLm51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlKSB7XHJcbiAgICAgICAgY2FzZSBOdW1lcmFsRm9ybWF0dGVyLmdyb3VwU3R5bGUubGFraDpcclxuICAgICAgICAgICAgcGFydEludGVnZXIgPSBwYXJ0SW50ZWdlci5yZXBsYWNlKC8oXFxkKSg/PShcXGRcXGQpK1xcZCQpL2csICckMScgKyBvd25lci5kZWxpbWl0ZXIpO1xyXG5cclxuICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGNhc2UgTnVtZXJhbEZvcm1hdHRlci5ncm91cFN0eWxlLndhbjpcclxuICAgICAgICAgICAgcGFydEludGVnZXIgPSBwYXJ0SW50ZWdlci5yZXBsYWNlKC8oXFxkKSg/PShcXGR7NH0pKyQpL2csICckMScgKyBvd25lci5kZWxpbWl0ZXIpO1xyXG5cclxuICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHBhcnRJbnRlZ2VyID0gcGFydEludGVnZXIucmVwbGFjZSgvKFxcZCkoPz0oXFxkezN9KSskKS9nLCAnJDEnICsgb3duZXIuZGVsaW1pdGVyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBwYXJ0SW50ZWdlci50b1N0cmluZygpICsgcGFydERlY2ltYWwudG9TdHJpbmcoKTtcclxuICAgIH1cclxufTtcclxuXHJcbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBOdW1lcmFsRm9ybWF0dGVyO1xyXG59XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBQaG9uZUZvcm1hdHRlciA9IGZ1bmN0aW9uIChmb3JtYXR0ZXIsIGRlbGltaXRlcikge1xyXG4gICAgdmFyIG93bmVyID0gdGhpcztcclxuXHJcbiAgICBvd25lci5kZWxpbWl0ZXIgPSAoZGVsaW1pdGVyIHx8IGRlbGltaXRlciA9PT0gJycpID8gZGVsaW1pdGVyIDogJyAnO1xyXG4gICAgb3duZXIuZGVsaW1pdGVyUkUgPSBkZWxpbWl0ZXIgPyBuZXcgUmVnRXhwKCdcXFxcJyArIGRlbGltaXRlciwgJ2cnKSA6ICcnO1xyXG5cclxuICAgIG93bmVyLmZvcm1hdHRlciA9IGZvcm1hdHRlcjtcclxufTtcclxuXHJcblBob25lRm9ybWF0dGVyLnByb3RvdHlwZSA9IHtcclxuICAgIHNldEZvcm1hdHRlcjogZnVuY3Rpb24gKGZvcm1hdHRlcikge1xyXG4gICAgICAgIHRoaXMuZm9ybWF0dGVyID0gZm9ybWF0dGVyO1xyXG4gICAgfSxcclxuXHJcbiAgICBmb3JtYXQ6IGZ1bmN0aW9uIChwaG9uZU51bWJlcikge1xyXG4gICAgICAgIHZhciBvd25lciA9IHRoaXM7XHJcblxyXG4gICAgICAgIG93bmVyLmZvcm1hdHRlci5jbGVhcigpO1xyXG5cclxuICAgICAgICAvLyBvbmx5IGtlZXAgbnVtYmVyIGFuZCArXHJcbiAgICAgICAgcGhvbmVOdW1iZXIgPSBwaG9uZU51bWJlci5yZXBsYWNlKC9bXlxcZCtdL2csICcnKTtcclxuXHJcbiAgICAgICAgLy8gc3RyaXAgZGVsaW1pdGVyXHJcbiAgICAgICAgcGhvbmVOdW1iZXIgPSBwaG9uZU51bWJlci5yZXBsYWNlKG93bmVyLmRlbGltaXRlclJFLCAnJyk7XHJcblxyXG4gICAgICAgIHZhciByZXN1bHQgPSAnJywgY3VycmVudCwgdmFsaWRhdGVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBpTWF4ID0gcGhvbmVOdW1iZXIubGVuZ3RoOyBpIDwgaU1heDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGN1cnJlbnQgPSBvd25lci5mb3JtYXR0ZXIuaW5wdXREaWdpdChwaG9uZU51bWJlci5jaGFyQXQoaSkpO1xyXG5cclxuICAgICAgICAgICAgLy8gaGFzICgpLSBvciBzcGFjZSBpbnNpZGVcclxuICAgICAgICAgICAgaWYgKC9bXFxzKCktXS9nLnRlc3QoY3VycmVudCkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGN1cnJlbnQ7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFsaWRhdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICghdmFsaWRhdGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gY3VycmVudDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIGVsc2U6IG92ZXIgbGVuZ3RoIGlucHV0XHJcbiAgICAgICAgICAgICAgICAvLyBpdCB0dXJucyB0byBpbnZhbGlkIG51bWJlciBhZ2FpblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBzdHJpcCAoKVxyXG4gICAgICAgIC8vIGUuZy4gVVM6IDcxNjEyMzQ1NjcgcmV0dXJucyAoNzE2KSAxMjMtNDU2N1xyXG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKC9bKCldL2csICcnKTtcclxuICAgICAgICAvLyByZXBsYWNlIGxpYnJhcnkgZGVsaW1pdGVyIHdpdGggdXNlciBjdXN0b21pemVkIGRlbGltaXRlclxyXG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKC9bXFxzLV0vZywgb3duZXIuZGVsaW1pdGVyKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgIH1cclxufTtcclxuXHJcbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBQaG9uZUZvcm1hdHRlcjtcclxufVxyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgVXRpbCA9IHtcclxuICAgIG5vb3A6IGZ1bmN0aW9uICgpIHtcclxuICAgIH0sXHJcblxyXG4gICAgc3RyaXA6IGZ1bmN0aW9uICh2YWx1ZSwgcmUpIHtcclxuICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZShyZSwgJycpO1xyXG4gICAgfSxcclxuXHJcbiAgICBoZWFkU3RyOiBmdW5jdGlvbiAoc3RyLCBsZW5ndGgpIHtcclxuICAgICAgICByZXR1cm4gc3RyLnNsaWNlKDAsIGxlbmd0aCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldE1heExlbmd0aDogZnVuY3Rpb24gKGJsb2Nrcykge1xyXG4gICAgICAgIHJldHVybiBibG9ja3MucmVkdWNlKGZ1bmN0aW9uIChwcmV2aW91cywgY3VycmVudCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcHJldmlvdXMgKyBjdXJyZW50O1xyXG4gICAgICAgIH0sIDApO1xyXG4gICAgfSxcclxuXHJcbiAgICAvLyBzdHJpcCB2YWx1ZSBieSBwcmVmaXggbGVuZ3RoXHJcbiAgICAvLyBmb3IgcHJlZml4OiBQUkVcclxuICAgIC8vIChQUkUxMjMsIDMpIC0+IDEyM1xyXG4gICAgLy8gKFBSMTIzLCAzKSAtPiAyMyB0aGlzIGhhcHBlbnMgd2hlbiB1c2VyIGhpdHMgYmFja3NwYWNlIGluIGZyb250IG9mIFwiUFJFXCJcclxuICAgIGdldFByZWZpeFN0cmlwcGVkVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSwgcHJlZml4TGVuZ3RoKSB7XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlLnNsaWNlKHByZWZpeExlbmd0aCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGdldEZvcm1hdHRlZFZhbHVlOiBmdW5jdGlvbiAodmFsdWUsIGJsb2NrcywgYmxvY2tzTGVuZ3RoLCBkZWxpbWl0ZXIpIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gJyc7XHJcblxyXG4gICAgICAgIGJsb2Nrcy5mb3JFYWNoKGZ1bmN0aW9uIChsZW5ndGgsIGluZGV4KSB7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3ViID0gdmFsdWUuc2xpY2UoMCwgbGVuZ3RoKSxcclxuICAgICAgICAgICAgICAgICAgICByZXN0ID0gdmFsdWUuc2xpY2UobGVuZ3RoKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gc3ViO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzdWIubGVuZ3RoID09PSBsZW5ndGggJiYgaW5kZXggPCBibG9ja3NMZW5ndGggLSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9IGRlbGltaXRlcjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyB1cGRhdGUgcmVtYWluaW5nIHN0cmluZ1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSByZXN0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbn07XHJcblxyXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gVXRpbDtcclxufVxyXG4iXX0=
