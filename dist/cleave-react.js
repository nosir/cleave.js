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
/* jslint node: true */

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
        console.log('get ini state');

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

        owner.onInput(pps.result);
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
        var owner = this;

        owner.onInput(event.target.value);
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
/*jslint node: true */
/* global module: true, exports: true */

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
        target.phoneRegionCode = opts.phoneRegionCode || '';
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

        target.prefix = target.creditCard || target.phone || target.date ? '' : opts.prefix || '';

        target.delimiter = opts.delimiter || (target.date ? '/' : target.numeral ? ',' : ' ');
        target.delimiterRE = new RegExp(target.delimiter, "g");

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
/*jslint node: true */
/* global module: true, exports: true */

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
/*jslint node: true */
/* global module: true, exports: true */

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
/*jslint node: true */
/* global module: true, exports: true */

'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var NumeralFormatter = function NumeralFormatter(numeralDecimalMark, numeralDecimalScale, numeralThousandsGroupStyle, delimiter) {
    var owner = this;

    owner.numeralDecimalMark = numeralDecimalMark;
    owner.numeralDecimalScale = numeralDecimalScale;
    owner.numeralThousandsGroupStyle = numeralThousandsGroupStyle;
    owner.delimiter = delimiter;
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

if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && _typeof(module.exports) === 'object') {
    module.exports = exports = NumeralFormatter;
}

},{}],7:[function(require,module,exports){
/*jslint node: true */
/* global module: true, exports: true */

'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var PhoneFormatter = function PhoneFormatter(formatter, delimiter) {
    var owner = this;

    owner.delimiter = delimiter || ' ';
    owner.delimiterRE = new RegExp(owner.delimiter, "g");
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
/*jslint node: true */
/* global module: true, exports: true */

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZWFjdC5qcyIsInNyYy9DbGVhdmUucmVhY3QuanMiLCJzcmMvY29tbW9uL0RlZmF1bHRQcm9wZXJ0aWVzLmpzIiwic3JjL3Nob3J0Y3V0cy9DcmVkaXRDYXJkRGV0ZWN0b3IuanMiLCJzcmMvc2hvcnRjdXRzL0RhdGVGb3JtYXR0ZXIuanMiLCJzcmMvc2hvcnRjdXRzL051bWVyYWxGb3JtYXR0ZXIuanMiLCJzcmMvc2hvcnRjdXRzL1Bob25lRm9ybWF0dGVyLmpzIiwic3JjL3V0aWxzL1V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQTs7Ozs7Ozs7Ozs7O0FDRUE7Ozs7OztBQUVBLElBQUksUUFBUSxRQUFRLE9BQVIsQ0FBWjs7QUFFQSxJQUFJLG1CQUFtQixRQUFRLDhCQUFSLENBQXZCO0FBQ0EsSUFBSSxnQkFBZ0IsUUFBUSwyQkFBUixDQUFwQjtBQUNBLElBQUksaUJBQWlCLFFBQVEsNEJBQVIsQ0FBckI7QUFDQSxJQUFJLHFCQUFxQixRQUFRLGdDQUFSLENBQXpCO0FBQ0EsSUFBSSxPQUFPLFFBQVEsY0FBUixDQUFYO0FBQ0EsSUFBSSxvQkFBb0IsUUFBUSw0QkFBUixDQUF4Qjs7QUFFQSxJQUFJLFNBQVMsTUFBTSxXQUFOLENBQWtCO0FBQUE7O0FBQzNCLHVCQUFtQiw2QkFBWTtBQUMzQixhQUFLLElBQUw7QUFDSCxLQUgwQjs7QUFLM0IsK0JBQTJCLG1DQUFVLFNBQVYsRUFBcUI7QUFDNUMsWUFBSSxRQUFRLElBQVo7QUFBQSxZQUNJLGtCQUFrQixVQUFVLE9BQVYsQ0FBa0IsZUFEeEM7OztBQUlBLFlBQUksbUJBQW1CLG9CQUFvQixNQUFNLFVBQU4sQ0FBaUIsZUFBNUQsRUFBNkU7QUFDekUsa0JBQU0sVUFBTixDQUFpQixlQUFqQixHQUFtQyxlQUFuQztBQUNBLGtCQUFNLGtCQUFOO0FBQ0Esa0JBQU0sT0FBTixDQUFjLE1BQU0sVUFBTixDQUFpQixNQUEvQjtBQUNIO0FBQ0osS0FmMEI7O0FBaUIzQixxQkFBaUIsMkJBQVk7QUFDekIsZ0JBQVEsR0FBUixDQUFZLGVBQVo7O0FBRUksb0JBQVEsSUFBUjtBQUhxQiwyQkFJK0IsTUFBTSxLQUpyQztBQUFBLFlBSW5CLEtBSm1CLGdCQUluQixLQUptQjtBQUFBLFlBSVosT0FKWSxnQkFJWixPQUpZO0FBQUEsWUFJSCxTQUpHLGdCQUlILFNBSkc7QUFBQSxZQUlRLFFBSlIsZ0JBSVEsUUFKUjs7QUFBQSxZQUlxQixLQUpyQjs7QUFNekIsY0FBTSxnQkFBTixHQUF5QjtBQUNyQixzQkFBVyxZQUFZLEtBQUssSUFEUDtBQUVyQix1QkFBVyxhQUFhLEtBQUs7QUFGUixTQUF6Qjs7QUFLQSxjQUFNLFVBQU4sR0FBbUIsa0JBQWtCLE1BQWxCLENBQXlCLEVBQXpCLEVBQTZCLE9BQTdCLENBQW5COztBQUVBLGVBQU87QUFDSCxtQkFBTyxLQURKO0FBRUgsbUJBQU8sTUFBTSxVQUFOLENBQWlCO0FBRnJCLFNBQVA7QUFJSCxLQWxDMEI7O0FBb0MzQixVQUFNLGdCQUFZO0FBQ2QsWUFBSSxRQUFRLElBQVo7QUFBQSxZQUNJLE1BQU0sTUFBTSxVQURoQjs7O0FBSUEsWUFBSSxDQUFDLElBQUksT0FBTCxJQUFnQixDQUFDLElBQUksS0FBckIsSUFBOEIsQ0FBQyxJQUFJLFVBQW5DLElBQWlELENBQUMsSUFBSSxJQUF0RCxJQUE4RCxJQUFJLE1BQUosQ0FBVyxNQUFYLEtBQXNCLENBQXhGLEVBQTJGO0FBQ3ZGO0FBQ0g7O0FBRUQsWUFBSSxTQUFKLEdBQWdCLEtBQUssWUFBTCxDQUFrQixJQUFJLE1BQXRCLENBQWhCOztBQUVBLGNBQU0sa0JBQU47QUFDQSxjQUFNLGlCQUFOO0FBQ0EsY0FBTSxvQkFBTjs7QUFFQSxjQUFNLE9BQU4sQ0FBYyxJQUFJLE1BQWxCO0FBQ0gsS0FwRDBCOztBQXNEM0IsMEJBQXNCLGdDQUFZO0FBQzlCLFlBQUksUUFBUSxJQUFaO0FBQUEsWUFDSSxNQUFNLE1BQU0sVUFEaEI7O0FBR0EsWUFBSSxDQUFDLElBQUksT0FBVCxFQUFrQjtBQUNkO0FBQ0g7O0FBRUQsWUFBSSxnQkFBSixHQUF1QixJQUFJLGdCQUFKLENBQ25CLElBQUksa0JBRGUsRUFFbkIsSUFBSSxtQkFGZSxFQUduQixJQUFJLDBCQUhlLEVBSW5CLElBQUksU0FKZSxDQUF2QjtBQU1ILEtBcEUwQjs7QUFzRTNCLHVCQUFtQiw2QkFBWTtBQUMzQixZQUFJLFFBQVEsSUFBWjtBQUFBLFlBQ0ksTUFBTSxNQUFNLFVBRGhCOztBQUdBLFlBQUksQ0FBQyxJQUFJLElBQVQsRUFBZTtBQUNYO0FBQ0g7O0FBRUQsWUFBSSxhQUFKLEdBQW9CLElBQUksYUFBSixDQUFrQixJQUFJLFdBQXRCLENBQXBCO0FBQ0EsWUFBSSxNQUFKLEdBQWEsSUFBSSxhQUFKLENBQWtCLFNBQWxCLEVBQWI7QUFDQSxZQUFJLFlBQUosR0FBbUIsSUFBSSxNQUFKLENBQVcsTUFBOUI7QUFDQSxZQUFJLFNBQUosR0FBZ0IsS0FBSyxZQUFMLENBQWtCLElBQUksTUFBdEIsQ0FBaEI7QUFDSCxLQWxGMEI7O0FBb0YzQix3QkFBb0IsOEJBQVk7QUFDNUIsWUFBSSxRQUFRLElBQVo7QUFBQSxZQUNJLE1BQU0sTUFBTSxVQURoQjs7QUFHQSxZQUFJLENBQUMsSUFBSSxLQUFULEVBQWdCO0FBQ1o7QUFDSDs7OztBQUlELFlBQUk7QUFDQSxnQkFBSSxjQUFKLEdBQXFCLElBQUksY0FBSixDQUNqQixJQUFJLE9BQU8sTUFBUCxDQUFjLGtCQUFsQixDQUFxQyxJQUFJLGVBQXpDLENBRGlCLEVBRWpCLElBQUksU0FGYSxDQUFyQjtBQUlILFNBTEQsQ0FLRSxPQUFPLEVBQVAsRUFBVztBQUNULGtCQUFNLElBQUksS0FBSixDQUFVLHNEQUFWLENBQU47QUFDSDtBQUNKLEtBdEcwQjs7QUF3RzNCLGVBQVcsbUJBQVUsS0FBVixFQUFpQjtBQUN4QixZQUFJLFFBQVEsSUFBWjtBQUFBLFlBQ0ksTUFBTSxNQUFNLFVBRGhCO0FBQUEsWUFFSSxXQUFXLE1BQU0sS0FBTixJQUFlLE1BQU0sT0FGcEM7OztBQUtBLFlBQUksYUFBYSxDQUFiLElBQWtCLElBQUksTUFBSixDQUFXLEtBQVgsQ0FBaUIsQ0FBQyxDQUFsQixNQUF5QixJQUFJLFNBQW5ELEVBQThEO0FBQzFELGdCQUFJLFNBQUosR0FBZ0IsSUFBaEI7QUFDSCxTQUZELE1BRU87QUFDSCxnQkFBSSxTQUFKLEdBQWdCLEtBQWhCO0FBQ0g7O0FBRUQsY0FBTSxnQkFBTixDQUF1QixTQUF2QixDQUFpQyxLQUFqQztBQUNILEtBckgwQjs7QUF1SDNCLGNBQVUsa0JBQVUsS0FBVixFQUFpQjtBQUN2QixZQUFJLFFBQVEsSUFBWjs7QUFFQSxjQUFNLE9BQU4sQ0FBYyxNQUFNLE1BQU4sQ0FBYSxLQUEzQjtBQUNBLGNBQU0sZ0JBQU4sQ0FBdUIsUUFBdkIsQ0FBZ0MsS0FBaEM7QUFDSCxLQTVIMEI7O0FBOEgzQixhQUFTLGlCQUFVLEtBQVYsRUFBaUI7QUFDdEIsWUFBSSxRQUFRLElBQVo7QUFBQSxZQUFrQixNQUFNLE1BQU0sVUFBOUI7QUFBQSxZQUNJLE9BQU8sSUFBSSxNQURmOzs7Ozs7O0FBUUEsWUFBSSxJQUFJLFNBQUosSUFBaUIsTUFBTSxLQUFOLENBQVksQ0FBQyxDQUFiLE1BQW9CLElBQUksU0FBN0MsRUFBd0Q7QUFDcEQsb0JBQVEsS0FBSyxPQUFMLENBQWEsS0FBYixFQUFvQixNQUFNLE1BQU4sR0FBZSxDQUFuQyxDQUFSO0FBQ0g7OztBQUdELFlBQUksSUFBSSxLQUFSLEVBQWU7QUFDWCxnQkFBSSxNQUFKLEdBQWEsSUFBSSxjQUFKLENBQW1CLE1BQW5CLENBQTBCLEtBQTFCLENBQWI7QUFDQSxrQkFBTSxnQkFBTjs7QUFFQTtBQUNIOzs7QUFHRCxZQUFJLElBQUksT0FBUixFQUFpQjtBQUNiLGdCQUFJLE1BQUosR0FBYSxJQUFJLGdCQUFKLENBQXFCLE1BQXJCLENBQTRCLEtBQTVCLENBQWI7QUFDQSxrQkFBTSxnQkFBTjs7QUFFQTtBQUNIOzs7QUFHRCxZQUFJLElBQUksSUFBUixFQUFjO0FBQ1Ysb0JBQVEsSUFBSSxhQUFKLENBQWtCLGdCQUFsQixDQUFtQyxLQUFuQyxDQUFSO0FBQ0g7OztBQUdELGdCQUFRLEtBQUssS0FBTCxDQUFXLEtBQVgsRUFBa0IsSUFBSSxXQUF0QixDQUFSOzs7QUFHQSxnQkFBUSxLQUFLLHFCQUFMLENBQTJCLEtBQTNCLEVBQWtDLElBQUksTUFBdEMsQ0FBUjs7O0FBR0EsWUFBSSxJQUFJLFdBQVIsRUFBcUI7QUFDakIsb0JBQVEsS0FBSyxLQUFMLENBQVcsS0FBWCxFQUFrQixRQUFsQixDQUFSO0FBQ0g7Ozs7QUFJRCxZQUFJLElBQUksVUFBSixJQUFrQixLQUFLLE9BQUwsQ0FBYSxJQUFJLE1BQWpCLEVBQXlCLENBQXpCLE1BQWdDLEtBQUssT0FBTCxDQUFhLEtBQWIsRUFBb0IsQ0FBcEIsQ0FBdEQsRUFBOEU7QUFDMUUsZ0JBQUksTUFBSixHQUFhLG1CQUFtQixjQUFuQixDQUFrQyxLQUFsQyxFQUF5QyxJQUFJLG9CQUE3QyxDQUFiO0FBQ0EsZ0JBQUksWUFBSixHQUFtQixJQUFJLE1BQUosQ0FBVyxNQUE5QjtBQUNBLGdCQUFJLFNBQUosR0FBZ0IsS0FBSyxZQUFMLENBQWtCLElBQUksTUFBdEIsQ0FBaEI7QUFDSDs7O0FBR0QsZ0JBQVEsS0FBSyxPQUFMLENBQWEsS0FBYixFQUFvQixJQUFJLFNBQXhCLENBQVI7OztBQUdBLFlBQUksTUFBSixHQUFhLEtBQUssaUJBQUwsQ0FBdUIsS0FBdkIsRUFBOEIsSUFBSSxNQUFsQyxFQUEwQyxJQUFJLFlBQTlDLEVBQTRELElBQUksU0FBaEUsQ0FBYjs7OztBQUlBLFlBQUksU0FBUyxJQUFJLE1BQWpCLEVBQXlCO0FBQ3JCO0FBQ0g7O0FBRUQsY0FBTSxnQkFBTjtBQUNILEtBaE0wQjs7QUFrTTNCLHNCQUFrQiw0QkFBWTtBQUMxQixhQUFLLFFBQUwsQ0FBYyxFQUFDLE9BQU8sS0FBSyxVQUFMLENBQWdCLE1BQXhCLEVBQWQ7QUFDSCxLQXBNMEI7O0FBc00zQixZQUFRLGtCQUFZO0FBQ2hCLFlBQUksUUFBUSxJQUFaOztBQUVBLGVBQ0ksd0NBQU8sTUFBSyxNQUFaLElBQXVCLE1BQU0sS0FBTixDQUFZLEtBQW5DO0FBQ08sbUJBQU8sTUFBTSxLQUFOLENBQVksS0FEMUI7QUFFTyx1QkFBVyxNQUFNLFNBRnhCO0FBR08sc0JBQVUsTUFBTSxRQUh2QixJQURKO0FBTUg7QUEvTTBCLENBQWxCLENBQWI7O0FBa05BLE9BQU8sT0FBUCxHQUFpQixPQUFPLE1BQVAsR0FBZ0IsTUFBakM7Ozs7Ozs7O0FDNU5BOzs7Ozs7Ozs7O0FBT0EsSUFBSSxvQkFBb0I7OztBQUdwQixZQUFRLGdCQUFVLE1BQVYsRUFBa0IsSUFBbEIsRUFBd0I7QUFDNUIsaUJBQVMsVUFBVSxFQUFuQjtBQUNBLGVBQU8sUUFBUSxFQUFmOzs7QUFHQSxlQUFPLFVBQVAsR0FBb0IsQ0FBQyxDQUFDLEtBQUssVUFBM0I7QUFDQSxlQUFPLG9CQUFQLEdBQThCLENBQUMsQ0FBQyxLQUFLLG9CQUFyQzs7O0FBR0EsZUFBTyxLQUFQLEdBQWUsQ0FBQyxDQUFDLEtBQUssS0FBdEI7QUFDQSxlQUFPLGVBQVAsR0FBeUIsS0FBSyxlQUFMLElBQXdCLEVBQWpEO0FBQ0EsZUFBTyxjQUFQLEdBQXdCLEVBQXhCOzs7QUFHQSxlQUFPLElBQVAsR0FBYyxDQUFDLENBQUMsS0FBSyxJQUFyQjtBQUNBLGVBQU8sV0FBUCxHQUFxQixLQUFLLFdBQUwsSUFBb0IsQ0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEdBQVgsQ0FBekM7QUFDQSxlQUFPLGFBQVAsR0FBdUIsRUFBdkI7OztBQUdBLGVBQU8sT0FBUCxHQUFpQixDQUFDLENBQUMsS0FBSyxPQUF4QjtBQUNBLGVBQU8sbUJBQVAsR0FBNkIsS0FBSyxtQkFBTCxJQUE0QixDQUF6RDtBQUNBLGVBQU8sa0JBQVAsR0FBNEIsS0FBSyxrQkFBTCxJQUEyQixHQUF2RDtBQUNBLGVBQU8sMEJBQVAsR0FBb0MsS0FBSywwQkFBTCxJQUFtQyxVQUF2RTs7O0FBR0EsZUFBTyxXQUFQLEdBQXFCLE9BQU8sVUFBUCxJQUFxQixPQUFPLElBQTVCLElBQW9DLENBQUMsQ0FBQyxLQUFLLFdBQWhFOztBQUVBLGVBQU8sTUFBUCxHQUFpQixPQUFPLFVBQVAsSUFBcUIsT0FBTyxLQUE1QixJQUFxQyxPQUFPLElBQTdDLEdBQXFELEVBQXJELEdBQTJELEtBQUssTUFBTCxJQUFlLEVBQTFGOztBQUVBLGVBQU8sU0FBUCxHQUFtQixLQUFLLFNBQUwsS0FBbUIsT0FBTyxJQUFQLEdBQWMsR0FBZCxHQUFxQixPQUFPLE9BQVAsR0FBaUIsR0FBakIsR0FBdUIsR0FBL0QsQ0FBbkI7QUFDQSxlQUFPLFdBQVAsR0FBcUIsSUFBSSxNQUFKLENBQVcsT0FBTyxTQUFsQixFQUE2QixHQUE3QixDQUFyQjs7QUFFQSxlQUFPLE1BQVAsR0FBZ0IsS0FBSyxNQUFMLElBQWUsRUFBL0I7QUFDQSxlQUFPLFlBQVAsR0FBc0IsT0FBTyxNQUFQLENBQWMsTUFBcEM7O0FBRUEsZUFBTyxTQUFQLEdBQW1CLENBQW5COztBQUVBLGVBQU8sU0FBUCxHQUFtQixLQUFuQjtBQUNBLGVBQU8sTUFBUCxHQUFnQixFQUFoQjs7QUFFQSxlQUFPLE1BQVA7QUFDSDtBQTVDbUIsQ0FBeEI7O0FBK0NBLElBQUksUUFBTyxNQUFQLHlDQUFPLE1BQVAsT0FBa0IsUUFBbEIsSUFBOEIsUUFBTyxPQUFPLE9BQWQsTUFBMEIsUUFBNUQsRUFBc0U7QUFDbEUsV0FBTyxPQUFQLEdBQWlCLFVBQVUsaUJBQTNCO0FBQ0g7Ozs7OztBQ3hERDs7OztBQUVBLElBQUkscUJBQXFCO0FBQ3JCLFlBQVE7QUFDSixjQUFlLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBRFg7QUFFSixjQUFlLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLENBRlg7QUFHSixnQkFBZSxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxDQUhYO0FBSUosb0JBQWUsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLENBSlg7QUFLSixpQkFBZSxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsQ0FMWDtBQU1KLHNCQUFlLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixDQU5YO0FBT0osYUFBZSxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsQ0FQWDtBQVFKLHVCQUFlLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixDQVJYO0FBU0osc0JBQWUsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWO0FBVFgsS0FEYTs7QUFhckIsUUFBSTs7QUFFQSxjQUFNLG9CQUZOOzs7QUFLQSxjQUFNLGdCQUxOOzs7QUFRQSxnQkFBUSxtQ0FSUjs7O0FBV0Esb0JBQVksMEJBWFo7OztBQWNBLGlCQUFTLDJCQWRUOzs7QUFpQkEsc0JBQWMsa0JBakJkOzs7QUFvQkEsYUFBSztBQXBCTCxLQWJpQjs7QUFvQ3JCLG9CQUFnQix3QkFBVSxLQUFWLEVBQWlCLFVBQWpCLEVBQTZCO0FBQ3pDLFlBQUksU0FBUyxtQkFBbUIsTUFBaEM7QUFBQSxZQUNJLEtBQUssbUJBQW1CLEVBRDVCOzs7Ozs7QUFPQSxxQkFBYSxDQUFDLENBQUMsVUFBZjs7QUFFQSxZQUFJLEdBQUcsSUFBSCxDQUFRLElBQVIsQ0FBYSxLQUFiLENBQUosRUFBeUI7QUFDckIsbUJBQU8sT0FBTyxJQUFkO0FBQ0gsU0FGRCxNQUVPLElBQUksR0FBRyxJQUFILENBQVEsSUFBUixDQUFhLEtBQWIsQ0FBSixFQUF5QjtBQUM1QixtQkFBTyxPQUFPLElBQWQ7QUFDSCxTQUZNLE1BRUEsSUFBSSxHQUFHLE1BQUgsQ0FBVSxJQUFWLENBQWUsS0FBZixDQUFKLEVBQTJCO0FBQzlCLG1CQUFPLE9BQU8sTUFBZDtBQUNILFNBRk0sTUFFQSxJQUFJLEdBQUcsVUFBSCxDQUFjLElBQWQsQ0FBbUIsS0FBbkIsQ0FBSixFQUErQjtBQUNsQyxtQkFBTyxPQUFPLFVBQWQ7QUFDSCxTQUZNLE1BRUEsSUFBSSxHQUFHLE9BQUgsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLENBQUosRUFBNEI7QUFDL0IsbUJBQU8sT0FBTyxPQUFkO0FBQ0gsU0FGTSxNQUVBLElBQUksR0FBRyxZQUFILENBQWdCLElBQWhCLENBQXFCLEtBQXJCLENBQUosRUFBaUM7QUFDcEMsbUJBQU8sT0FBTyxZQUFkO0FBQ0gsU0FGTSxNQUVBLElBQUksR0FBRyxHQUFILENBQU8sSUFBUCxDQUFZLEtBQVosQ0FBSixFQUF3QjtBQUMzQixtQkFBTyxPQUFPLEdBQWQ7QUFDSCxTQUZNLE1BRUEsSUFBSSxVQUFKLEVBQWdCO0FBQ25CLG1CQUFPLE9BQU8sYUFBZDtBQUNILFNBRk0sTUFFQTtBQUNILG1CQUFPLE9BQU8sWUFBZDtBQUNIO0FBQ0o7QUFqRW9CLENBQXpCOztBQW9FQSxJQUFJLFFBQU8sTUFBUCx5Q0FBTyxNQUFQLE9BQWtCLFFBQWxCLElBQThCLFFBQU8sT0FBTyxPQUFkLE1BQTBCLFFBQTVELEVBQXNFO0FBQ2xFLFdBQU8sT0FBUCxHQUFpQixVQUFVLGtCQUEzQjtBQUNIOzs7Ozs7QUN4RUQ7Ozs7QUFFQSxJQUFJLGdCQUFnQixTQUFoQixhQUFnQixDQUFVLFdBQVYsRUFBdUI7QUFDdkMsUUFBSSxRQUFRLElBQVo7O0FBRUEsVUFBTSxNQUFOLEdBQWUsRUFBZjtBQUNBLFVBQU0sV0FBTixHQUFvQixXQUFwQjtBQUNBLFVBQU0sVUFBTjtBQUNILENBTkQ7O0FBUUEsY0FBYyxTQUFkLEdBQTBCO0FBQ3RCLGdCQUFZLHNCQUFZO0FBQ3BCLFlBQUksUUFBUSxJQUFaO0FBQ0EsY0FBTSxXQUFOLENBQWtCLE9BQWxCLENBQTBCLFVBQVUsS0FBVixFQUFpQjtBQUN2QyxnQkFBSSxVQUFVLEdBQWQsRUFBbUI7QUFDZixzQkFBTSxNQUFOLENBQWEsSUFBYixDQUFrQixDQUFsQjtBQUNILGFBRkQsTUFFTztBQUNILHNCQUFNLE1BQU4sQ0FBYSxJQUFiLENBQWtCLENBQWxCO0FBQ0g7QUFDSixTQU5EO0FBT0gsS0FWcUI7O0FBWXRCLGVBQVcscUJBQVk7QUFDbkIsZUFBTyxLQUFLLE1BQVo7QUFDSCxLQWRxQjs7QUFnQnRCLHNCQUFrQiwwQkFBVSxLQUFWLEVBQWlCO0FBQy9CLFlBQUksUUFBUSxJQUFaO0FBQUEsWUFBa0IsU0FBUyxFQUEzQjs7QUFFQSxnQkFBUSxNQUFNLE9BQU4sQ0FBYyxRQUFkLEVBQXdCLEVBQXhCLENBQVI7O0FBRUEsY0FBTSxNQUFOLENBQWEsT0FBYixDQUFxQixVQUFVLE1BQVYsRUFBa0IsS0FBbEIsRUFBeUI7QUFDMUMsZ0JBQUksTUFBTSxNQUFOLEdBQWUsQ0FBbkIsRUFBc0I7QUFDbEIsb0JBQUksTUFBTSxNQUFNLEtBQU4sQ0FBWSxDQUFaLEVBQWUsTUFBZixDQUFWO0FBQUEsb0JBQ0ksT0FBTyxNQUFNLEtBQU4sQ0FBWSxNQUFaLENBRFg7O0FBR0Esd0JBQVEsTUFBTSxXQUFOLENBQWtCLEtBQWxCLENBQVI7QUFDQSx5QkFBSyxHQUFMO0FBQ0ksNEJBQUksU0FBUyxHQUFULEVBQWMsRUFBZCxJQUFvQixFQUF4QixFQUE0QjtBQUN4QixrQ0FBTSxJQUFOO0FBQ0g7QUFDRDtBQUNKLHlCQUFLLEdBQUw7QUFDSSw0QkFBSSxTQUFTLEdBQVQsRUFBYyxFQUFkLElBQW9CLEVBQXhCLEVBQTRCO0FBQ3hCLGtDQUFNLElBQU47QUFDSDtBQUNEO0FBVko7O0FBYUEsMEJBQVUsR0FBVjs7O0FBR0Esd0JBQVEsSUFBUjtBQUNIO0FBQ0osU0F2QkQ7O0FBeUJBLGVBQU8sTUFBUDtBQUNIO0FBL0NxQixDQUExQjs7QUFrREEsSUFBSSxRQUFPLE1BQVAseUNBQU8sTUFBUCxPQUFrQixRQUFsQixJQUE4QixRQUFPLE9BQU8sT0FBZCxNQUEwQixRQUE1RCxFQUFzRTtBQUNsRSxXQUFPLE9BQVAsR0FBaUIsVUFBVSxhQUEzQjtBQUNIOzs7Ozs7QUM5REQ7Ozs7QUFFQSxJQUFJLG1CQUFtQixTQUFuQixnQkFBbUIsQ0FBVSxrQkFBVixFQUNVLG1CQURWLEVBRVUsMEJBRlYsRUFHVSxTQUhWLEVBR3FCO0FBQ3hDLFFBQUksUUFBUSxJQUFaOztBQUVBLFVBQU0sa0JBQU4sR0FBMkIsa0JBQTNCO0FBQ0EsVUFBTSxtQkFBTixHQUE0QixtQkFBNUI7QUFDQSxVQUFNLDBCQUFOLEdBQW1DLDBCQUFuQztBQUNBLFVBQU0sU0FBTixHQUFrQixTQUFsQjtBQUNILENBVkQ7O0FBWUEsaUJBQWlCLFVBQWpCLEdBQThCO0FBQzFCLGNBQVUsVUFEZ0I7QUFFMUIsVUFBVSxNQUZnQjtBQUcxQixTQUFVO0FBSGdCLENBQTlCOztBQU1BLGlCQUFpQixTQUFqQixHQUE2QjtBQUN6QixZQUFRLGdCQUFVLEtBQVYsRUFBaUI7QUFDckIsWUFBSSxRQUFRLElBQVo7QUFBQSxZQUFrQixLQUFsQjtBQUFBLFlBQXlCLFdBQXpCO0FBQUEsWUFBc0MsY0FBYyxFQUFwRDs7O0FBR0EsZ0JBQVEsTUFBTSxPQUFOLENBQWMsV0FBZCxFQUEyQixFQUEzQjs7O0FBQUEsU0FHSCxPQUhHLENBR0ssTUFBTSxrQkFIWCxFQUcrQixHQUgvQjs7O0FBQUEsU0FNSCxPQU5HLENBTUssU0FOTCxFQU1nQixFQU5oQjs7O0FBQUEsU0FTSCxPQVRHLENBU0ssR0FUTCxFQVNVLE1BQU0sa0JBVGhCLENBQVI7O0FBV0Esc0JBQWMsS0FBZDs7QUFFQSxZQUFJLE1BQU0sT0FBTixDQUFjLE1BQU0sa0JBQXBCLEtBQTJDLENBQS9DLEVBQWtEO0FBQzlDLG9CQUFRLE1BQU0sS0FBTixDQUFZLE1BQU0sa0JBQWxCLENBQVI7QUFDQSwwQkFBYyxNQUFNLENBQU4sQ0FBZDtBQUNBLDBCQUFjLE1BQU0sa0JBQU4sR0FBMkIsTUFBTSxDQUFOLEVBQVMsS0FBVCxDQUFlLENBQWYsRUFBa0IsTUFBTSxtQkFBeEIsQ0FBekM7QUFDSDs7QUFFRCxnQkFBUSxNQUFNLDBCQUFkO0FBQ0EsaUJBQUssaUJBQWlCLFVBQWpCLENBQTRCLElBQWpDO0FBQ0ksOEJBQWMsWUFBWSxPQUFaLENBQW9CLHFCQUFwQixFQUEyQyxPQUFPLE1BQU0sU0FBeEQsQ0FBZDs7QUFFQTs7QUFFSixpQkFBSyxpQkFBaUIsVUFBakIsQ0FBNEIsR0FBakM7QUFDSSw4QkFBYyxZQUFZLE9BQVosQ0FBb0Isb0JBQXBCLEVBQTBDLE9BQU8sTUFBTSxTQUF2RCxDQUFkOztBQUVBOztBQUVKO0FBQ0ksOEJBQWMsWUFBWSxPQUFaLENBQW9CLG9CQUFwQixFQUEwQyxPQUFPLE1BQU0sU0FBdkQsQ0FBZDtBQVpKOztBQWVBLGVBQU8sWUFBWSxRQUFaLEtBQXlCLFlBQVksUUFBWixFQUFoQztBQUNIO0FBeEN3QixDQUE3Qjs7QUEyQ0EsSUFBSSxRQUFPLE1BQVAseUNBQU8sTUFBUCxPQUFrQixRQUFsQixJQUE4QixRQUFPLE9BQU8sT0FBZCxNQUEwQixRQUE1RCxFQUFzRTtBQUNsRSxXQUFPLE9BQVAsR0FBaUIsVUFBVSxnQkFBM0I7QUFDSDs7Ozs7O0FDakVEOzs7O0FBRUEsSUFBSSxpQkFBaUIsU0FBakIsY0FBaUIsQ0FBVSxTQUFWLEVBQXFCLFNBQXJCLEVBQWdDO0FBQ2pELFFBQUksUUFBUSxJQUFaOztBQUVBLFVBQU0sU0FBTixHQUFrQixhQUFhLEdBQS9CO0FBQ0EsVUFBTSxXQUFOLEdBQW9CLElBQUksTUFBSixDQUFXLE1BQU0sU0FBakIsRUFBNEIsR0FBNUIsQ0FBcEI7QUFDQSxVQUFNLFNBQU4sR0FBa0IsU0FBbEI7QUFDSCxDQU5EOztBQVFBLGVBQWUsU0FBZixHQUEyQjtBQUN2QixrQkFBYyxzQkFBVSxTQUFWLEVBQXFCO0FBQy9CLGFBQUssU0FBTCxHQUFpQixTQUFqQjtBQUNILEtBSHNCOztBQUt2QixZQUFRLGdCQUFVLFdBQVYsRUFBdUI7QUFDM0IsWUFBSSxRQUFRLElBQVo7O0FBRUEsY0FBTSxTQUFOLENBQWdCLEtBQWhCOzs7QUFHQSxzQkFBYyxZQUFZLE9BQVosQ0FBb0IsU0FBcEIsRUFBK0IsRUFBL0IsQ0FBZDs7O0FBR0Esc0JBQWMsWUFBWSxPQUFaLENBQW9CLE1BQU0sV0FBMUIsRUFBdUMsRUFBdkMsQ0FBZDs7QUFFQSxZQUFJLFNBQVMsRUFBYjtBQUFBLFlBQWlCLE9BQWpCO0FBQUEsWUFBMEIsWUFBWSxLQUF0Qzs7QUFFQSxhQUFLLElBQUksSUFBSSxDQUFSLEVBQVcsT0FBTyxZQUFZLE1BQW5DLEVBQTJDLElBQUksSUFBL0MsRUFBcUQsR0FBckQsRUFBMEQ7QUFDdEQsc0JBQVUsTUFBTSxTQUFOLENBQWdCLFVBQWhCLENBQTJCLFlBQVksTUFBWixDQUFtQixDQUFuQixDQUEzQixDQUFWOzs7QUFHQSxnQkFBSSxXQUFXLElBQVgsQ0FBZ0IsT0FBaEIsQ0FBSixFQUE4QjtBQUMxQix5QkFBUyxPQUFUOztBQUVBLDRCQUFZLElBQVo7QUFDSCxhQUpELE1BSU87QUFDSCxvQkFBSSxDQUFDLFNBQUwsRUFBZ0I7QUFDWiw2QkFBUyxPQUFUO0FBQ0g7OztBQUdKO0FBQ0o7Ozs7QUFJRCxpQkFBUyxPQUFPLE9BQVAsQ0FBZSxPQUFmLEVBQXdCLEVBQXhCLENBQVQ7O0FBRUEsaUJBQVMsT0FBTyxPQUFQLENBQWUsUUFBZixFQUF5QixNQUFNLFNBQS9CLENBQVQ7O0FBRUEsZUFBTyxNQUFQO0FBQ0g7QUExQ3NCLENBQTNCOztBQTZDQSxJQUFJLFFBQU8sTUFBUCx5Q0FBTyxNQUFQLE9BQWtCLFFBQWxCLElBQThCLFFBQU8sT0FBTyxPQUFkLE1BQTBCLFFBQTVELEVBQXNFO0FBQ2xFLFdBQU8sT0FBUCxHQUFpQixVQUFVLGNBQTNCO0FBQ0g7Ozs7OztBQ3pERDs7OztBQUVBLElBQUksT0FBTztBQUNQLFVBQU0sZ0JBQVksQ0FDakIsQ0FGTTs7QUFJUCxXQUFPLGVBQVUsS0FBVixFQUFpQixFQUFqQixFQUFxQjtBQUN4QixlQUFPLE1BQU0sT0FBTixDQUFjLEVBQWQsRUFBa0IsRUFBbEIsQ0FBUDtBQUNILEtBTk07O0FBUVAsYUFBUyxpQkFBVSxHQUFWLEVBQWUsTUFBZixFQUF1QjtBQUM1QixlQUFPLElBQUksS0FBSixDQUFVLENBQVYsRUFBYSxNQUFiLENBQVA7QUFDSCxLQVZNOztBQVlQLGtCQUFjLHNCQUFVLE1BQVYsRUFBa0I7QUFDNUIsZUFBTyxPQUFPLE1BQVAsQ0FBYyxVQUFVLFFBQVYsRUFBb0IsT0FBcEIsRUFBNkI7QUFDOUMsbUJBQU8sV0FBVyxPQUFsQjtBQUNILFNBRk0sRUFFSixDQUZJLENBQVA7QUFHSCxLQWhCTTs7QUFrQlAsMkJBQXVCLCtCQUFVLEtBQVYsRUFBaUIsTUFBakIsRUFBeUI7QUFDNUMsWUFBSSxlQUFlLE9BQU8sTUFBMUI7QUFBQSxZQUNJLGlCQURKOztBQUdBLFlBQUksaUJBQWlCLENBQXJCLEVBQXdCO0FBQ3BCLG1CQUFPLEtBQVA7QUFDSDs7QUFFRCw0QkFBb0IsTUFBTSxLQUFOLENBQVksQ0FBWixFQUFlLFlBQWYsQ0FBcEI7O0FBRUEsWUFBSSxrQkFBa0IsTUFBbEIsR0FBMkIsWUFBL0IsRUFBNkM7QUFDekMsb0JBQVEsTUFBUjtBQUNILFNBRkQsTUFFTyxJQUFJLHNCQUFzQixNQUExQixFQUFrQztBQUNyQyxvQkFBUSxTQUFTLE1BQU0sS0FBTixDQUFZLFlBQVosQ0FBakI7QUFDSDs7QUFFRCxlQUFPLEtBQVA7QUFDSCxLQW5DTTs7QUFxQ1AsdUJBQW1CLDJCQUFVLEtBQVYsRUFBaUIsTUFBakIsRUFBeUIsWUFBekIsRUFBdUMsU0FBdkMsRUFBa0Q7QUFDakUsWUFBSSxTQUFTLEVBQWI7O0FBRUEsZUFBTyxPQUFQLENBQWUsVUFBVSxNQUFWLEVBQWtCLEtBQWxCLEVBQXlCO0FBQ3BDLGdCQUFJLE1BQU0sTUFBTixHQUFlLENBQW5CLEVBQXNCO0FBQ2xCLG9CQUFJLE1BQU0sTUFBTSxLQUFOLENBQVksQ0FBWixFQUFlLE1BQWYsQ0FBVjtBQUFBLG9CQUNJLE9BQU8sTUFBTSxLQUFOLENBQVksTUFBWixDQURYOztBQUdBLDBCQUFVLEdBQVY7O0FBRUEsb0JBQUksSUFBSSxNQUFKLEtBQWUsTUFBZixJQUF5QixRQUFRLGVBQWUsQ0FBcEQsRUFBdUQ7QUFDbkQsOEJBQVUsU0FBVjtBQUNIOzs7QUFHRCx3QkFBUSxJQUFSO0FBQ0g7QUFDSixTQWREOztBQWdCQSxlQUFPLE1BQVA7QUFDSDtBQXpETSxDQUFYOztBQTREQSxJQUFJLFFBQU8sTUFBUCx5Q0FBTyxNQUFQLE9BQWtCLFFBQWxCLElBQThCLFFBQU8sT0FBTyxPQUFkLE1BQTBCLFFBQTVELEVBQXNFO0FBQ2xFLFdBQU8sT0FBUCxHQUFpQixVQUFVLElBQTNCO0FBQ0giLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IENsZWF2ZSBmcm9tICcuL3NyYy9DbGVhdmUucmVhY3QnO1xuXG5leHBvcnQgZGVmYXVsdCBDbGVhdmU7XG4iLCIvKiBqc2xpbnQgbm9kZTogdHJ1ZSAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBOdW1lcmFsRm9ybWF0dGVyID0gcmVxdWlyZSgnLi9zaG9ydGN1dHMvTnVtZXJhbEZvcm1hdHRlcicpO1xudmFyIERhdGVGb3JtYXR0ZXIgPSByZXF1aXJlKCcuL3Nob3J0Y3V0cy9EYXRlRm9ybWF0dGVyJyk7XG52YXIgUGhvbmVGb3JtYXR0ZXIgPSByZXF1aXJlKCcuL3Nob3J0Y3V0cy9QaG9uZUZvcm1hdHRlcicpO1xudmFyIENyZWRpdENhcmREZXRlY3RvciA9IHJlcXVpcmUoJy4vc2hvcnRjdXRzL0NyZWRpdENhcmREZXRlY3RvcicpO1xudmFyIFV0aWwgPSByZXF1aXJlKCcuL3V0aWxzL1V0aWwnKTtcbnZhciBEZWZhdWx0UHJvcGVydGllcyA9IHJlcXVpcmUoJy4vY29tbW9uL0RlZmF1bHRQcm9wZXJ0aWVzJyk7XG5cbnZhciBDbGVhdmUgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgfSxcblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uIChuZXh0UHJvcHMpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIHBob25lUmVnaW9uQ29kZSA9IG5leHRQcm9wcy5vcHRpb25zLnBob25lUmVnaW9uQ29kZTtcblxuICAgICAgICAvLyB1cGRhdGUgcGhvbmUgcmVnaW9uIGNvZGVcbiAgICAgICAgaWYgKHBob25lUmVnaW9uQ29kZSAmJiBwaG9uZVJlZ2lvbkNvZGUgIT09IG93bmVyLnByb3BlcnRpZXMucGhvbmVSZWdpb25Db2RlKSB7XG4gICAgICAgICAgICBvd25lci5wcm9wZXJ0aWVzLnBob25lUmVnaW9uQ29kZSA9IHBob25lUmVnaW9uQ29kZTtcbiAgICAgICAgICAgIG93bmVyLmluaXRQaG9uZUZvcm1hdHRlcigpO1xuICAgICAgICAgICAgb3duZXIub25JbnB1dChvd25lci5wcm9wZXJ0aWVzLnJlc3VsdCk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgZ2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdnZXQgaW5pIHN0YXRlJyk7XG5cbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIHsgdmFsdWUsIG9wdGlvbnMsIG9uS2V5ZG93biwgb25DaGFuZ2UsIC4uLm90aGVyIH0gPSBvd25lci5wcm9wcztcblxuICAgICAgICBvd25lci5yZWdpc3RlcmVkRXZlbnRzID0ge1xuICAgICAgICAgICAgb25DaGFuZ2U6ICBvbkNoYW5nZSB8fCBVdGlsLm5vb3AsXG4gICAgICAgICAgICBvbktleWRvd246IG9uS2V5ZG93biB8fCBVdGlsLm5vb3BcbiAgICAgICAgfTtcblxuICAgICAgICBvd25lci5wcm9wZXJ0aWVzID0gRGVmYXVsdFByb3BlcnRpZXMuYXNzaWduKHt9LCBvcHRpb25zKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgb3RoZXI6IG90aGVyLFxuICAgICAgICAgICAgdmFsdWU6IG93bmVyLnByb3BlcnRpZXMucmVzdWx0XG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XG5cbiAgICAgICAgLy8gc28gbm8gbmVlZCBmb3IgdGhpcyBsaWIgYXQgYWxsXG4gICAgICAgIGlmICghcHBzLm51bWVyYWwgJiYgIXBwcy5waG9uZSAmJiAhcHBzLmNyZWRpdENhcmQgJiYgIXBwcy5kYXRlICYmIHBwcy5ibG9ja3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBwcHMubWF4TGVuZ3RoID0gVXRpbC5nZXRNYXhMZW5ndGgocHBzLmJsb2Nrcyk7XG5cbiAgICAgICAgb3duZXIuaW5pdFBob25lRm9ybWF0dGVyKCk7XG4gICAgICAgIG93bmVyLmluaXREYXRlRm9ybWF0dGVyKCk7XG4gICAgICAgIG93bmVyLmluaXROdW1lcmFsRm9ybWF0dGVyKCk7XG5cbiAgICAgICAgb3duZXIub25JbnB1dChwcHMucmVzdWx0KTtcbiAgICB9LFxuXG4gICAgaW5pdE51bWVyYWxGb3JtYXR0ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XG5cbiAgICAgICAgaWYgKCFwcHMubnVtZXJhbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcHBzLm51bWVyYWxGb3JtYXR0ZXIgPSBuZXcgTnVtZXJhbEZvcm1hdHRlcihcbiAgICAgICAgICAgIHBwcy5udW1lcmFsRGVjaW1hbE1hcmssXG4gICAgICAgICAgICBwcHMubnVtZXJhbERlY2ltYWxTY2FsZSxcbiAgICAgICAgICAgIHBwcy5udW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSxcbiAgICAgICAgICAgIHBwcy5kZWxpbWl0ZXJcbiAgICAgICAgKTtcbiAgICB9LFxuXG4gICAgaW5pdERhdGVGb3JtYXR0ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XG5cbiAgICAgICAgaWYgKCFwcHMuZGF0ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcHBzLmRhdGVGb3JtYXR0ZXIgPSBuZXcgRGF0ZUZvcm1hdHRlcihwcHMuZGF0ZVBhdHRlcm4pO1xuICAgICAgICBwcHMuYmxvY2tzID0gcHBzLmRhdGVGb3JtYXR0ZXIuZ2V0QmxvY2tzKCk7XG4gICAgICAgIHBwcy5ibG9ja3NMZW5ndGggPSBwcHMuYmxvY2tzLmxlbmd0aDtcbiAgICAgICAgcHBzLm1heExlbmd0aCA9IFV0aWwuZ2V0TWF4TGVuZ3RoKHBwcy5ibG9ja3MpO1xuICAgIH0sXG5cbiAgICBpbml0UGhvbmVGb3JtYXR0ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIHBwcyA9IG93bmVyLnByb3BlcnRpZXM7XG5cbiAgICAgICAgaWYgKCFwcHMucGhvbmUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENsZWF2ZS5Bc1lvdVR5cGVGb3JtYXR0ZXIgc2hvdWxkIGJlIHByb3ZpZGVkIGJ5XG4gICAgICAgIC8vIGV4dGVybmFsIGdvb2dsZSBjbG9zdXJlIGxpYlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcHBzLnBob25lRm9ybWF0dGVyID0gbmV3IFBob25lRm9ybWF0dGVyKFxuICAgICAgICAgICAgICAgIG5ldyB3aW5kb3cuQ2xlYXZlLkFzWW91VHlwZUZvcm1hdHRlcihwcHMucGhvbmVSZWdpb25Db2RlKSxcbiAgICAgICAgICAgICAgICBwcHMuZGVsaW1pdGVyXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQbGVhc2UgaW5jbHVkZSBwaG9uZS10eXBlLWZvcm1hdHRlci57Y291bnRyeX0uanMgbGliJyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgb25LZXlkb3duOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIHBwcyA9IG93bmVyLnByb3BlcnRpZXMsXG4gICAgICAgICAgICBjaGFyQ29kZSA9IGV2ZW50LndoaWNoIHx8IGV2ZW50LmtleUNvZGU7XG5cbiAgICAgICAgLy8gaGl0IGJhY2tzcGFjZSB3aGVuIGxhc3QgY2hhcmFjdGVyIGlzIGRlbGltaXRlclxuICAgICAgICBpZiAoY2hhckNvZGUgPT09IDggJiYgcHBzLnJlc3VsdC5zbGljZSgtMSkgPT09IHBwcy5kZWxpbWl0ZXIpIHtcbiAgICAgICAgICAgIHBwcy5iYWNrc3BhY2UgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHBzLmJhY2tzcGFjZSA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgb3duZXIucmVnaXN0ZXJlZEV2ZW50cy5vbktleWRvd24oZXZlbnQpO1xuICAgIH0sXG5cbiAgICBvbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXM7XG5cbiAgICAgICAgb3duZXIub25JbnB1dChldmVudC50YXJnZXQudmFsdWUpO1xuICAgICAgICBvd25lci5yZWdpc3RlcmVkRXZlbnRzLm9uQ2hhbmdlKGV2ZW50KTtcbiAgICB9LFxuXG4gICAgb25JbnB1dDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHBwcyA9IG93bmVyLnByb3BlcnRpZXMsXG4gICAgICAgICAgICBwcmV2ID0gcHBzLnJlc3VsdDtcblxuICAgICAgICAvLyBjYXNlIDE6IGRlbGV0ZSBvbmUgbW9yZSBjaGFyYWN0ZXIgXCI0XCJcbiAgICAgICAgLy8gMTIzNCp8IC0+IGhpdCBiYWNrc3BhY2UgLT4gMTIzfFxuICAgICAgICAvLyBjYXNlIDI6IGxhc3QgY2hhcmFjdGVyIGlzIG5vdCBkZWxpbWl0ZXIgd2hpY2ggaXM6XG4gICAgICAgIC8vIDEyfDM0KiAtPiBoaXQgYmFja3NwYWNlIC0+IDF8MzQqXG5cbiAgICAgICAgaWYgKHBwcy5iYWNrc3BhY2UgJiYgdmFsdWUuc2xpY2UoLTEpICE9PSBwcHMuZGVsaW1pdGVyKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IFV0aWwuaGVhZFN0cih2YWx1ZSwgdmFsdWUubGVuZ3RoIC0gMSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBwaG9uZSBmb3JtYXR0ZXJcbiAgICAgICAgaWYgKHBwcy5waG9uZSkge1xuICAgICAgICAgICAgcHBzLnJlc3VsdCA9IHBwcy5waG9uZUZvcm1hdHRlci5mb3JtYXQodmFsdWUpO1xuICAgICAgICAgICAgb3duZXIudXBkYXRlVmFsdWVTdGF0ZSgpO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBudW1lcmFsIGZvcm1hdHRlclxuICAgICAgICBpZiAocHBzLm51bWVyYWwpIHtcbiAgICAgICAgICAgIHBwcy5yZXN1bHQgPSBwcHMubnVtZXJhbEZvcm1hdHRlci5mb3JtYXQodmFsdWUpO1xuICAgICAgICAgICAgb3duZXIudXBkYXRlVmFsdWVTdGF0ZSgpO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBkYXRlXG4gICAgICAgIGlmIChwcHMuZGF0ZSkge1xuICAgICAgICAgICAgdmFsdWUgPSBwcHMuZGF0ZUZvcm1hdHRlci5nZXRWYWxpZGF0ZWREYXRlKHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHN0cmlwIGRlbGltaXRlcnNcbiAgICAgICAgdmFsdWUgPSBVdGlsLnN0cmlwKHZhbHVlLCBwcHMuZGVsaW1pdGVyUkUpO1xuXG4gICAgICAgIC8vIHByZWZpeFxuICAgICAgICB2YWx1ZSA9IFV0aWwuZ2V0UHJlZml4QXBwbGllZFZhbHVlKHZhbHVlLCBwcHMucHJlZml4KTtcblxuICAgICAgICAvLyBzdHJpcCBub24tbnVtZXJpYyBjaGFyYWN0ZXJzXG4gICAgICAgIGlmIChwcHMubnVtZXJpY09ubHkpIHtcbiAgICAgICAgICAgIHZhbHVlID0gVXRpbC5zdHJpcCh2YWx1ZSwgL1teXFxkXS9nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHVwZGF0ZSBjcmVkaXQgY2FyZCBibG9ja3NcbiAgICAgICAgLy8gYW5kIGF0IGxlYXN0IG9uZSBvZiBmaXJzdCA0IGNoYXJhY3RlcnMgaGFzIGNoYW5nZWRcbiAgICAgICAgaWYgKHBwcy5jcmVkaXRDYXJkICYmIFV0aWwuaGVhZFN0cihwcHMucmVzdWx0LCA0KSAhPT0gVXRpbC5oZWFkU3RyKHZhbHVlLCA0KSkge1xuICAgICAgICAgICAgcHBzLmJsb2NrcyA9IENyZWRpdENhcmREZXRlY3Rvci5nZXRCbG9ja3NCeVBBTih2YWx1ZSwgcHBzLmNyZWRpdENhcmRTdHJpY3RNb2RlKTtcbiAgICAgICAgICAgIHBwcy5ibG9ja3NMZW5ndGggPSBwcHMuYmxvY2tzLmxlbmd0aDtcbiAgICAgICAgICAgIHBwcy5tYXhMZW5ndGggPSBVdGlsLmdldE1heExlbmd0aChwcHMuYmxvY2tzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHN0cmlwIG92ZXIgbGVuZ3RoIGNoYXJhY3RlcnNcbiAgICAgICAgdmFsdWUgPSBVdGlsLmhlYWRTdHIodmFsdWUsIHBwcy5tYXhMZW5ndGgpO1xuXG4gICAgICAgIC8vIGFwcGx5IGJsb2Nrc1xuICAgICAgICBwcHMucmVzdWx0ID0gVXRpbC5nZXRGb3JtYXR0ZWRWYWx1ZSh2YWx1ZSwgcHBzLmJsb2NrcywgcHBzLmJsb2Nrc0xlbmd0aCwgcHBzLmRlbGltaXRlcik7XG5cbiAgICAgICAgLy8gbm90aGluZyBjaGFuZ2VkXG4gICAgICAgIC8vIHByZXZlbnQgdXBkYXRlIHZhbHVlIHRvIGF2b2lkIGNhcmV0IHBvc2l0aW9uIGNoYW5nZVxuICAgICAgICBpZiAocHJldiA9PT0gcHBzLnJlc3VsdCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgb3duZXIudXBkYXRlVmFsdWVTdGF0ZSgpO1xuICAgIH0sXG5cbiAgICB1cGRhdGVWYWx1ZVN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3ZhbHVlOiB0aGlzLnByb3BlcnRpZXMucmVzdWx0fSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzO1xuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiB7Li4ub3duZXIuc3RhdGUub3RoZXJ9XG4gICAgICAgICAgICAgICAgICAgdmFsdWU9e293bmVyLnN0YXRlLnZhbHVlfVxuICAgICAgICAgICAgICAgICAgIG9uS2V5ZG93bj17b3duZXIub25LZXlkb3dufVxuICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtvd25lci5vbkNoYW5nZX0vPlxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy5DbGVhdmUgPSBDbGVhdmU7XG4iLCIvKmpzbGludCBub2RlOiB0cnVlICovXG4vKiBnbG9iYWwgbW9kdWxlOiB0cnVlLCBleHBvcnRzOiB0cnVlICovXG5cbid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBQcm9wcyBBc3NpZ25tZW50XG4gKlxuICogU2VwYXJhdGUgdGhpcywgc28gcmVhY3QgbW9kdWxlIGNhbiBzaGFyZSB0aGUgdXNhZ2VcbiAqL1xudmFyIERlZmF1bHRQcm9wZXJ0aWVzID0ge1xuICAgIC8vIE1heWJlIGNoYW5nZSB0byBvYmplY3QtYXNzaWduXG4gICAgLy8gZm9yIG5vdyBqdXN0IGtlZXAgaXQgYXMgc2ltcGxlXG4gICAgYXNzaWduOiBmdW5jdGlvbiAodGFyZ2V0LCBvcHRzKSB7XG4gICAgICAgIHRhcmdldCA9IHRhcmdldCB8fCB7fTtcbiAgICAgICAgb3B0cyA9IG9wdHMgfHwge307XG5cbiAgICAgICAgLy8gY3JlZGl0IGNhcmRcbiAgICAgICAgdGFyZ2V0LmNyZWRpdENhcmQgPSAhIW9wdHMuY3JlZGl0Q2FyZDtcbiAgICAgICAgdGFyZ2V0LmNyZWRpdENhcmRTdHJpY3RNb2RlID0gISFvcHRzLmNyZWRpdENhcmRTdHJpY3RNb2RlO1xuXG4gICAgICAgIC8vIHBob25lXG4gICAgICAgIHRhcmdldC5waG9uZSA9ICEhb3B0cy5waG9uZTtcbiAgICAgICAgdGFyZ2V0LnBob25lUmVnaW9uQ29kZSA9IG9wdHMucGhvbmVSZWdpb25Db2RlIHx8ICcnO1xuICAgICAgICB0YXJnZXQucGhvbmVGb3JtYXR0ZXIgPSB7fTtcblxuICAgICAgICAvLyBkYXRlXG4gICAgICAgIHRhcmdldC5kYXRlID0gISFvcHRzLmRhdGU7XG4gICAgICAgIHRhcmdldC5kYXRlUGF0dGVybiA9IG9wdHMuZGF0ZVBhdHRlcm4gfHwgWydkJywgJ20nLCAnWSddO1xuICAgICAgICB0YXJnZXQuZGF0ZUZvcm1hdHRlciA9IHt9O1xuXG4gICAgICAgIC8vIG51bWVyYWxcbiAgICAgICAgdGFyZ2V0Lm51bWVyYWwgPSAhIW9wdHMubnVtZXJhbDtcbiAgICAgICAgdGFyZ2V0Lm51bWVyYWxEZWNpbWFsU2NhbGUgPSBvcHRzLm51bWVyYWxEZWNpbWFsU2NhbGUgfHwgMjtcbiAgICAgICAgdGFyZ2V0Lm51bWVyYWxEZWNpbWFsTWFyayA9IG9wdHMubnVtZXJhbERlY2ltYWxNYXJrIHx8ICcuJztcbiAgICAgICAgdGFyZ2V0Lm51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlID0gb3B0cy5udW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSB8fCAndGhvdXNhbmQnO1xuXG4gICAgICAgIC8vIG90aGVyc1xuICAgICAgICB0YXJnZXQubnVtZXJpY09ubHkgPSB0YXJnZXQuY3JlZGl0Q2FyZCB8fCB0YXJnZXQuZGF0ZSB8fCAhIW9wdHMubnVtZXJpY09ubHk7XG5cbiAgICAgICAgdGFyZ2V0LnByZWZpeCA9ICh0YXJnZXQuY3JlZGl0Q2FyZCB8fCB0YXJnZXQucGhvbmUgfHwgdGFyZ2V0LmRhdGUpID8gJycgOiAob3B0cy5wcmVmaXggfHwgJycpO1xuXG4gICAgICAgIHRhcmdldC5kZWxpbWl0ZXIgPSBvcHRzLmRlbGltaXRlciB8fCAodGFyZ2V0LmRhdGUgPyAnLycgOiAodGFyZ2V0Lm51bWVyYWwgPyAnLCcgOiAnICcpKTtcbiAgICAgICAgdGFyZ2V0LmRlbGltaXRlclJFID0gbmV3IFJlZ0V4cCh0YXJnZXQuZGVsaW1pdGVyLCBcImdcIik7XG5cbiAgICAgICAgdGFyZ2V0LmJsb2NrcyA9IG9wdHMuYmxvY2tzIHx8IFtdO1xuICAgICAgICB0YXJnZXQuYmxvY2tzTGVuZ3RoID0gdGFyZ2V0LmJsb2Nrcy5sZW5ndGg7XG5cbiAgICAgICAgdGFyZ2V0Lm1heExlbmd0aCA9IDA7XG5cbiAgICAgICAgdGFyZ2V0LmJhY2tzcGFjZSA9IGZhbHNlO1xuICAgICAgICB0YXJnZXQucmVzdWx0ID0gJyc7XG5cbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG59O1xuXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IERlZmF1bHRQcm9wZXJ0aWVzO1xufVxuIiwiLypqc2xpbnQgbm9kZTogdHJ1ZSAqL1xuLyogZ2xvYmFsIG1vZHVsZTogdHJ1ZSwgZXhwb3J0czogdHJ1ZSAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBDcmVkaXRDYXJkRGV0ZWN0b3IgPSB7XG4gICAgYmxvY2tzOiB7XG4gICAgICAgIHVhdHA6ICAgICAgICAgIFs0LCA1LCA2XSxcbiAgICAgICAgYW1leDogICAgICAgICAgWzQsIDYsIDVdLFxuICAgICAgICBkaW5lcnM6ICAgICAgICBbNCwgNiwgNF0sXG4gICAgICAgIG1hc3RlcmNhcmQ6ICAgIFs0LCA0LCA0LCA0XSxcbiAgICAgICAgZGFua29ydDogICAgICAgWzQsIDQsIDQsIDRdLFxuICAgICAgICBpbnN0YXBheW1lbnQ6ICBbNCwgNCwgNCwgNF0sXG4gICAgICAgIGpjYjogICAgICAgICAgIFs0LCA0LCA0LCA0XSxcbiAgICAgICAgZ2VuZXJhbFN0cmljdDogWzQsIDQsIDQsIDddLFxuICAgICAgICBnZW5lcmFsTG9vc2U6ICBbNCwgNCwgNCwgNF1cbiAgICB9LFxuXG4gICAgcmU6IHtcbiAgICAgICAgLy8gc3RhcnRzIHdpdGggMTsgMTUgZGlnaXRzLCBub3Qgc3RhcnRzIHdpdGggMTgwMCAoamNiIGNhcmQpXG4gICAgICAgIHVhdHA6IC9eKD8hMTgwMCkxXFxkezAsMTR9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCAzNC8zNzsgMTUgZGlnaXRzXG4gICAgICAgIGFtZXg6IC9eM1s0N11cXGR7MCwxM30vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDMwMC0zMDUvMzA5IG9yIDM2LzM4LzM5OyAxNCBkaWdpdHNcbiAgICAgICAgZGluZXJzOiAvXjMoPzowKFswLTVdfDkpfFs2ODldXFxkPylcXGR7MCwxMX0vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDUxLTU1IG9yIDIyLTI3OyAxNiBkaWdpdHNcbiAgICAgICAgbWFzdGVyY2FyZDogL14oNVsxLTVdfDJbMi03XSlcXGR7MCwxNH0vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDUwMTkvNDE3NS80NTcxOyAxNiBkaWdpdHNcbiAgICAgICAgZGFua29ydDogL14oNTAxOXw0MTc1fDQ1NzEpXFxkezAsMTJ9LyxcblxuICAgICAgICAvLyBzdGFydHMgd2l0aCA2MzctNjM5OyAxNiBkaWdpdHNcbiAgICAgICAgaW5zdGFwYXltZW50OiAvXjYzWzctOV1cXGR7MCwxM30vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDIxMzEvMTgwMC8zNTsgMTYgZGlnaXRzXG4gICAgICAgIGpjYjogL14oPzoyMTMxfDE4MDB8MzVcXGR7MCwyfSlcXGR7MCwxMn0vXG4gICAgfSxcblxuICAgIGdldEJsb2Nrc0J5UEFOOiBmdW5jdGlvbiAodmFsdWUsIHN0cmljdE1vZGUpIHtcbiAgICAgICAgdmFyIGJsb2NrcyA9IENyZWRpdENhcmREZXRlY3Rvci5ibG9ja3MsXG4gICAgICAgICAgICByZSA9IENyZWRpdENhcmREZXRlY3Rvci5yZTtcblxuICAgICAgICAvLyBJbiB0aGVvcnksIGNyZWRpdCBjYXJkIGNhbiBoYXZlIHVwIHRvIDE5IGRpZ2l0cyBudW1iZXIuXG4gICAgICAgIC8vIFNldCBzdHJpY3RNb2RlIHRvIHRydWUgd2lsbCByZW1vdmUgdGhlIDE2IG1heC1sZW5ndGggcmVzdHJhaW4sXG4gICAgICAgIC8vIGhvd2V2ZXIsIEkgbmV2ZXIgZm91bmQgYW55IHdlYnNpdGUgdmFsaWRhdGUgY2FyZCBudW1iZXIgbGlrZVxuICAgICAgICAvLyB0aGlzLCBoZW5jZSBwcm9iYWJseSB5b3UgZG9uJ3QgbmVlZCB0byBlbmFibGUgdGhpcyBvcHRpb24uXG4gICAgICAgIHN0cmljdE1vZGUgPSAhIXN0cmljdE1vZGU7XG5cbiAgICAgICAgaWYgKHJlLmFtZXgudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBibG9ja3MuYW1leDtcbiAgICAgICAgfSBlbHNlIGlmIChyZS51YXRwLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gYmxvY2tzLnVhdHA7XG4gICAgICAgIH0gZWxzZSBpZiAocmUuZGluZXJzLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gYmxvY2tzLmRpbmVycztcbiAgICAgICAgfSBlbHNlIGlmIChyZS5tYXN0ZXJjYXJkLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gYmxvY2tzLm1hc3RlcmNhcmQ7XG4gICAgICAgIH0gZWxzZSBpZiAocmUuZGFua29ydC50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIGJsb2Nrcy5kYW5rb3J0O1xuICAgICAgICB9IGVsc2UgaWYgKHJlLmluc3RhcGF5bWVudC50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIGJsb2Nrcy5pbnN0YXBheW1lbnQ7XG4gICAgICAgIH0gZWxzZSBpZiAocmUuamNiLnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gYmxvY2tzLmpjYjtcbiAgICAgICAgfSBlbHNlIGlmIChzdHJpY3RNb2RlKSB7XG4gICAgICAgICAgICByZXR1cm4gYmxvY2tzLmdlbmVyYWxTdHJpY3Q7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gYmxvY2tzLmdlbmVyYWxMb29zZTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gQ3JlZGl0Q2FyZERldGVjdG9yO1xufVxuIiwiLypqc2xpbnQgbm9kZTogdHJ1ZSAqL1xuLyogZ2xvYmFsIG1vZHVsZTogdHJ1ZSwgZXhwb3J0czogdHJ1ZSAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBEYXRlRm9ybWF0dGVyID0gZnVuY3Rpb24gKGRhdGVQYXR0ZXJuKSB7XG4gICAgdmFyIG93bmVyID0gdGhpcztcblxuICAgIG93bmVyLmJsb2NrcyA9IFtdO1xuICAgIG93bmVyLmRhdGVQYXR0ZXJuID0gZGF0ZVBhdHRlcm47XG4gICAgb3duZXIuaW5pdEJsb2NrcygpO1xufTtcblxuRGF0ZUZvcm1hdHRlci5wcm90b3R5cGUgPSB7XG4gICAgaW5pdEJsb2NrczogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzO1xuICAgICAgICBvd25lci5kYXRlUGF0dGVybi5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlID09PSAnWScpIHtcbiAgICAgICAgICAgICAgICBvd25lci5ibG9ja3MucHVzaCg0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3duZXIuYmxvY2tzLnB1c2goMik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBnZXRCbG9ja3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tzO1xuICAgIH0sXG5cbiAgICBnZXRWYWxpZGF0ZWREYXRlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcmVzdWx0ID0gJyc7XG5cbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9bXlxcZF0vZywgJycpO1xuXG4gICAgICAgIG93bmVyLmJsb2Nrcy5mb3JFYWNoKGZ1bmN0aW9uIChsZW5ndGgsIGluZGV4KSB7XG4gICAgICAgICAgICBpZiAodmFsdWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBzdWIgPSB2YWx1ZS5zbGljZSgwLCBsZW5ndGgpLFxuICAgICAgICAgICAgICAgICAgICByZXN0ID0gdmFsdWUuc2xpY2UobGVuZ3RoKTtcblxuICAgICAgICAgICAgICAgIHN3aXRjaCAob3duZXIuZGF0ZVBhdHRlcm5baW5kZXhdKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnZCc6XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJzZUludChzdWIsIDEwKSA+IDMxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWIgPSAnMzEnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ20nOlxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyc2VJbnQoc3ViLCAxMCkgPiAxMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3ViID0gJzEyJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXN1bHQgKz0gc3ViO1xuXG4gICAgICAgICAgICAgICAgLy8gdXBkYXRlIHJlbWFpbmluZyBzdHJpbmdcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHJlc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufTtcblxuaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBEYXRlRm9ybWF0dGVyO1xufVxuIiwiLypqc2xpbnQgbm9kZTogdHJ1ZSAqL1xuLyogZ2xvYmFsIG1vZHVsZTogdHJ1ZSwgZXhwb3J0czogdHJ1ZSAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBOdW1lcmFsRm9ybWF0dGVyID0gZnVuY3Rpb24gKG51bWVyYWxEZWNpbWFsTWFyayxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bWVyYWxEZWNpbWFsU2NhbGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGltaXRlcikge1xuICAgIHZhciBvd25lciA9IHRoaXM7XG5cbiAgICBvd25lci5udW1lcmFsRGVjaW1hbE1hcmsgPSBudW1lcmFsRGVjaW1hbE1hcms7XG4gICAgb3duZXIubnVtZXJhbERlY2ltYWxTY2FsZSA9IG51bWVyYWxEZWNpbWFsU2NhbGU7XG4gICAgb3duZXIubnVtZXJhbFRob3VzYW5kc0dyb3VwU3R5bGUgPSBudW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZTtcbiAgICBvd25lci5kZWxpbWl0ZXIgPSBkZWxpbWl0ZXI7XG59O1xuXG5OdW1lcmFsRm9ybWF0dGVyLmdyb3VwU3R5bGUgPSB7XG4gICAgdGhvdXNhbmQ6ICd0aG91c2FuZCcsXG4gICAgbGFraDogICAgICdsYWtoJyxcbiAgICB3YW46ICAgICAgJ3dhbidcbn07XG5cbk51bWVyYWxGb3JtYXR0ZXIucHJvdG90eXBlID0ge1xuICAgIGZvcm1hdDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXMsIHBhcnRzLCBwYXJ0SW50ZWdlciwgcGFydERlY2ltYWwgPSAnJztcblxuICAgICAgICAvLyBzdHJpcCBhbHBoYWJldCBsZXR0ZXJzXG4gICAgICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvW0EtWmEtel0vZywgJycpXG5cbiAgICAgICAgICAgIC8vIHJlcGxhY2UgdGhlIGZpcnN0IGRlY2ltYWwgbWFyayB3aXRoIHJlc2VydmVkIHBsYWNlaG9sZGVyXG4gICAgICAgICAgICAucmVwbGFjZShvd25lci5udW1lcmFsRGVjaW1hbE1hcmssICdNJylcblxuICAgICAgICAgICAgLy8gc3RyaXAgdGhlIG5vbiBudW1lcmljIGxldHRlcnMgZXhjZXB0IE1cbiAgICAgICAgICAgIC5yZXBsYWNlKC9bXlxcZE1dL2csICcnKVxuXG4gICAgICAgICAgICAvLyByZXBsYWNlIG1hcmtcbiAgICAgICAgICAgIC5yZXBsYWNlKCdNJywgb3duZXIubnVtZXJhbERlY2ltYWxNYXJrKTtcblxuICAgICAgICBwYXJ0SW50ZWdlciA9IHZhbHVlO1xuXG4gICAgICAgIGlmICh2YWx1ZS5pbmRleE9mKG93bmVyLm51bWVyYWxEZWNpbWFsTWFyaykgPj0gMCkge1xuICAgICAgICAgICAgcGFydHMgPSB2YWx1ZS5zcGxpdChvd25lci5udW1lcmFsRGVjaW1hbE1hcmspO1xuICAgICAgICAgICAgcGFydEludGVnZXIgPSBwYXJ0c1swXTtcbiAgICAgICAgICAgIHBhcnREZWNpbWFsID0gb3duZXIubnVtZXJhbERlY2ltYWxNYXJrICsgcGFydHNbMV0uc2xpY2UoMCwgb3duZXIubnVtZXJhbERlY2ltYWxTY2FsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBzd2l0Y2ggKG93bmVyLm51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlKSB7XG4gICAgICAgIGNhc2UgTnVtZXJhbEZvcm1hdHRlci5ncm91cFN0eWxlLmxha2g6XG4gICAgICAgICAgICBwYXJ0SW50ZWdlciA9IHBhcnRJbnRlZ2VyLnJlcGxhY2UoLyhcXGQpKD89KFxcZFxcZCkrXFxkJCkvZywgJyQxJyArIG93bmVyLmRlbGltaXRlcik7XG5cbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgTnVtZXJhbEZvcm1hdHRlci5ncm91cFN0eWxlLndhbjpcbiAgICAgICAgICAgIHBhcnRJbnRlZ2VyID0gcGFydEludGVnZXIucmVwbGFjZSgvKFxcZCkoPz0oXFxkezR9KSskKS9nLCAnJDEnICsgb3duZXIuZGVsaW1pdGVyKTtcblxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHBhcnRJbnRlZ2VyID0gcGFydEludGVnZXIucmVwbGFjZSgvKFxcZCkoPz0oXFxkezN9KSskKS9nLCAnJDEnICsgb3duZXIuZGVsaW1pdGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJ0SW50ZWdlci50b1N0cmluZygpICsgcGFydERlY2ltYWwudG9TdHJpbmcoKTtcbiAgICB9XG59O1xuXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IE51bWVyYWxGb3JtYXR0ZXI7XG59XG4iLCIvKmpzbGludCBub2RlOiB0cnVlICovXG4vKiBnbG9iYWwgbW9kdWxlOiB0cnVlLCBleHBvcnRzOiB0cnVlICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFBob25lRm9ybWF0dGVyID0gZnVuY3Rpb24gKGZvcm1hdHRlciwgZGVsaW1pdGVyKSB7XG4gICAgdmFyIG93bmVyID0gdGhpcztcblxuICAgIG93bmVyLmRlbGltaXRlciA9IGRlbGltaXRlciB8fCAnICc7XG4gICAgb3duZXIuZGVsaW1pdGVyUkUgPSBuZXcgUmVnRXhwKG93bmVyLmRlbGltaXRlciwgXCJnXCIpO1xuICAgIG93bmVyLmZvcm1hdHRlciA9IGZvcm1hdHRlcjtcbn07XG5cblBob25lRm9ybWF0dGVyLnByb3RvdHlwZSA9IHtcbiAgICBzZXRGb3JtYXR0ZXI6IGZ1bmN0aW9uIChmb3JtYXR0ZXIpIHtcbiAgICAgICAgdGhpcy5mb3JtYXR0ZXIgPSBmb3JtYXR0ZXI7XG4gICAgfSxcblxuICAgIGZvcm1hdDogZnVuY3Rpb24gKHBob25lTnVtYmVyKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXM7XG5cbiAgICAgICAgb3duZXIuZm9ybWF0dGVyLmNsZWFyKCk7XG5cbiAgICAgICAgLy8gb25seSBrZWVwIG51bWJlciBhbmQgK1xuICAgICAgICBwaG9uZU51bWJlciA9IHBob25lTnVtYmVyLnJlcGxhY2UoL1teXFxkK10vZywgJycpO1xuXG4gICAgICAgIC8vIHN0cmlwIGRlbGltaXRlclxuICAgICAgICBwaG9uZU51bWJlciA9IHBob25lTnVtYmVyLnJlcGxhY2Uob3duZXIuZGVsaW1pdGVyUkUsICcnKTtcblxuICAgICAgICB2YXIgcmVzdWx0ID0gJycsIGN1cnJlbnQsIHZhbGlkYXRlZCA9IGZhbHNlO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBpTWF4ID0gcGhvbmVOdW1iZXIubGVuZ3RoOyBpIDwgaU1heDsgaSsrKSB7XG4gICAgICAgICAgICBjdXJyZW50ID0gb3duZXIuZm9ybWF0dGVyLmlucHV0RGlnaXQocGhvbmVOdW1iZXIuY2hhckF0KGkpKTtcblxuICAgICAgICAgICAgLy8gaGFzICgpLSBvciBzcGFjZSBpbnNpZGVcbiAgICAgICAgICAgIGlmICgvW1xccygpLV0vZy50ZXN0KGN1cnJlbnQpKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gY3VycmVudDtcblxuICAgICAgICAgICAgICAgIHZhbGlkYXRlZCA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICghdmFsaWRhdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGVsc2U6IG92ZXIgbGVuZ3RoIGlucHV0XG4gICAgICAgICAgICAgICAgLy8gaXQgdHVybnMgdG8gaW52YWxpZCBudW1iZXIgYWdhaW5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHN0cmlwICgpXG4gICAgICAgIC8vIGUuZy4gVVM6IDcxNjEyMzQ1NjcgcmV0dXJucyAoNzE2KSAxMjMtNDU2N1xuICAgICAgICByZXN1bHQgPSByZXN1bHQucmVwbGFjZSgvWygpXS9nLCAnJyk7XG4gICAgICAgIC8vIHJlcGxhY2UgbGlicmFyeSBkZWxpbWl0ZXIgd2l0aCB1c2VyIGN1c3RvbWl6ZWQgZGVsaW1pdGVyXG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKC9bXFxzLV0vZywgb3duZXIuZGVsaW1pdGVyKTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn07XG5cbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gUGhvbmVGb3JtYXR0ZXI7XG59XG4iLCIvKmpzbGludCBub2RlOiB0cnVlICovXG4vKiBnbG9iYWwgbW9kdWxlOiB0cnVlLCBleHBvcnRzOiB0cnVlICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIFV0aWwgPSB7XG4gICAgbm9vcDogZnVuY3Rpb24gKCkge1xuICAgIH0sXG5cbiAgICBzdHJpcDogZnVuY3Rpb24gKHZhbHVlLCByZSkge1xuICAgICAgICByZXR1cm4gdmFsdWUucmVwbGFjZShyZSwgJycpO1xuICAgIH0sXG5cbiAgICBoZWFkU3RyOiBmdW5jdGlvbiAoc3RyLCBsZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHN0ci5zbGljZSgwLCBsZW5ndGgpO1xuICAgIH0sXG5cbiAgICBnZXRNYXhMZW5ndGg6IGZ1bmN0aW9uIChibG9ja3MpIHtcbiAgICAgICAgcmV0dXJuIGJsb2Nrcy5yZWR1Y2UoZnVuY3Rpb24gKHByZXZpb3VzLCBjdXJyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gcHJldmlvdXMgKyBjdXJyZW50O1xuICAgICAgICB9LCAwKTtcbiAgICB9LFxuXG4gICAgZ2V0UHJlZml4QXBwbGllZFZhbHVlOiBmdW5jdGlvbiAodmFsdWUsIHByZWZpeCkge1xuICAgICAgICB2YXIgcHJlZml4TGVuZ3RoID0gcHJlZml4Lmxlbmd0aCxcbiAgICAgICAgICAgIHByZWZpeExlbmd0aFZhbHVlO1xuXG4gICAgICAgIGlmIChwcmVmaXhMZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByZWZpeExlbmd0aFZhbHVlID0gdmFsdWUuc2xpY2UoMCwgcHJlZml4TGVuZ3RoKTtcblxuICAgICAgICBpZiAocHJlZml4TGVuZ3RoVmFsdWUubGVuZ3RoIDwgcHJlZml4TGVuZ3RoKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHByZWZpeDtcbiAgICAgICAgfSBlbHNlIGlmIChwcmVmaXhMZW5ndGhWYWx1ZSAhPT0gcHJlZml4KSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHByZWZpeCArIHZhbHVlLnNsaWNlKHByZWZpeExlbmd0aCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcblxuICAgIGdldEZvcm1hdHRlZFZhbHVlOiBmdW5jdGlvbiAodmFsdWUsIGJsb2NrcywgYmxvY2tzTGVuZ3RoLCBkZWxpbWl0ZXIpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9ICcnO1xuXG4gICAgICAgIGJsb2Nrcy5mb3JFYWNoKGZ1bmN0aW9uIChsZW5ndGgsIGluZGV4KSB7XG4gICAgICAgICAgICBpZiAodmFsdWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBzdWIgPSB2YWx1ZS5zbGljZSgwLCBsZW5ndGgpLFxuICAgICAgICAgICAgICAgICAgICByZXN0ID0gdmFsdWUuc2xpY2UobGVuZ3RoKTtcblxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBzdWI7XG5cbiAgICAgICAgICAgICAgICBpZiAoc3ViLmxlbmd0aCA9PT0gbGVuZ3RoICYmIGluZGV4IDwgYmxvY2tzTGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgKz0gZGVsaW1pdGVyO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSByZW1haW5pbmcgc3RyaW5nXG4gICAgICAgICAgICAgICAgdmFsdWUgPSByZXN0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn07XG5cbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gVXRpbDtcbn1cbiJdfQ==
