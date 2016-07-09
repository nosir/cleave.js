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
        var onKeydown = _owner$props.onKeydown;
        var onChange = _owner$props.onChange;

        var other = _objectWithoutProperties(_owner$props, ['value', 'options', 'onKeydown', 'onChange']);

        owner.registeredEvents = {
            onChange: onChange || Util.noop,
            onKeydown: onKeydown || Util.noop
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
        if (!pps.numeral && !pps.phone && !pps.creditCard && !pps.date && pps.blocks.length === 0) {
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

    onKeydown: function onKeydown(event) {
        var owner = this,
            pps = owner.properties,
            charCode = event.which || event.keyCode;

        // hit backspace when last character is delimiter
        if (charCode === 8 && pps.result.slice(-1) === pps.delimiter) {
            pps.backspace = true;
        } else {
            pps.backspace = false;
        }

        owner.registeredEvents.onKeydown(event);
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
            pps.blocks = CreditCardDetector.getBlocksByPAN(value, pps.creditCardStrictMode);
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

    updateValueState: function updateValueState() {
        this.setState({ value: this.properties.result });
    },

    render: function render() {
        var owner = this;

        return React.createElement('input', _extends({ type: 'text' }, owner.state.other, {
            value: owner.state.value,
            onKeydown: owner.onKeydown,
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
        mastercard: [4, 4, 4, 4],
        dankort: [4, 4, 4, 4],
        instapayment: [4, 4, 4, 4],
        jcb: [4, 4, 4, 4],
        generalStrict: [4, 4, 4, 7],
        generalLoose: [4, 4, 4, 4]
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

    getBlocksByPAN: function getBlocksByPAN(value, strictMode) {
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

        return result;
    }
};

if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && _typeof(module.exports) === 'object') {
    module.exports = exports = Util;
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZWFjdC5qcyIsInNyYy9DbGVhdmUucmVhY3QuanMiLCJzcmMvY29tbW9uL0RlZmF1bHRQcm9wZXJ0aWVzLmpzIiwic3JjL3Nob3J0Y3V0cy9DcmVkaXRDYXJkRGV0ZWN0b3IuanMiLCJzcmMvc2hvcnRjdXRzL0RhdGVGb3JtYXR0ZXIuanMiLCJzcmMvc2hvcnRjdXRzL051bWVyYWxGb3JtYXR0ZXIuanMiLCJzcmMvc2hvcnRjdXRzL1Bob25lRm9ybWF0dGVyLmpzIiwic3JjL3V0aWxzL1V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQTs7Ozs7Ozs7OztBQ0FBOzs7Ozs7QUFFQSxJQUFJLFFBQVEsUUFBUSxPQUFSLENBQVo7O0FBRUEsSUFBSSxtQkFBbUIsUUFBUSw4QkFBUixDQUF2QjtBQUNBLElBQUksZ0JBQWdCLFFBQVEsMkJBQVIsQ0FBcEI7QUFDQSxJQUFJLGlCQUFpQixRQUFRLDRCQUFSLENBQXJCO0FBQ0EsSUFBSSxxQkFBcUIsUUFBUSxnQ0FBUixDQUF6QjtBQUNBLElBQUksT0FBTyxRQUFRLGNBQVIsQ0FBWDtBQUNBLElBQUksb0JBQW9CLFFBQVEsNEJBQVIsQ0FBeEI7O0FBRUEsSUFBSSxTQUFTLE1BQU0sV0FBTixDQUFrQjtBQUFBOztBQUMzQix1QkFBbUIsNkJBQVk7QUFDM0IsYUFBSyxJQUFMO0FBQ0gsS0FIMEI7O0FBSzNCLCtCQUEyQixtQ0FBVSxTQUFWLEVBQXFCO0FBQzVDLFlBQUksUUFBUSxJQUFaO0FBQUEsWUFDSSxrQkFBa0IsVUFBVSxPQUFWLENBQWtCLGVBRHhDOzs7QUFJQSxZQUFJLG1CQUFtQixvQkFBb0IsTUFBTSxVQUFOLENBQWlCLGVBQTVELEVBQTZFO0FBQ3pFLGtCQUFNLFVBQU4sQ0FBaUIsZUFBakIsR0FBbUMsZUFBbkM7QUFDQSxrQkFBTSxrQkFBTjtBQUNBLGtC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OztBQUVBLGVBQU8sT0FBUCxDQUFlLFVBQVUsTUFBVixFQUFrQixLQUFsQixFQUF5QjtBQUNwQyxnQkFBSSxNQUFNLE1BQU4sR0FBZSxDQUFuQixFQUFzQjtBQUNsQixvQkFBSSxNQUFNLE1BQU0sS0FBTixDQUFZLENBQVosRUFBZSxNQUFmLENBQVY7QUFBQSxvQkFDSSxPQUFPLE1BQU0sS0FBTixDQUFZLE1BQVosQ0FEWDs7QUFHQSwwQkFBVSxHQUFWOztBQUVBLG9CQUFJLElBQUksTUFBSixLQUFlLE1BQWYsSUFBeUIsUUFBUSxlQUFlLENBQXBELEVBQXVEO0FBQ25ELDhCQUFVLFNBQVY7QUFDSDs7O0FBR0Qsd0JBQVEsSUFBUjtBQUNIO0FBQ0osU0FkRDs7QUFnQkEsZUFBTyxNQUFQO0FBQ0g7QUF6RE0sQ0FBWDs7QUE0REEsSUFBSSxRQUFPLE1BQVAseUNBQU8sTUFBUCxPQUFrQixRQUFsQixJQUE4QixRQUFPLE9BQU8sT0FBZCxNQUEwQixRQUE1RCxFQUFzRTtBQUNsRSxXQUFPLE9BQVAsR0FBaUIsVUFBVSxJQUEzQjtBQUNIIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCBDbGVhdmUgZnJvbSAnLi9zcmMvQ2xlYXZlLnJlYWN0JztcblxuZXhwb3J0IGRlZmF1bHQgQ2xlYXZlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG52YXIgTnVtZXJhbEZvcm1hdHRlciA9IHJlcXVpcmUoJy4vc2hvcnRjdXRzL051bWVyYWxGb3JtYXR0ZXInKTtcbnZhciBEYXRlRm9ybWF0dGVyID0gcmVxdWlyZSgnLi9zaG9ydGN1dHMvRGF0ZUZvcm1hdHRlcicpO1xudmFyIFBob25lRm9ybWF0dGVyID0gcmVxdWlyZSgnLi9zaG9ydGN1dHMvUGhvbmVGb3JtYXR0ZXInKTtcbnZhciBDcmVkaXRDYXJkRGV0ZWN0b3IgPSByZXF1aXJlKCcuL3Nob3J0Y3V0cy9DcmVkaXRDYXJkRGV0ZWN0b3InKTtcbnZhciBVdGlsID0gcmVxdWlyZSgnLi91dGlscy9VdGlsJyk7XG52YXIgRGVmYXVsdFByb3BlcnRpZXMgPSByZXF1aXJlKCcuL2NvbW1vbi9EZWZhdWx0UHJvcGVydGllcycpO1xuXG52YXIgQ2xlYXZlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV4dFByb3BzKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICBwaG9uZVJlZ2lvbkNvZGUgPSBuZXh0UHJvcHMub3B0aW9ucy5waG9uZVJlZ2lvbkNvZGU7XG5cbiAgICAgICAgLy8gdXBkYXRlIHBob25lIHJlZ2lvbiBjb2RlXG4gICAgICAgIGlmIChwaG9uZVJlZ2lvbkNvZGUgJiYgcGhvbmVSZWdpb25Db2RlICE9PSBvd25lci5wcm9wZXJ0aWVzLnBob25lUmVnaW9uQ29kZSkge1xuICAgICAgICAgICAgb3duZXIucHJvcGVydGllcy5waG9uZVJlZ2lvbkNvZGUgPSBwaG9uZVJlZ2lvbkNvZGU7XG4gICAgICAgICAgICBvd25lci5pbml0UGhvbmVGb3JtYXR0ZXIoKTtcbiAgICAgICAgICAgIG93bmVyLm9uSW5wdXQob3duZXIucHJvcGVydGllcy5yZXN1bHQpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxuICAgICAgICAgICAgeyB2YWx1ZSwgb3B0aW9ucywgb25LZXlkb3duLCBvbkNoYW5nZSwgLi4ub3RoZXIgfSA9IG93bmVyLnByb3BzO1xuXG4gICAgICAgIG93bmVyLnJlZ2lzdGVyZWRFdmVudHMgPSB7XG4gICAgICAgICAgICBvbkNoYW5nZTogIG9uQ2hhbmdlIHx8IFV0aWwubm9vcCxcbiAgICAgICAgICAgIG9uS2V5ZG93bjogb25LZXlkb3duIHx8IFV0aWwubm9vcFxuICAgICAgICB9O1xuXG4gICAgICAgIG9wdGlvbnMuaW5pdFZhbHVlID0gdmFsdWU7XG5cbiAgICAgICAgb3duZXIucHJvcGVydGllcyA9IERlZmF1bHRQcm9wZXJ0aWVzLmFzc2lnbih7fSwgb3B0aW9ucyk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG90aGVyOiBvdGhlcixcbiAgICAgICAgICAgIHZhbHVlOiBvd25lci5wcm9wZXJ0aWVzLnJlc3VsdFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIC8vIHNvIG5vIG5lZWQgZm9yIHRoaXMgbGliIGF0IGFsbFxuICAgICAgICBpZiAoIXBwcy5udW1lcmFsICYmICFwcHMucGhvbmUgJiYgIXBwcy5jcmVkaXRDYXJkICYmICFwcHMuZGF0ZSAmJiBwcHMuYmxvY2tzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcHBzLm1heExlbmd0aCA9IFV0aWwuZ2V0TWF4TGVuZ3RoKHBwcy5ibG9ja3MpO1xuXG4gICAgICAgIG93bmVyLmluaXRQaG9uZUZvcm1hdHRlcigpO1xuICAgICAgICBvd25lci5pbml0RGF0ZUZvcm1hdHRlcigpO1xuICAgICAgICBvd25lci5pbml0TnVtZXJhbEZvcm1hdHRlcigpO1xuXG4gICAgICAgIG93bmVyLm9uSW5wdXQocHBzLmluaXRWYWx1ZSk7XG4gICAgfSxcblxuICAgIGluaXROdW1lcmFsRm9ybWF0dGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIGlmICghcHBzLm51bWVyYWwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHBwcy5udW1lcmFsRm9ybWF0dGVyID0gbmV3IE51bWVyYWxGb3JtYXR0ZXIoXG4gICAgICAgICAgICBwcHMubnVtZXJhbERlY2ltYWxNYXJrLFxuICAgICAgICAgICAgcHBzLm51bWVyYWxEZWNpbWFsU2NhbGUsXG4gICAgICAgICAgICBwcHMubnVtZXJhbFRob3VzYW5kc0dyb3VwU3R5bGUsXG4gICAgICAgICAgICBwcHMuZGVsaW1pdGVyXG4gICAgICAgICk7XG4gICAgfSxcblxuICAgIGluaXREYXRlRm9ybWF0dGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIGlmICghcHBzLmRhdGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHBwcy5kYXRlRm9ybWF0dGVyID0gbmV3IERhdGVGb3JtYXR0ZXIocHBzLmRhdGVQYXR0ZXJuKTtcbiAgICAgICAgcHBzLmJsb2NrcyA9IHBwcy5kYXRlRm9ybWF0dGVyLmdldEJsb2NrcygpO1xuICAgICAgICBwcHMuYmxvY2tzTGVuZ3RoID0gcHBzLmJsb2Nrcy5sZW5ndGg7XG4gICAgICAgIHBwcy5tYXhMZW5ndGggPSBVdGlsLmdldE1heExlbmd0aChwcHMuYmxvY2tzKTtcbiAgICB9LFxuXG4gICAgaW5pdFBob25lRm9ybWF0dGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIGlmICghcHBzLnBob25lKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDbGVhdmUuQXNZb3VUeXBlRm9ybWF0dGVyIHNob3VsZCBiZSBwcm92aWRlZCBieVxuICAgICAgICAvLyBleHRlcm5hbCBnb29nbGUgY2xvc3VyZSBsaWJcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHBwcy5waG9uZUZvcm1hdHRlciA9IG5ldyBQaG9uZUZvcm1hdHRlcihcbiAgICAgICAgICAgICAgICBuZXcgd2luZG93LkNsZWF2ZS5Bc1lvdVR5cGVGb3JtYXR0ZXIocHBzLnBob25lUmVnaW9uQ29kZSksXG4gICAgICAgICAgICAgICAgcHBzLmRlbGltaXRlclxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUGxlYXNlIGluY2x1ZGUgcGhvbmUtdHlwZS1mb3JtYXR0ZXIue2NvdW50cnl9LmpzIGxpYicpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIG9uS2V5ZG93bjogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsXG4gICAgICAgICAgICBwcHMgPSBvd25lci5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgY2hhckNvZGUgPSBldmVudC53aGljaCB8fCBldmVudC5rZXlDb2RlO1xuXG4gICAgICAgIC8vIGhpdCBiYWNrc3BhY2Ugd2hlbiBsYXN0IGNoYXJhY3RlciBpcyBkZWxpbWl0ZXJcbiAgICAgICAgaWYgKGNoYXJDb2RlID09PSA4ICYmIHBwcy5yZXN1bHQuc2xpY2UoLTEpID09PSBwcHMuZGVsaW1pdGVyKSB7XG4gICAgICAgICAgICBwcHMuYmFja3NwYWNlID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBwcy5iYWNrc3BhY2UgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIG93bmVyLnJlZ2lzdGVyZWRFdmVudHMub25LZXlkb3duKGV2ZW50KTtcbiAgICB9LFxuXG4gICAgb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwcHMgPSBvd25lci5wcm9wZXJ0aWVzO1xuXG4gICAgICAgIG93bmVyLm9uSW5wdXQoZXZlbnQudGFyZ2V0LnZhbHVlKTtcblxuICAgICAgICBldmVudC50YXJnZXQucmF3VmFsdWUgPSBVdGlsLnN0cmlwKHBwcy5yZXN1bHQsIHBwcy5kZWxpbWl0ZXJSRSk7XG5cbiAgICAgICAgb3duZXIucmVnaXN0ZXJlZEV2ZW50cy5vbkNoYW5nZShldmVudCk7XG4gICAgfSxcblxuICAgIG9uSW5wdXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwcHMgPSBvd25lci5wcm9wZXJ0aWVzLFxuICAgICAgICAgICAgcHJldiA9IHBwcy5yZXN1bHQ7XG5cbiAgICAgICAgLy8gY2FzZSAxOiBkZWxldGUgb25lIG1vcmUgY2hhcmFjdGVyIFwiNFwiXG4gICAgICAgIC8vIDEyMzQqfCAtPiBoaXQgYmFja3NwYWNlIC0+IDEyM3xcbiAgICAgICAgLy8gY2FzZSAyOiBsYXN0IGNoYXJhY3RlciBpcyBub3QgZGVsaW1pdGVyIHdoaWNoIGlzOlxuICAgICAgICAvLyAxMnwzNCogLT4gaGl0IGJhY2tzcGFjZSAtPiAxfDM0KlxuXG4gICAgICAgIGlmIChwcHMuYmFja3NwYWNlICYmIHZhbHVlLnNsaWNlKC0xKSAhPT0gcHBzLmRlbGltaXRlcikge1xuICAgICAgICAgICAgdmFsdWUgPSBVdGlsLmhlYWRTdHIodmFsdWUsIHZhbHVlLmxlbmd0aCAtIDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcGhvbmUgZm9ybWF0dGVyXG4gICAgICAgIGlmIChwcHMucGhvbmUpIHtcbiAgICAgICAgICAgIHBwcy5yZXN1bHQgPSBwcHMucGhvbmVGb3JtYXR0ZXIuZm9ybWF0KHZhbHVlKTtcbiAgICAgICAgICAgIG93bmVyLnVwZGF0ZVZhbHVlU3RhdGUoKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbnVtZXJhbCBmb3JtYXR0ZXJcbiAgICAgICAgaWYgKHBwcy5udW1lcmFsKSB7XG4gICAgICAgICAgICBwcHMucmVzdWx0ID0gcHBzLm51bWVyYWxGb3JtYXR0ZXIuZm9ybWF0KHZhbHVlKTtcbiAgICAgICAgICAgIG93bmVyLnVwZGF0ZVZhbHVlU3RhdGUoKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZGF0ZVxuICAgICAgICBpZiAocHBzLmRhdGUpIHtcbiAgICAgICAgICAgIHZhbHVlID0gcHBzLmRhdGVGb3JtYXR0ZXIuZ2V0VmFsaWRhdGVkRGF0ZSh2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzdHJpcCBkZWxpbWl0ZXJzXG4gICAgICAgIHZhbHVlID0gVXRpbC5zdHJpcCh2YWx1ZSwgcHBzLmRlbGltaXRlclJFKTtcblxuICAgICAgICAvLyBwcmVmaXhcbiAgICAgICAgdmFsdWUgPSBVdGlsLmdldFByZWZpeEFwcGxpZWRWYWx1ZSh2YWx1ZSwgcHBzLnByZWZpeCk7XG5cbiAgICAgICAgLy8gc3RyaXAgbm9uLW51bWVyaWMgY2hhcmFjdGVyc1xuICAgICAgICBpZiAocHBzLm51bWVyaWNPbmx5KSB7XG4gICAgICAgICAgICB2YWx1ZSA9IFV0aWwuc3RyaXAodmFsdWUsIC9bXlxcZF0vZyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB1cGRhdGUgY3JlZGl0IGNhcmQgYmxvY2tzXG4gICAgICAgIC8vIGFuZCBhdCBsZWFzdCBvbmUgb2YgZmlyc3QgNCBjaGFyYWN0ZXJzIGhhcyBjaGFuZ2VkXG4gICAgICAgIGlmIChwcHMuY3JlZGl0Q2FyZCAmJiBVdGlsLmhlYWRTdHIocHBzLnJlc3VsdCwgNCkgIT09IFV0aWwuaGVhZFN0cih2YWx1ZSwgNCkpIHtcbiAgICAgICAgICAgIHBwcy5ibG9ja3MgPSBDcmVkaXRDYXJkRGV0ZWN0b3IuZ2V0QmxvY2tzQnlQQU4odmFsdWUsIHBwcy5jcmVkaXRDYXJkU3RyaWN0TW9kZSk7XG4gICAgICAgICAgICBwcHMuYmxvY2tzTGVuZ3RoID0gcHBzLmJsb2Nrcy5sZW5ndGg7XG4gICAgICAgICAgICBwcHMubWF4TGVuZ3RoID0gVXRpbC5nZXRNYXhMZW5ndGgocHBzLmJsb2Nrcyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzdHJpcCBvdmVyIGxlbmd0aCBjaGFyYWN0ZXJzXG4gICAgICAgIHZhbHVlID0gVXRpbC5oZWFkU3RyKHZhbHVlLCBwcHMubWF4TGVuZ3RoKTtcblxuICAgICAgICAvLyBjb252ZXJ0IGNhc2VcbiAgICAgICAgdmFsdWUgPSBwcHMudXBwZXJjYXNlID8gdmFsdWUudG9VcHBlckNhc2UoKSA6IHZhbHVlO1xuICAgICAgICB2YWx1ZSA9IHBwcy5sb3dlcmNhc2UgPyB2YWx1ZS50b0xvd2VyQ2FzZSgpIDogdmFsdWU7XG5cbiAgICAgICAgLy8gYXBwbHkgYmxvY2tzXG4gICAgICAgIHBwcy5yZXN1bHQgPSBVdGlsLmdldEZvcm1hdHRlZFZhbHVlKHZhbHVlLCBwcHMuYmxvY2tzLCBwcHMuYmxvY2tzTGVuZ3RoLCBwcHMuZGVsaW1pdGVyKTtcblxuICAgICAgICAvLyBub3RoaW5nIGNoYW5nZWRcbiAgICAgICAgLy8gcHJldmVudCB1cGRhdGUgdmFsdWUgdG8gYXZvaWQgY2FyZXQgcG9zaXRpb24gY2hhbmdlXG4gICAgICAgIGlmIChwcmV2ID09PSBwcHMucmVzdWx0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBvd25lci51cGRhdGVWYWx1ZVN0YXRlKCk7XG4gICAgfSxcblxuICAgIHVwZGF0ZVZhbHVlU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dmFsdWU6IHRoaXMucHJvcGVydGllcy5yZXN1bHR9KTtcbiAgICB9LFxuXG4gICAgcmVuZGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXM7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIHsuLi5vd25lci5zdGF0ZS5vdGhlcn1cbiAgICAgICAgICAgICAgICAgICB2YWx1ZT17b3duZXIuc3RhdGUudmFsdWV9XG4gICAgICAgICAgICAgICAgICAgb25LZXlkb3duPXtvd25lci5vbktleWRvd259XG4gICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e293bmVyLm9uQ2hhbmdlfS8+XG4gICAgICAgICk7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gd2luZG93LkNsZWF2ZSA9IENsZWF2ZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBQcm9wcyBBc3NpZ25tZW50XG4gKlxuICogU2VwYXJhdGUgdGhpcywgc28gcmVhY3QgbW9kdWxlIGNhbiBzaGFyZSB0aGUgdXNhZ2VcbiAqL1xudmFyIERlZmF1bHRQcm9wZXJ0aWVzID0ge1xuICAgIC8vIE1heWJlIGNoYW5nZSB0byBvYmplY3QtYXNzaWduXG4gICAgLy8gZm9yIG5vdyBqdXN0IGtlZXAgaXQgYXMgc2ltcGxlXG4gICAgYXNzaWduOiBmdW5jdGlvbiAodGFyZ2V0LCBvcHRzKSB7XG4gICAgICAgIHRhcmdldCA9IHRhcmdldCB8fCB7fTtcbiAgICAgICAgb3B0cyA9IG9wdHMgfHwge307XG5cbiAgICAgICAgLy8gY3JlZGl0IGNhcmRcbiAgICAgICAgdGFyZ2V0LmNyZWRpdENhcmQgPSAhIW9wdHMuY3JlZGl0Q2FyZDtcbiAgICAgICAgdGFyZ2V0LmNyZWRpdENhcmRTdHJpY3RNb2RlID0gISFvcHRzLmNyZWRpdENhcmRTdHJpY3RNb2RlO1xuXG4gICAgICAgIC8vIHBob25lXG4gICAgICAgIHRhcmdldC5waG9uZSA9ICEhb3B0cy5waG9uZTtcbiAgICAgICAgdGFyZ2V0LnBob25lUmVnaW9uQ29kZSA9IG9wdHMucGhvbmVSZWdpb25Db2RlIHx8ICdBVSc7XG4gICAgICAgIHRhcmdldC5waG9uZUZvcm1hdHRlciA9IHt9O1xuXG4gICAgICAgIC8vIGRhdGVcbiAgICAgICAgdGFyZ2V0LmRhdGUgPSAhIW9wdHMuZGF0ZTtcbiAgICAgICAgdGFyZ2V0LmRhdGVQYXR0ZXJuID0gb3B0cy5kYXRlUGF0dGVybiB8fCBbJ2QnLCAnbScsICdZJ107XG4gICAgICAgIHRhcmdldC5kYXRlRm9ybWF0dGVyID0ge307XG5cbiAgICAgICAgLy8gbnVtZXJhbFxuICAgICAgICB0YXJnZXQubnVtZXJhbCA9ICEhb3B0cy5udW1lcmFsO1xuICAgICAgICB0YXJnZXQubnVtZXJhbERlY2ltYWxTY2FsZSA9IG9wdHMubnVtZXJhbERlY2ltYWxTY2FsZSB8fCAyO1xuICAgICAgICB0YXJnZXQubnVtZXJhbERlY2ltYWxNYXJrID0gb3B0cy5udW1lcmFsRGVjaW1hbE1hcmsgfHwgJy4nO1xuICAgICAgICB0YXJnZXQubnVtZXJhbFRob3VzYW5kc0dyb3VwU3R5bGUgPSBvcHRzLm51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlIHx8ICd0aG91c2FuZCc7XG5cbiAgICAgICAgLy8gb3RoZXJzXG4gICAgICAgIHRhcmdldC5pbml0VmFsdWUgPSBvcHRzLmluaXRWYWx1ZSB8fCAnJztcblxuICAgICAgICB0YXJnZXQubnVtZXJpY09ubHkgPSB0YXJnZXQuY3JlZGl0Q2FyZCB8fCB0YXJnZXQuZGF0ZSB8fCAhIW9wdHMubnVtZXJpY09ubHk7XG5cbiAgICAgICAgdGFyZ2V0LnVwcGVyY2FzZSA9ICEhb3B0cy51cHBlcmNhc2U7XG4gICAgICAgIHRhcmdldC5sb3dlcmNhc2UgPSAhIW9wdHMubG93ZXJjYXNlO1xuXG4gICAgICAgIHRhcmdldC5wcmVmaXggPSAodGFyZ2V0LmNyZWRpdENhcmQgfHwgdGFyZ2V0LnBob25lIHx8IHRhcmdldC5kYXRlKSA/ICcnIDogKG9wdHMucHJlZml4IHx8ICcnKTtcblxuICAgICAgICB0YXJnZXQuZGVsaW1pdGVyID0gb3B0cy5kZWxpbWl0ZXIgfHwgKHRhcmdldC5kYXRlID8gJy8nIDogKHRhcmdldC5udW1lcmFsID8gJywnIDogJyAnKSk7XG4gICAgICAgIHRhcmdldC5kZWxpbWl0ZXJSRSA9IG5ldyBSZWdFeHAodGFyZ2V0LmRlbGltaXRlciwgJ2cnKTtcblxuICAgICAgICB0YXJnZXQuYmxvY2tzID0gb3B0cy5ibG9ja3MgfHwgW107XG4gICAgICAgIHRhcmdldC5ibG9ja3NMZW5ndGggPSB0YXJnZXQuYmxvY2tzLmxlbmd0aDtcblxuICAgICAgICB0YXJnZXQubWF4TGVuZ3RoID0gMDtcblxuICAgICAgICB0YXJnZXQuYmFja3NwYWNlID0gZmFsc2U7XG4gICAgICAgIHRhcmdldC5yZXN1bHQgPSAnJztcblxuICAgICAgICByZXR1cm4gdGFyZ2V0O1xuICAgIH1cbn07XG5cbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gRGVmYXVsdFByb3BlcnRpZXM7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBDcmVkaXRDYXJkRGV0ZWN0b3IgPSB7XG4gICAgYmxvY2tzOiB7XG4gICAgICAgIHVhdHA6ICAgICAgICAgIFs0LCA1LCA2XSxcbiAgICAgICAgYW1leDogICAgICAgICAgWzQsIDYsIDVdLFxuICAgICAgICBkaW5lcnM6ICAgICAgICBbNCwgNiwgNF0sXG4gICAgICAgIG1hc3RlcmNhcmQ6ICAgIFs0LCA0LCA0LCA0XSxcbiAgICAgICAgZGFua29ydDogICAgICAgWzQsIDQsIDQsIDRdLFxuICAgICAgICBpbnN0YXBheW1lbnQ6ICBbNCwgNCwgNCwgNF0sXG4gICAgICAgIGpjYjogICAgICAgICAgIFs0LCA0LCA0LCA0XSxcbiAgICAgICAgZ2VuZXJhbFN0cmljdDogWzQsIDQsIDQsIDddLFxuICAgICAgICBnZW5lcmFsTG9vc2U6ICBbNCwgNCwgNCwgNF1cbiAgICB9LFxuXG4gICAgcmU6IHtcbiAgICAgICAgLy8gc3RhcnRzIHdpdGggMTsgMTUgZGlnaXRzLCBub3Qgc3RhcnRzIHdpdGggMTgwMCAoamNiIGNhcmQpXG4gICAgICAgIHVhdHA6IC9eKD8hMTgwMCkxXFxkezAsMTR9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCAzNC8zNzsgMTUgZGlnaXRzXG4gICAgICAgIGFtZXg6IC9eM1s0N11cXGR7MCwxM30vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDMwMC0zMDUvMzA5IG9yIDM2LzM4LzM5OyAxNCBkaWdpdHNcbiAgICAgICAgZGluZXJzOiAvXjMoPzowKFswLTVdfDkpfFs2ODldXFxkPylcXGR7MCwxMX0vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDUxLTU1IG9yIDIyLTI3OyAxNiBkaWdpdHNcbiAgICAgICAgbWFzdGVyY2FyZDogL14oNVsxLTVdfDJbMi03XSlcXGR7MCwxNH0vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDUwMTkvNDE3NS80NTcxOyAxNiBkaWdpdHNcbiAgICAgICAgZGFua29ydDogL14oNTAxOXw0MTc1fDQ1NzEpXFxkezAsMTJ9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCA2MzctNjM5OyAxNiBkaWdpdHNcbiAgICAgICAgaW5zdGFwYXltZW50OiAvXjYzWzctOV1cXGR7MCwxM30vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDIxMzEvMTgwMC8zNTsgMTYgZGlnaXRzXG4gICAgICAgIGpjYjogL14oPzoyMTMxfDE4MDB8MzVcXGR7MCwyfSlcXGR7MCwxMn0vXG4gICAgfSxcblxuICAgIGdldEJsb2Nrc0J5UEFOOiBmdW5jdGlvbiAodmFsdWUsIHN0cmljdE1vZGUpIHtcbiAgICAgICAgdmFyIGJsb2NrcyA9IENyZWRpdENhcmREZXRlY3Rvci5ibG9ja3MsXG4gICAgICAgICAgICByZSA9IENyZWRpdENhcmREZXRlY3Rvci5yZTtcblxuICAgICAgICAvLyBJbiB0aGVvcnksIGNyZWRpdCBjYXJkIGNhbiBoYXZlIHVwIHRvIDE5IGRpZ2l0cyBudW1iZXIuXG4gICAgICAgIC8vIFNldCBzdHJpY3RNb2RlIHRvIHRydWUgd2lsbCByZW1vdmUgdGhlIDE2IG1heC1sZW5ndGggcmVzdHJhaW4sXG4gICAgICAgIC8vIGhvd2V2ZXIsIEkgbmV2ZXIgZm91bmQgYW55IHdlYnNpdGUgdmFsaWRhdGUgY2FyZCBudW1iZXIgbGlrZVxuICAgICAgICAvLyB0aGlzLCBoZW5jZSBwcm9iYWJseSB5b3UgZG9uJ3QgbmVlZCB0byBlbmFibGUgdGhpcyBvcHRpb24uXG4gICAgICAgIHN0cmljdE1vZGUgPSAhIXN0cmljdE1vZGU7XG5cbiAgICAgICAgaWYgKHJlLmFtZXgudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBibG9ja3MuYW1leDtcbiAgICAgICAgfSBlbHNlIGlmIChyZS51YXRwLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gYmxvY2tzLnVhdHA7XG4gICAgICAgIH0gZWxzZSBpZiAocmUuZGluZXJzLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gYmxvY2tzLmRpbmVycztcbiAgICAgICAgfSBlbHNlIGlmIChyZS5tYXN0ZXJjYXJkLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gYmxvY2tzLm1hc3RlcmNhcmQ7XG4gICAgICAgIH0gZWxzZSBpZiAocmUuZGFua29ydC50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIGJsb2Nrcy5kYW5rb3J0O1xuICAgICAgICB9IGVsc2UgaWYgKHJlLmluc3RhcGF5bWVudC50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIGJsb2Nrcy5pbnN0YXBheW1lbnQ7XG4gICAgICAgIH0gZWxzZSBpZiAocmUuamNiLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gYmxvY2tzLmpjYjtcbiAgICAgICAgfSBlbHNlIGlmIChzdHJpY3RNb2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gYmxvY2tzLmdlbmVyYWxTdHJpY3Q7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gYmxvY2tzLmdlbmVyYWxMb29zZTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gQ3JlZGl0Q2FyZERldGVjdG9yO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgRGF0ZUZvcm1hdHRlciA9IGZ1bmN0aW9uIChkYXRlUGF0dGVybikge1xuICAgIHZhciBvd25lciA9IHRoaXM7XG5cbiAgICBvd25lci5ibG9ja3MgPSBbXTtcbiAgICBvd25lci5kYXRlUGF0dGVybiA9IGRhdGVQYXR0ZXJuO1xuICAgIG93bmVyLmluaXRCbG9ja3MoKTtcbn07XG5cbkRhdGVGb3JtYXR0ZXIucHJvdG90eXBlID0ge1xuICAgIGluaXRCbG9ja3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcztcbiAgICAgICAgb3duZXIuZGF0ZVBhdHRlcm4uZm9yRWFjaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gJ1knKSB7XG4gICAgICAgICAgICAgICAgb3duZXIuYmxvY2tzLnB1c2goNCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG93bmVyLmJsb2Nrcy5wdXNoKDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZ2V0QmxvY2tzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2NrcztcbiAgICB9LFxuXG4gICAgZ2V0VmFsaWRhdGVkRGF0ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHJlc3VsdCA9ICcnO1xuXG4gICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvW15cXGRdL2csICcnKTtcblxuICAgICAgICBvd25lci5ibG9ja3MuZm9yRWFjaChmdW5jdGlvbiAobGVuZ3RoLCBpbmRleCkge1xuICAgICAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgc3ViID0gdmFsdWUuc2xpY2UoMCwgbGVuZ3RoKSxcbiAgICAgICAgICAgICAgICAgICAgcmVzdCA9IHZhbHVlLnNsaWNlKGxlbmd0aCk7XG5cbiAgICAgICAgICAgICAgICBzd2l0Y2ggKG93bmVyLmRhdGVQYXR0ZXJuW2luZGV4XSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2QnOlxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyc2VJbnQoc3ViLCAxMCkgPiAzMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ViID0gJzMxJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdtJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnNlSW50KHN1YiwgMTApID4gMTIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YiA9ICcxMic7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IHN1YjtcblxuICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSByZW1haW5pbmcgc3RyaW5nXG4gICAgICAgICAgICAgICAgdmFsdWUgPSByZXN0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn07XG5cbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gRGF0ZUZvcm1hdHRlcjtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIE51bWVyYWxGb3JtYXR0ZXIgPSBmdW5jdGlvbiAobnVtZXJhbERlY2ltYWxNYXJrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtZXJhbERlY2ltYWxTY2FsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsaW1pdGVyKSB7XG4gICAgdmFyIG93bmVyID0gdGhpcztcblxuICAgIG93bmVyLm51bWVyYWxEZWNpbWFsTWFyayA9IG51bWVyYWxEZWNpbWFsTWFyayB8fCAnLic7XG4gICAgb3duZXIubnVtZXJhbERlY2ltYWxTY2FsZSA9IG51bWVyYWxEZWNpbWFsU2NhbGUgfHwgMjtcbiAgICBvd25lci5udW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSA9IG51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlIHx8IE51bWVyYWxGb3JtYXR0ZXIuZ3JvdXBTdHlsZS50aG91c2FuZDtcbiAgICBvd25lci5kZWxpbWl0ZXIgPSBkZWxpbWl0ZXIgfHwgJywnO1xufTtcblxuTnVtZXJhbEZvcm1hdHRlci5ncm91cFN0eWxlID0ge1xuICAgIHRob3VzYW5kOiAndGhvdXNhbmQnLFxuICAgIGxha2g6ICAgICAnbGFraCcsXG4gICAgd2FuOiAgICAgICd3YW4nXG59O1xuXG5OdW1lcmFsRm9ybWF0dGVyLnByb3RvdHlwZSA9IHtcbiAgICBmb3JtYXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCBwYXJ0cywgcGFydEludGVnZXIsIHBhcnREZWNpbWFsID0gJyc7XG5cbiAgICAgICAgLy8gc3RyaXAgYWxwaGFiZXQgbGV0dGVyc1xuICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL1tBLVphLXpdL2csICcnKVxuXG4gICAgICAgICAgICAvLyByZXBsYWNlIHRoZSBmaXJzdCBkZWNpbWFsIG1hcmsgd2l0aCByZXNlcnZlZCBwbGFjZWhvbGRlclxuICAgICAgICAgICAgLnJlcGxhY2Uob3duZXIubnVtZXJhbERlY2ltYWxNYXJrLCAnTScpXG5cbiAgICAgICAgICAgIC8vIHN0cmlwIHRoZSBub24gbnVtZXJpYyBsZXR0ZXJzIGV4Y2VwdCBNXG4gICAgICAgICAgICAucmVwbGFjZSgvW15cXGRNXS9nLCAnJylcblxuICAgICAgICAgICAgLy8gcmVwbGFjZSBtYXJrXG4gICAgICAgICAgICAucmVwbGFjZSgnTScsIG93bmVyLm51bWVyYWxEZWNpbWFsTWFyaylcblxuICAgICAgICAgICAgLy8gc3RyaXAgbGVhZGluZyAwXG4gICAgICAgICAgICAucmVwbGFjZSgvXigtKT8wKyg/PVxcZCkvLCAnJDEnKTtcblxuICAgICAgICBwYXJ0SW50ZWdlciA9IHZhbHVlO1xuXG4gICAgICAgIGlmICh2YWx1ZS5pbmRleE9mKG93bmVyLm51bWVyYWxEZWNpbWFsTWFyaykgPj0gMCkge1xuICAgICAgICAgICAgcGFydHMgPSB2YWx1ZS5zcGxpdChvd25lci5udW1lcmFsRGVjaW1hbE1hcmspO1xuICAgICAgICAgICAgcGFydEludGVnZXIgPSBwYXJ0c1swXTtcbiAgICAgICAgICAgIHBhcnREZWNpbWFsID0gb3duZXIubnVtZXJhbERlY2ltYWxNYXJrICsgcGFydHNbMV0uc2xpY2UoMCwgb3duZXIubnVtZXJhbERlY2ltYWxTY2FsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBzd2l0Y2ggKG93bmVyLm51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlKSB7XG4gICAgICAgIGNhc2UgTnVtZXJhbEZvcm1hdHRlci5ncm91cFN0eWxlLmxha2g6XG4gICAgICAgICAgICBwYXJ0SW50ZWdlciA9IHBhcnRJbnRlZ2VyLnJlcGxhY2UoLyhcXGQpKD89KFxcZFxcZCkrXFxkJCkvZywgJyQxJyArIG93bmVyLmRlbGltaXRlcik7XG5cbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgTnVtZXJhbEZvcm1hdHRlci5ncm91cFN0eWxlLndhbjpcbiAgICAgICAgICAgIHBhcnRJbnRlZ2VyID0gcGFydEludGVnZXIucmVwbGFjZSgvKFxcZCkoPz0oXFxkezR9KSskKS9nLCAnJDEnICsgb3duZXIuZGVsaW1pdGVyKTtcblxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHBhcnRJbnRlZ2VyID0gcGFydEludGVnZXIucmVwbGFjZSgvKFxcZCkoPz0oXFxkezN9KSskKS9nLCAnJDEnICsgb3duZXIuZGVsaW1pdGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJ0SW50ZWdlci50b1N0cmluZygpICsgcGFydERlY2ltYWwudG9TdHJpbmcoKTtcbiAgICB9XG59O1xuXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IE51bWVyYWxGb3JtYXR0ZXI7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBQaG9uZUZvcm1hdHRlciA9IGZ1bmN0aW9uIChmb3JtYXR0ZXIsIGRlbGltaXRlcikge1xuICAgIHZhciBvd25lciA9IHRoaXM7XG5cbiAgICBvd25lci5kZWxpbWl0ZXIgPSBkZWxpbWl0ZXIgfHwgJyAnO1xuICAgIG93bmVyLmRlbGltaXRlclJFID0gbmV3IFJlZ0V4cChvd25lci5kZWxpbWl0ZXIsICdnJyk7XG4gICAgb3duZXIuZm9ybWF0dGVyID0gZm9ybWF0dGVyO1xufTtcblxuUGhvbmVGb3JtYXR0ZXIucHJvdG90eXBlID0ge1xuICAgIHNldEZvcm1hdHRlcjogZnVuY3Rpb24gKGZvcm1hdHRlcikge1xuICAgICAgICB0aGlzLmZvcm1hdHRlciA9IGZvcm1hdHRlcjtcbiAgICB9LFxuXG4gICAgZm9ybWF0OiBmdW5jdGlvbiAocGhvbmVOdW1iZXIpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcztcblxuICAgICAgICBvd25lci5mb3JtYXR0ZXIuY2xlYXIoKTtcblxuICAgICAgICAvLyBvbmx5IGtlZXAgbnVtYmVyIGFuZCArXG4gICAgICAgIHBob25lTnVtYmVyID0gcGhvbmVOdW1iZXIucmVwbGFjZSgvW15cXGQrXS9nLCAnJyk7XG5cbiAgICAgICAgLy8gc3RyaXAgZGVsaW1pdGVyXG4gICAgICAgIHBob25lTnVtYmVyID0gcGhvbmVOdW1iZXIucmVwbGFjZShvd25lci5kZWxpbWl0ZXJSRSwgJycpO1xuXG4gICAgICAgIHZhciByZXN1bHQgPSAnJywgY3VycmVudCwgdmFsaWRhdGVkID0gZmFsc2U7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlNYXggPSBwaG9uZU51bWJlci5sZW5ndGg7IGkgPCBpTWF4OyBpKyspIHtcbiAgICAgICAgICAgIGN1cnJlbnQgPSBvd25lci5mb3JtYXR0ZXIuaW5wdXREaWdpdChwaG9uZU51bWJlci5jaGFyQXQoaSkpO1xuXG4gICAgICAgICAgICAvLyBoYXMgKCktIG9yIHNwYWNlIGluc2lkZVxuICAgICAgICAgICAgaWYgKC9bXFxzKCktXS9nLnRlc3QoY3VycmVudCkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBjdXJyZW50O1xuXG4gICAgICAgICAgICAgICAgdmFsaWRhdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCF2YWxpZGF0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gY3VycmVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gZWxzZTogb3ZlciBsZW5ndGggaW5wdXRcbiAgICAgICAgICAgICAgICAvLyBpdCB0dXJucyB0byBpbnZhbGlkIG51bWJlciBhZ2FpblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3RyaXAgKClcbiAgICAgICAgLy8gZS5nLiBVUzogNzE2MTIzNDU2NyByZXR1cm5zICg3MTYpIDEyMy00NTY3XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKC9bKCldL2csICcnKTtcbiAgICAgICAgLy8gcmVwbGFjZSBsaWJyYXJ5IGRlbGltaXRlciB3aXRoIHVzZXIgY3VzdG9taXplZCBkZWxpbWl0ZXJcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoL1tcXHMtXS9nLCBvd25lci5kZWxpbWl0ZXIpO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufTtcblxuaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBQaG9uZUZvcm1hdHRlcjtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFV0aWwgPSB7XG4gICAgbm9vcDogZnVuY3Rpb24gKCkge1xuICAgIH0sXG5cbiAgICBzdHJpcDogZnVuY3Rpb24gKHZhbHVlLCByZSkge1xuICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZShyZSwgJycpO1xuICAgIH0sXG5cbiAgICBoZWFkU3RyOiBmdW5jdGlvbiAoc3RyLCBsZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHN0ci5zbGljZSgwLCBsZW5ndGgpO1xuICAgIH0sXG5cbiAgICBnZXRNYXhMZW5ndGg6IGZ1bmN0aW9uIChibG9ja3MpIHtcbiAgICAgICAgcmV0dXJuIGJsb2Nrcy5yZWR1Y2UoZnVuY3Rpb24gKHByZXZpb3VzLCBjdXJyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gcHJldmlvdXMgKyBjdXJyZW50O1xuICAgICAgICB9LCAwKTtcbiAgICB9LFxuXG4gICAgZ2V0UHJlZml4QXBwbGllZFZhbHVlOiBmdW5jdGlvbiAodmFsdWUsIHByZWZpeCkge1xuICAgICAgICB2YXIgcHJlZml4TGVuZ3RoID0gcHJlZml4Lmxlbmd0aCxcbiAgICAgICAgICAgIHByZWZpeExlbmd0aFZhbHVlO1xuXG4gICAgICAgIGlmIChwcmVmaXhMZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByZWZpeExlbmd0aFZhbHVlID0gdmFsdWUuc2xpY2UoMCwgcHJlZml4TGVuZ3RoKTtcblxuICAgICAgICBpZiAocHJlZml4TGVuZ3RoVmFsdWUubGVuZ3RoIDwgcHJlZml4TGVuZ3RoKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHByZWZpeDtcbiAgICAgICAgfSBlbHNlIGlmIChwcmVmaXhMZW5ndGhWYWx1ZSAhPT0gcHJlZml4KSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHByZWZpeCArIHZhbHVlLnNsaWNlKHByZWZpeExlbmd0aCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcblxuICAgIGdldEZvcm1hdHRlZFZhbHVlOiBmdW5jdGlvbiAodmFsdWUsIGJsb2NrcywgYmxvY2tzTGVuZ3RoLCBkZWxpbWl0ZXIpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9ICcnO1xuXG4gICAgICAgIGJsb2Nrcy5mb3JFYWNoKGZ1bmN0aW9uIChsZW5ndGgsIGluZGV4KSB7XG4gICAgICAgICAgICBpZiAodmFsdWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBzdWIgPSB2YWx1ZS5zbGljZSgwLCBsZW5ndGgpLFxuICAgICAgICAgICAgICAgICAgICByZXN0ID0gdmFsdWUuc2xpY2UobGVuZ3RoKTtcblxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBzdWI7XG5cbiAgICAgICAgICAgICAgICBpZiAoc3ViLmxlbmd0aCA9PT0gbGVuZ3RoICYmIGluZGV4IDwgYmxvY2tzTGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgKz0gZGVsaW1pdGVyO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSByZW1haW5pbmcgc3RyaW5nXG4gICAgICAgICAgICAgICAgdmFsdWUgPSByZXN0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn07XG5cbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gVXRpbDtcbn1cbiJdfQ==
