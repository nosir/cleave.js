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

var Utils = {
    strip: function strip(value, re) {
        return value.replace(re, '');
    },

    headStr: function headStr(str, length) {
        return str.slice(0, length);
    }
};

var Cleave = React.createClass({
    displayName: 'Cleave',

    componentDidMount: function componentDidMount() {
        this.init();
    },

    getInitialState: function getInitialState() {
        var opts = this.props.options,
            vars = {};

        // credit card
        vars.creditCard = !!opts.creditCard;
        vars.creditCardStrictMode = !!opts.creditCardStrictMode;

        // phone
        vars.phone = !!opts.phone;
        vars.phoneRegionCode = opts.phoneRegionCode || '';
        vars.phoneFormatter = {};

        // date
        vars.date = !!opts.date;
        vars.datePattern = opts.datePattern || ['d', 'm', 'Y'];
        vars.dateFormatter = {};

        // numeral
        vars.numeral = !!opts.numeral;
        vars.numeralDecimalScale = opts.numeralDecimalScale || 2;
        vars.numeralDecimalMark = opts.numeralDecimalMark || '.';
        vars.numeralThousandsGroupStyle = opts.numeralThousandsGroupStyle || 'thousand';

        vars.numericOnly = vars.creditCard || vars.date || !!opts.numericOnly;

        vars.prefix = vars.creditCard || vars.phone || vars.date ? '' : opts.prefix || '';
        vars.prefixLength = vars.prefix.length;

        vars.delimiter = opts.delimiter || (vars.date ? '/' : vars.numeral ? ',' : ' ');
        vars.delimiterRE = new RegExp(vars.delimiter, "g");

        vars.blocks = opts.blocks || [];
        vars.blocksLength = vars.blocks.length;

        vars.maxLength = 0;

        vars.backspace = false;
        vars.result = '';

        return {
            vars: vars
        };
    },

    init: function init() {
        var owner = this,
            vars = owner.state.vars;

        // so no need for this lib at all
        if (!vars.numeral && !vars.phone && !vars.creditCard && !vars.date && vars.blocks.length === 0) {
            return;
        }

        vars.maxLength = owner.getMaxLength();

        owner.initPhoneFormatter();
        owner.initDateFormatter();
        owner.initNumeralFormatter();

        owner.onInput(vars.result);

        this.forceUpdate();
    },

    initNumeralFormatter: function initNumeralFormatter() {
        var owner = this,
            vars = owner.state.vars;

        if (!vars.numeral) {
            return;
        }

        vars.numeralFormatter = new NumeralFormatter(vars.numeralDecimalMark, vars.numeralDecimalScale, vars.numeralThousandsGroupStyle, vars.delimiter);
    },

    initDateFormatter: function initDateFormatter() {
        var owner = this,
            vars = owner.state.vars;

        if (!vars.date) {
            return;
        }

        vars.dateFormatter = new DateFormatter(vars.datePattern);
        vars.blocks = vars.dateFormatter.getBlocks();
        vars.blocksLength = vars.blocks.length;
        vars.maxLength = owner.getMaxLength();
    },

    initPhoneFormatter: function initPhoneFormatter() {
        var owner = this,
            vars = owner.state.vars;

        if (!vars.phone) {
            return;
        }

        // Cleave.AsYouTypeFormatter should be provided by
        // external google closure lib
        try {
            vars.phoneFormatter = new PhoneFormatter(new window.Cleave.AsYouTypeFormatter(vars.phoneRegionCode), vars.delimiter);
        } catch (ex) {
            throw new Error('Please include phone-type-formatter.{country}.js lib');
        }
    },

    onKeydown: function onKeydown(event) {
        var owner = this,
            vars = owner.state.vars,
            charCode = event.which || event.keyCode;

        // hit backspace when last character is delimiter
        if (charCode === 8 && vars.result.slice(-1) === vars.delimiter) {
            vars.backspace = true;

            return;
        }

        vars.backspace = false;
    },

    getMaxLength: function getMaxLength() {
        return this.state.vars.blocks.reduce(function (previous, current) {
            return previous + current;
        }, 0);
    },

    onChange: function onChange(e) {
        this.onInput(e.target.value);
    },

    onInput: function onInput(value) {
        var owner = this,
            vars = owner.state.vars,
            prev = vars.result,
            prefixLengthValue,
            result;

        // case 1: delete one more character "4"
        // 1234*| -> hit backspace -> 123|
        // case 2: last character is not delimiter which is:
        // 12|34* -> hit backspace -> 1|34*

        if (owner.backspace && value.slice(-1) !== vars.delimiter) {
            value = Utils.headStr(value, value.length - 1);
        }

        // phone formatter
        if (vars.phone) {
            vars.result = vars.phoneFormatter.format(value);

            this.forceUpdate();

            return;
        }

        // numeral formatter
        if (vars.numeral) {
            vars.result = vars.numeralFormatter.format(value);

            this.forceUpdate();

            return;
        }

        // date
        if (vars.date) {
            value = vars.dateFormatter.getValidatedDate(value);
        }

        // strip delimiters
        value = Utils.strip(value, vars.delimiterRE);

        // prefix
        if (vars.prefix.length > 0) {
            prefixLengthValue = Utils.headStr(value, vars.prefixLength);

            if (prefixLengthValue.length < vars.prefixLength) {
                value = vars.prefix;
            } else if (prefixLengthValue !== vars.prefix) {
                value = vars.prefix + value.slice(vars.prefixLength);
            }
        }

        // strip non-numeric characters
        if (vars.numericOnly) {
            value = Utils.strip(value, /[^\d]/g);
        }

        // update credit card blocks
        // and at least one of first 4 characters has changed
        if (vars.creditCard && Utils.headStr(vars.result, 4) !== Utils.headStr(value, 4)) {
            vars.blocks = CreditCardDetector.getBlocksByPAN(value, vars.creditCardStrictMode);
            vars.blocksLength = vars.blocks.length;
            vars.maxLength = owner.getMaxLength();
        }

        // strip over length characters
        value = Utils.headStr(value, vars.maxLength);

        // apply blocks
        result = '';

        vars.blocks.forEach(function (length, index) {
            if (value.length > 0) {
                var sub = value.slice(0, length),
                    rest = value.slice(length);

                result += sub;

                if (sub.length === length && index < vars.blocksLength - 1) {
                    result += vars.delimiter;
                }

                // update remaining string
                value = rest;
            }
        });

        if (prev === result) {
            return;
        }

        vars.result = result;

        this.forceUpdate();
    },

    render: function render() {
        var _props = this.props;
        var value = _props.value;
        var options = _props.options;
        var onKeydown = _props.onKeydown;
        var onChange = _props.onChange;

        var other = _objectWithoutProperties(_props, ['value', 'options', 'onKeydown', 'onChange']);
        //


        return React.createElement('input', _extends({ type: 'text' }, other, {
            value: this.state.vars.result,
            onKeydown: this.onKeydown,
            onChange: this.onChange }));
    }
});

module.exports = window.Cleave = Cleave;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./shortcuts/CreditCardDetector":3,"./shortcuts/DateFormatter":4,"./shortcuts/NumeralFormatter":5,"./shortcuts/PhoneFormatter":6}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJyZWFjdC5qcyIsInNyYy9DbGVhdmUucmVhY3QuanMiLCJzcmMvc2hvcnRjdXRzL0NyZWRpdENhcmREZXRlY3Rvci5qcyIsInNyYy9zaG9ydGN1dHMvRGF0ZUZvcm1hdHRlci5qcyIsInNyYy9zaG9ydGN1dHMvTnVtZXJhbEZvcm1hdHRlci5qcyIsInNyYy9zaG9ydGN1dHMvUGhvbmVGb3JtYXR0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQTs7Ozs7Ozs7Ozs7O0FDRUE7Ozs7OztBQUVBLElBQUksUUFBUSxRQUFRLE9BQVIsQ0FBWjs7QUFFQSxJQUFJLG1CQUFtQixRQUFRLDhCQUFSLENBQXZCO0FBQ0EsSUFBSSxnQkFBZ0IsUUFBUSwyQkFBUixDQUFwQjtBQUNBLElBQUksaUJBQWlCLFFBQVEsNEJBQVIsQ0FBckI7QUFDQSxJQUFJLHFCQUFxQixRQUFRLGdDQUFSLENBQXpCOztBQUVBLElBQUksUUFBUTtBQUNSLFdBQU8sZUFBVSxLQUFWLEVBQWlCLEVBQWpCLEVBQXFCO0FBQ3hCLGVBQU8sTUFBTSxPQUFOLENBQWMsRUFBZCxFQUFrQixFQUFsQixDQUFQO0FBQ0gsS0FITzs7QUFLUixhQUFTLGlCQUFVLEdBQVYsRUFBZSxNQUFmLEVBQXVCO0FBQzVCLGVBQU8sSUFBSSxLQUFKLENBQVUsQ0FBVixFQUFhLE1BQWIsQ0FBUDtBQUNIO0FBUE8sQ0FBWjs7QUFVQSxJQUFJLFNBQVMsTUFBTSxXQUFOLENBQWtCO0FBQUE7O0FBQzNCLHVCQUFtQiw2QkFBWTtBQUMzQixhQUFLLElBQUw7QUFDSCxLQUgwQjs7QUFLM0IscUJBQWlCLDJCQUFZO0FBQ3pCLFlBQUksT0FBTyxLQUFLLEtBQUwsQ0FBVyxPQUF0QjtBQUFBLFlBQ0ksT0FBTyxFQURYOzs7QUFJQSxhQUFLLFVBQUwsR0FBa0IsQ0FBQyxDQUFDLEtBQUss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QUFOLENBQWdCLFVBQWhCLENBQTJCLFlBQVksTUFBWixDQUFtQixDQUFuQixDQUEzQixDQUFWOzs7QUFHQSxnQkFBSSxXQUFXLElBQVgsQ0FBZ0IsT0FBaEIsQ0FBSixFQUE4QjtBQUMxQix5QkFBUyxPQUFUOztBQUVBLDRCQUFZLElBQVo7QUFDSCxhQUpELE1BSU87QUFDSCxvQkFBSSxDQUFDLFNBQUwsRUFBZ0I7QUFDWiw2QkFBUyxPQUFUO0FBQ0g7OztBQUdKO0FBQ0o7Ozs7QUFJRCxpQkFBUyxPQUFPLE9BQVAsQ0FBZSxPQUFmLEVBQXdCLEVBQXhCLENBQVQ7O0FBRUEsaUJBQVMsT0FBTyxPQUFQLENBQWUsUUFBZixFQUF5QixNQUFNLFNBQS9CLENBQVQ7O0FBRUEsZUFBTyxNQUFQO0FBQ0g7QUExQ3NCLENBQTNCOztBQTZDQSxJQUFJLFFBQU8sTUFBUCx5Q0FBTyxNQUFQLE9BQWtCLFFBQWxCLElBQThCLFFBQU8sT0FBTyxPQUFkLE1BQTBCLFFBQTVELEVBQXNFO0FBQ2xFLFdBQU8sT0FBUCxHQUFpQixVQUFVLGNBQTNCO0FBQ0giLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IENsZWF2ZSBmcm9tICcuL3NyYy9DbGVhdmUucmVhY3QnO1xuXG5leHBvcnQgZGVmYXVsdCBDbGVhdmU7XG4iLCIvKiBqc2xpbnQgbm9kZTogdHJ1ZSAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbnZhciBOdW1lcmFsRm9ybWF0dGVyID0gcmVxdWlyZSgnLi9zaG9ydGN1dHMvTnVtZXJhbEZvcm1hdHRlcicpO1xudmFyIERhdGVGb3JtYXR0ZXIgPSByZXF1aXJlKCcuL3Nob3J0Y3V0cy9EYXRlRm9ybWF0dGVyJyk7XG52YXIgUGhvbmVGb3JtYXR0ZXIgPSByZXF1aXJlKCcuL3Nob3J0Y3V0cy9QaG9uZUZvcm1hdHRlcicpO1xudmFyIENyZWRpdENhcmREZXRlY3RvciA9IHJlcXVpcmUoJy4vc2hvcnRjdXRzL0NyZWRpdENhcmREZXRlY3RvcicpO1xuXG52YXIgVXRpbHMgPSB7XG4gICAgc3RyaXA6IGZ1bmN0aW9uICh2YWx1ZSwgcmUpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UocmUsICcnKTtcbiAgICB9LFxuXG4gICAgaGVhZFN0cjogZnVuY3Rpb24gKHN0ciwgbGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBzdHIuc2xpY2UoMCwgbGVuZ3RoKTtcbiAgICB9XG59O1xuXG52YXIgQ2xlYXZlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgIGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH0sXG5cbiAgICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG9wdHMgPSB0aGlzLnByb3BzLm9wdGlvbnMsXG4gICAgICAgICAgICB2YXJzID0ge307XG5cbiAgICAgICAgLy8gY3JlZGl0IGNhcmRcbiAgICAgICAgdmFycy5jcmVkaXRDYXJkID0gISFvcHRzLmNyZWRpdENhcmQ7XG4gICAgICAgIHZhcnMuY3JlZGl0Q2FyZFN0cmljdE1vZGUgPSAhIW9wdHMuY3JlZGl0Q2FyZFN0cmljdE1vZGU7XG5cbiAgICAgICAgLy8gcGhvbmVcbiAgICAgICAgdmFycy5waG9uZSA9ICEhb3B0cy5waG9uZTtcbiAgICAgICAgdmFycy5waG9uZVJlZ2lvbkNvZGUgPSBvcHRzLnBob25lUmVnaW9uQ29kZSB8fCAnJztcbiAgICAgICAgdmFycy5waG9uZUZvcm1hdHRlciA9IHt9O1xuXG4gICAgICAgIC8vIGRhdGVcbiAgICAgICAgdmFycy5kYXRlID0gISFvcHRzLmRhdGU7XG4gICAgICAgIHZhcnMuZGF0ZVBhdHRlcm4gPSBvcHRzLmRhdGVQYXR0ZXJuIHx8IFsnZCcsICdtJywgJ1knXTtcbiAgICAgICAgdmFycy5kYXRlRm9ybWF0dGVyID0ge307XG5cbiAgICAgICAgLy8gbnVtZXJhbFxuICAgICAgICB2YXJzLm51bWVyYWwgPSAhIW9wdHMubnVtZXJhbDtcbiAgICAgICAgdmFycy5udW1lcmFsRGVjaW1hbFNjYWxlID0gb3B0cy5udW1lcmFsRGVjaW1hbFNjYWxlIHx8IDI7XG4gICAgICAgIHZhcnMubnVtZXJhbERlY2ltYWxNYXJrID0gb3B0cy5udW1lcmFsRGVjaW1hbE1hcmsgfHwgJy4nO1xuICAgICAgICB2YXJzLm51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlID0gb3B0cy5udW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSB8fCAndGhvdXNhbmQnO1xuXG4gICAgICAgIHZhcnMubnVtZXJpY09ubHkgPSB2YXJzLmNyZWRpdENhcmQgfHwgdmFycy5kYXRlIHx8ICEhb3B0cy5udW1lcmljT25seTtcblxuICAgICAgICB2YXJzLnByZWZpeCA9ICh2YXJzLmNyZWRpdENhcmQgfHwgdmFycy5waG9uZSB8fCB2YXJzLmRhdGUpID8gJycgOiAob3B0cy5wcmVmaXggfHwgJycpO1xuICAgICAgICB2YXJzLnByZWZpeExlbmd0aCA9IHZhcnMucHJlZml4Lmxlbmd0aDtcblxuICAgICAgICB2YXJzLmRlbGltaXRlciA9IG9wdHMuZGVsaW1pdGVyIHx8ICh2YXJzLmRhdGUgPyAnLycgOiAodmFycy5udW1lcmFsID8gJywnIDogJyAnKSk7XG4gICAgICAgIHZhcnMuZGVsaW1pdGVyUkUgPSBuZXcgUmVnRXhwKHZhcnMuZGVsaW1pdGVyLCBcImdcIik7XG5cbiAgICAgICAgdmFycy5ibG9ja3MgPSBvcHRzLmJsb2NrcyB8fCBbXTtcbiAgICAgICAgdmFycy5ibG9ja3NMZW5ndGggPSB2YXJzLmJsb2Nrcy5sZW5ndGg7XG5cbiAgICAgICAgdmFycy5tYXhMZW5ndGggPSAwO1xuXG4gICAgICAgIHZhcnMuYmFja3NwYWNlID0gZmFsc2U7XG4gICAgICAgIHZhcnMucmVzdWx0ID0gJyc7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHZhcnM6IHZhcnNcbiAgICAgICAgfTtcbiAgICB9LFxuXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxuICAgICAgICAgICAgdmFycyA9IG93bmVyLnN0YXRlLnZhcnM7XG5cbiAgICAgICAgLy8gc28gbm8gbmVlZCBmb3IgdGhpcyBsaWIgYXQgYWxsXG4gICAgICAgIGlmICghdmFycy5udW1lcmFsICYmICF2YXJzLnBob25lICYmICF2YXJzLmNyZWRpdENhcmQgJiYgIXZhcnMuZGF0ZSAmJiB2YXJzLmJsb2Nrcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhcnMubWF4TGVuZ3RoID0gb3duZXIuZ2V0TWF4TGVuZ3RoKCk7XG5cbiAgICAgICAgb3duZXIuaW5pdFBob25lRm9ybWF0dGVyKCk7XG4gICAgICAgIG93bmVyLmluaXREYXRlRm9ybWF0dGVyKCk7XG4gICAgICAgIG93bmVyLmluaXROdW1lcmFsRm9ybWF0dGVyKCk7XG5cbiAgICAgICAgb3duZXIub25JbnB1dCh2YXJzLnJlc3VsdCk7XG5cbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgIH0sXG5cbiAgICBpbml0TnVtZXJhbEZvcm1hdHRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxuICAgICAgICAgICAgdmFycyA9IG93bmVyLnN0YXRlLnZhcnM7XG5cbiAgICAgICAgaWYgKCF2YXJzLm51bWVyYWwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhcnMubnVtZXJhbEZvcm1hdHRlciA9IG5ldyBOdW1lcmFsRm9ybWF0dGVyKFxuICAgICAgICAgICAgdmFycy5udW1lcmFsRGVjaW1hbE1hcmssXG4gICAgICAgICAgICB2YXJzLm51bWVyYWxEZWNpbWFsU2NhbGUsXG4gICAgICAgICAgICB2YXJzLm51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlLFxuICAgICAgICAgICAgdmFycy5kZWxpbWl0ZXJcbiAgICAgICAgKTtcbiAgICB9LFxuXG4gICAgaW5pdERhdGVGb3JtYXR0ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIHZhcnMgPSBvd25lci5zdGF0ZS52YXJzO1xuXG4gICAgICAgIGlmICghdmFycy5kYXRlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXJzLmRhdGVGb3JtYXR0ZXIgPSBuZXcgRGF0ZUZvcm1hdHRlcih2YXJzLmRhdGVQYXR0ZXJuKTtcbiAgICAgICAgdmFycy5ibG9ja3MgPSB2YXJzLmRhdGVGb3JtYXR0ZXIuZ2V0QmxvY2tzKCk7XG4gICAgICAgIHZhcnMuYmxvY2tzTGVuZ3RoID0gdmFycy5ibG9ja3MubGVuZ3RoO1xuICAgICAgICB2YXJzLm1heExlbmd0aCA9IG93bmVyLmdldE1heExlbmd0aCgpO1xuICAgIH0sXG5cbiAgICBpbml0UGhvbmVGb3JtYXR0ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIHZhcnMgPSBvd25lci5zdGF0ZS52YXJzO1xuXG4gICAgICAgIGlmICghdmFycy5waG9uZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2xlYXZlLkFzWW91VHlwZUZvcm1hdHRlciBzaG91bGQgYmUgcHJvdmlkZWQgYnlcbiAgICAgICAgLy8gZXh0ZXJuYWwgZ29vZ2xlIGNsb3N1cmUgbGliXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB2YXJzLnBob25lRm9ybWF0dGVyID0gbmV3IFBob25lRm9ybWF0dGVyKFxuICAgICAgICAgICAgICAgIG5ldyB3aW5kb3cuQ2xlYXZlLkFzWW91VHlwZUZvcm1hdHRlcih2YXJzLnBob25lUmVnaW9uQ29kZSksXG4gICAgICAgICAgICAgICAgdmFycy5kZWxpbWl0ZXJcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BsZWFzZSBpbmNsdWRlIHBob25lLXR5cGUtZm9ybWF0dGVyLntjb3VudHJ5fS5qcyBsaWInKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBvbktleWRvd246IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLFxuICAgICAgICAgICAgdmFycyA9IG93bmVyLnN0YXRlLnZhcnMsXG4gICAgICAgICAgICBjaGFyQ29kZSA9IGV2ZW50LndoaWNoIHx8IGV2ZW50LmtleUNvZGU7XG5cbiAgICAgICAgLy8gaGl0IGJhY2tzcGFjZSB3aGVuIGxhc3QgY2hhcmFjdGVyIGlzIGRlbGltaXRlclxuICAgICAgICBpZiAoY2hhckNvZGUgPT09IDggJiYgdmFycy5yZXN1bHQuc2xpY2UoLTEpID09PSB2YXJzLmRlbGltaXRlcikge1xuICAgICAgICAgICAgdmFycy5iYWNrc3BhY2UgPSB0cnVlO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXJzLmJhY2tzcGFjZSA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICBnZXRNYXhMZW5ndGg6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdGUudmFycy5ibG9ja3MucmVkdWNlKGZ1bmN0aW9uIChwcmV2aW91cywgY3VycmVudCkge1xuICAgICAgICAgICAgcmV0dXJuIHByZXZpb3VzICsgY3VycmVudDtcbiAgICAgICAgfSwgMCk7XG4gICAgfSxcblxuICAgIG9uQ2hhbmdlOiBmdW5jdGlvbihlKSB7XG4gICAgICB0aGlzLm9uSW5wdXQoZS50YXJnZXQudmFsdWUpO1xuICAgIH0sXG5cbiAgICBvbklucHV0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcyxcbiAgICAgICAgICAgIHZhcnMgPSBvd25lci5zdGF0ZS52YXJzLFxuICAgICAgICAgICAgcHJldiA9IHZhcnMucmVzdWx0LFxuICAgICAgICAgICAgcHJlZml4TGVuZ3RoVmFsdWUsXG4gICAgICAgICAgICByZXN1bHQ7XG5cbiAgICAgICAgLy8gY2FzZSAxOiBkZWxldGUgb25lIG1vcmUgY2hhcmFjdGVyIFwiNFwiXG4gICAgICAgIC8vIDEyMzQqfCAtPiBoaXQgYmFja3NwYWNlIC0+IDEyM3xcbiAgICAgICAgLy8gY2FzZSAyOiBsYXN0IGNoYXJhY3RlciBpcyBub3QgZGVsaW1pdGVyIHdoaWNoIGlzOlxuICAgICAgICAvLyAxMnwzNCogLT4gaGl0IGJhY2tzcGFjZSAtPiAxfDM0KlxuXG4gICAgICAgIGlmIChvd25lci5iYWNrc3BhY2UgJiYgdmFsdWUuc2xpY2UoLTEpICE9PSB2YXJzLmRlbGltaXRlcikge1xuICAgICAgICAgICAgdmFsdWUgPSBVdGlscy5oZWFkU3RyKHZhbHVlLCB2YWx1ZS5sZW5ndGggLSAxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHBob25lIGZvcm1hdHRlclxuICAgICAgICBpZiAodmFycy5waG9uZSkge1xuICAgICAgICAgICAgdmFycy5yZXN1bHQgPSB2YXJzLnBob25lRm9ybWF0dGVyLmZvcm1hdCh2YWx1ZSk7XG5cbiAgICAgICAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcblxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbnVtZXJhbCBmb3JtYXR0ZXJcbiAgICAgICAgaWYgKHZhcnMubnVtZXJhbCkge1xuICAgICAgICAgICAgdmFycy5yZXN1bHQgPSB2YXJzLm51bWVyYWxGb3JtYXR0ZXIuZm9ybWF0KHZhbHVlKTtcblxuICAgICAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBkYXRlXG4gICAgICAgIGlmICh2YXJzLmRhdGUpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdmFycy5kYXRlRm9ybWF0dGVyLmdldFZhbGlkYXRlZERhdGUodmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3RyaXAgZGVsaW1pdGVyc1xuICAgICAgICB2YWx1ZSA9IFV0aWxzLnN0cmlwKHZhbHVlLCB2YXJzLmRlbGltaXRlclJFKTtcblxuICAgICAgICAvLyBwcmVmaXhcbiAgICAgICAgaWYgKHZhcnMucHJlZml4Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHByZWZpeExlbmd0aFZhbHVlID0gVXRpbHMuaGVhZFN0cih2YWx1ZSwgdmFycy5wcmVmaXhMZW5ndGgpO1xuXG4gICAgICAgICAgICBpZiAocHJlZml4TGVuZ3RoVmFsdWUubGVuZ3RoIDwgdmFycy5wcmVmaXhMZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhcnMucHJlZml4O1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwcmVmaXhMZW5ndGhWYWx1ZSAhPT0gdmFycy5wcmVmaXgpIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhcnMucHJlZml4ICsgdmFsdWUuc2xpY2UodmFycy5wcmVmaXhMZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3RyaXAgbm9uLW51bWVyaWMgY2hhcmFjdGVyc1xuICAgICAgICBpZiAodmFycy5udW1lcmljT25seSkge1xuICAgICAgICAgICAgdmFsdWUgPSBVdGlscy5zdHJpcCh2YWx1ZSwgL1teXFxkXS9nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHVwZGF0ZSBjcmVkaXQgY2FyZCBibG9ja3NcbiAgICAgICAgLy8gYW5kIGF0IGxlYXN0IG9uZSBvZiBmaXJzdCA0IGNoYXJhY3RlcnMgaGFzIGNoYW5nZWRcbiAgICAgICAgaWYgKHZhcnMuY3JlZGl0Q2FyZCAmJiBVdGlscy5oZWFkU3RyKHZhcnMucmVzdWx0LCA0KSAhPT0gVXRpbHMuaGVhZFN0cih2YWx1ZSwgNCkpIHtcbiAgICAgICAgICAgIHZhcnMuYmxvY2tzID0gQ3JlZGl0Q2FyZERldGVjdG9yLmdldEJsb2Nrc0J5UEFOKHZhbHVlLCB2YXJzLmNyZWRpdENhcmRTdHJpY3RNb2RlKTtcbiAgICAgICAgICAgIHZhcnMuYmxvY2tzTGVuZ3RoID0gdmFycy5ibG9ja3MubGVuZ3RoO1xuICAgICAgICAgICAgdmFycy5tYXhMZW5ndGggPSBvd25lci5nZXRNYXhMZW5ndGgoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHN0cmlwIG92ZXIgbGVuZ3RoIGNoYXJhY3RlcnNcbiAgICAgICAgdmFsdWUgPSBVdGlscy5oZWFkU3RyKHZhbHVlLCB2YXJzLm1heExlbmd0aCk7XG5cbiAgICAgICAgLy8gYXBwbHkgYmxvY2tzXG4gICAgICAgIHJlc3VsdCA9ICcnO1xuXG4gICAgICAgIHZhcnMuYmxvY2tzLmZvckVhY2goZnVuY3Rpb24gKGxlbmd0aCwgaW5kZXgpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1YiA9IHZhbHVlLnNsaWNlKDAsIGxlbmd0aCksXG4gICAgICAgICAgICAgICAgICAgIHJlc3QgPSB2YWx1ZS5zbGljZShsZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgcmVzdWx0ICs9IHN1YjtcblxuICAgICAgICAgICAgICAgIGlmIChzdWIubGVuZ3RoID09PSBsZW5ndGggJiYgaW5kZXggPCB2YXJzLmJsb2Nrc0xlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ICs9IHZhcnMuZGVsaW1pdGVyO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSByZW1haW5pbmcgc3RyaW5nXG4gICAgICAgICAgICAgICAgdmFsdWUgPSByZXN0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAocHJldiA9PT0gcmVzdWx0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXJzLnJlc3VsdCA9IHJlc3VsdDtcblxuICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgeyB2YWx1ZSwgb3B0aW9ucywgb25LZXlkb3duLCBvbkNoYW5nZSwgLi4ub3RoZXIgfSA9IHRoaXMucHJvcHM7XG4gICAgICAgIC8vXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiB7Li4ub3RoZXJ9XG4gICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUudmFycy5yZXN1bHR9XG4gICAgICAgICAgICAgICAgICAgb25LZXlkb3duPXt0aGlzLm9uS2V5ZG93bn1cbiAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkNoYW5nZX0vPlxuICAgICAgICApO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy5DbGVhdmUgPSBDbGVhdmU7XG4iLCIvKmpzbGludCBub2RlOiB0cnVlICovXG4vKiBnbG9iYWwgbW9kdWxlOiB0cnVlLCBleHBvcnRzOiB0cnVlICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIENyZWRpdENhcmREZXRlY3RvciA9IHtcbiAgICBibG9ja3M6IHtcbiAgICAgICAgdWF0cDogICAgICAgICAgWzQsIDUsIDZdLFxuICAgICAgICBhbWV4OiAgICAgICAgICBbNCwgNiwgNV0sXG4gICAgICAgIGRpbmVyczogICAgICAgIFs0LCA2LCA0XSxcbiAgICAgICAgbWFzdGVyY2FyZDogICAgWzQsIDQsIDQsIDRdLFxuICAgICAgICBkYW5rb3J0OiAgICAgICBbNCwgNCwgNCwgNF0sXG4gICAgICAgIGluc3RhcGF5bWVudDogIFs0LCA0LCA0LCA0XSxcbiAgICAgICAgamNiOiAgICAgICAgICAgWzQsIDQsIDQsIDRdLFxuICAgICAgICBnZW5lcmFsU3RyaWN0OiBbNCwgNCwgNCwgN10sXG4gICAgICAgIGdlbmVyYWxMb29zZTogIFs0LCA0LCA0LCA0XVxuICAgIH0sXG5cbiAgICByZToge1xuICAgICAgICAvLyBzdGFydHMgd2l0aCAxOyAxNSBkaWdpdHMsIG5vdCBzdGFydHMgd2l0aCAxODAwIChqY2IgY2FyZClcbiAgICAgICAgdWF0cDogL14oPyExODAwKTFcXGR7MCwxNH0vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDM0LzM3OyAxNSBkaWdpdHNcbiAgICAgICAgYW1leDogL14zWzQ3XVxcZHswLDEzfS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggMzAwLTMwNS8zMDkgb3IgMzYvMzgvMzk7IDE0IGRpZ2l0c1xuICAgICAgICBkaW5lcnM6IC9eMyg/OjAoWzAtNV18OSl8WzY4OV1cXGQ/KVxcZHswLDExfS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggNTEtNTUgb3IgMjItMjc7IDE2IGRpZ2l0c1xuICAgICAgICBtYXN0ZXJjYXJkOiAvXig1WzEtNV18MlsyLTddKVxcZHswLDE0fS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggNTAxOS80MTc1LzQ1NzE7IDE2IGRpZ2l0c1xuICAgICAgICBkYW5rb3J0OiAvXig1MDE5fDQxNzV8NDU3MSlcXGR7MCwxMn0vLFxuXG4gICAgICAgIC8vIHN0YXJ0cyB3aXRoIDYzNy02Mzk7IDE2IGRpZ2l0c1xuICAgICAgICBpbnN0YXBheW1lbnQ6IC9eNjNbNy05XVxcZHswLDEzfS8sXG5cbiAgICAgICAgLy8gc3RhcnRzIHdpdGggMjEzMS8xODAwLzM1OyAxNiBkaWdpdHNcbiAgICAgICAgamNiOiAvXig/OjIxMzF8MTgwMHwzNVxcZHswLDJ9KVxcZHswLDEyfS9cbiAgICB9LFxuXG4gICAgZ2V0QmxvY2tzQnlQQU46IGZ1bmN0aW9uICh2YWx1ZSwgc3RyaWN0TW9kZSkge1xuICAgICAgICB2YXIgYmxvY2tzID0gQ3JlZGl0Q2FyZERldGVjdG9yLmJsb2NrcyxcbiAgICAgICAgICAgIHJlID0gQ3JlZGl0Q2FyZERldGVjdG9yLnJlO1xuXG4gICAgICAgIC8vIEluIHRoZW9yeSwgY3JlZGl0IGNhcmQgY2FuIGhhdmUgdXAgdG8gMTkgZGlnaXRzIG51bWJlci5cbiAgICAgICAgLy8gU2V0IHN0cmljdE1vZGUgdG8gdHJ1ZSB3aWxsIHJlbW92ZSB0aGUgMTYgbWF4LWxlbmd0aCByZXN0cmFpbixcbiAgICAgICAgLy8gaG93ZXZlciwgSSBuZXZlciBmb3VuZCBhbnkgd2Vic2l0ZSB2YWxpZGF0ZSBjYXJkIG51bWJlciBsaWtlXG4gICAgICAgIC8vIHRoaXMsIGhlbmNlIHByb2JhYmx5IHlvdSBkb24ndCBuZWVkIHRvIGVuYWJsZSB0aGlzIG9wdGlvbi5cbiAgICAgICAgc3RyaWN0TW9kZSA9ICEhc3RyaWN0TW9kZTtcblxuICAgICAgICBpZiAocmUuYW1leC50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIGJsb2Nrcy5hbWV4O1xuICAgICAgICB9IGVsc2UgaWYgKHJlLnVhdHAudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBibG9ja3MudWF0cDtcbiAgICAgICAgfSBlbHNlIGlmIChyZS5kaW5lcnMudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBibG9ja3MuZGluZXJzO1xuICAgICAgICB9IGVsc2UgaWYgKHJlLm1hc3RlcmNhcmQudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBibG9ja3MubWFzdGVyY2FyZDtcbiAgICAgICAgfSBlbHNlIGlmIChyZS5kYW5rb3J0LnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gYmxvY2tzLmRhbmtvcnQ7XG4gICAgICAgIH0gZWxzZSBpZiAocmUuaW5zdGFwYXltZW50LnRlc3QodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gYmxvY2tzLmluc3RhcGF5bWVudDtcbiAgICAgICAgfSBlbHNlIGlmIChyZS5qY2IudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBibG9ja3MuamNiO1xuICAgICAgICB9IGVsc2UgaWYgKHN0cmljdE1vZGUpIHtcbiAgICAgICAgICAgIHJldHVybiBibG9ja3MuZ2VuZXJhbFN0cmljdDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBibG9ja3MuZ2VuZXJhbExvb3NlO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBDcmVkaXRDYXJkRGV0ZWN0b3I7XG59XG4iLCIvKmpzbGludCBub2RlOiB0cnVlICovXG4vKiBnbG9iYWwgbW9kdWxlOiB0cnVlLCBleHBvcnRzOiB0cnVlICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIERhdGVGb3JtYXR0ZXIgPSBmdW5jdGlvbiAoZGF0ZVBhdHRlcm4pIHtcbiAgICB2YXIgb3duZXIgPSB0aGlzO1xuXG4gICAgb3duZXIuYmxvY2tzID0gW107XG4gICAgb3duZXIuZGF0ZVBhdHRlcm4gPSBkYXRlUGF0dGVybjtcbiAgICBvd25lci5pbml0QmxvY2tzKCk7XG59O1xuXG5EYXRlRm9ybWF0dGVyLnByb3RvdHlwZSA9IHtcbiAgICBpbml0QmxvY2tzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvd25lciA9IHRoaXM7XG4gICAgICAgIG93bmVyLmRhdGVQYXR0ZXJuLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09ICdZJykge1xuICAgICAgICAgICAgICAgIG93bmVyLmJsb2Nrcy5wdXNoKDQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvd25lci5ibG9ja3MucHVzaCgyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGdldEJsb2NrczogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ibG9ja3M7XG4gICAgfSxcblxuICAgIGdldFZhbGlkYXRlZERhdGU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB2YXIgb3duZXIgPSB0aGlzLCByZXN1bHQgPSAnJztcblxuICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoL1teXFxkXS9nLCAnJyk7XG5cbiAgICAgICAgb3duZXIuYmxvY2tzLmZvckVhY2goZnVuY3Rpb24gKGxlbmd0aCwgaW5kZXgpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1YiA9IHZhbHVlLnNsaWNlKDAsIGxlbmd0aCksXG4gICAgICAgICAgICAgICAgICAgIHJlc3QgPSB2YWx1ZS5zbGljZShsZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgc3dpdGNoIChvd25lci5kYXRlUGF0dGVybltpbmRleF0pIHtcbiAgICAgICAgICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnNlSW50KHN1YiwgMTApID4gMzEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YiA9ICczMSc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnbSc6XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJzZUludChzdWIsIDEwKSA+IDEyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdWIgPSAnMTInO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBzdWI7XG5cbiAgICAgICAgICAgICAgICAvLyB1cGRhdGUgcmVtYWluaW5nIHN0cmluZ1xuICAgICAgICAgICAgICAgIHZhbHVlID0gcmVzdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG59O1xuXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZS5leHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IERhdGVGb3JtYXR0ZXI7XG59XG4iLCIvKmpzbGludCBub2RlOiB0cnVlICovXG4vKiBnbG9iYWwgbW9kdWxlOiB0cnVlLCBleHBvcnRzOiB0cnVlICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIE51bWVyYWxGb3JtYXR0ZXIgPSBmdW5jdGlvbiAobnVtZXJhbERlY2ltYWxNYXJrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtZXJhbERlY2ltYWxTY2FsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsaW1pdGVyKSB7XG4gICAgdmFyIG93bmVyID0gdGhpcztcblxuICAgIG93bmVyLm51bWVyYWxEZWNpbWFsTWFyayA9IG51bWVyYWxEZWNpbWFsTWFyaztcbiAgICBvd25lci5udW1lcmFsRGVjaW1hbFNjYWxlID0gbnVtZXJhbERlY2ltYWxTY2FsZTtcbiAgICBvd25lci5udW1lcmFsVGhvdXNhbmRzR3JvdXBTdHlsZSA9IG51bWVyYWxUaG91c2FuZHNHcm91cFN0eWxlO1xuICAgIG93bmVyLmRlbGltaXRlciA9IGRlbGltaXRlcjtcbn07XG5cbk51bWVyYWxGb3JtYXR0ZXIuZ3JvdXBTdHlsZSA9IHtcbiAgICB0aG91c2FuZDogJ3Rob3VzYW5kJyxcbiAgICBsYWtoOiAgICAgJ2xha2gnLFxuICAgIHdhbjogICAgICAnd2FuJ1xufTtcblxuTnVtZXJhbEZvcm1hdHRlci5wcm90b3R5cGUgPSB7XG4gICAgZm9ybWF0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcywgcGFydHMsIHBhcnRJbnRlZ2VyLCBwYXJ0RGVjaW1hbCA9ICcnO1xuXG4gICAgICAgIC8vIHN0cmlwIGFscGhhYmV0IGxldHRlcnNcbiAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9bQS1aYS16XS9nLCAnJylcblxuICAgICAgICAgICAgLy8gcmVwbGFjZSB0aGUgZmlyc3QgZGVjaW1hbCBtYXJrIHdpdGggcmVzZXJ2ZWQgcGxhY2Vob2xkZXJcbiAgICAgICAgICAgIC5yZXBsYWNlKG93bmVyLm51bWVyYWxEZWNpbWFsTWFyaywgJ00nKVxuXG4gICAgICAgICAgICAvLyBzdHJpcCB0aGUgbm9uIG51bWVyaWMgbGV0dGVycyBleGNlcHQgTVxuICAgICAgICAgICAgLnJlcGxhY2UoL1teXFxkTV0vZywgJycpXG5cbiAgICAgICAgICAgIC8vIHJlcGxhY2UgbWFya1xuICAgICAgICAgICAgLnJlcGxhY2UoJ00nLCBvd25lci5udW1lcmFsRGVjaW1hbE1hcmspO1xuXG4gICAgICAgIHBhcnRJbnRlZ2VyID0gdmFsdWU7XG5cbiAgICAgICAgaWYgKHZhbHVlLmluZGV4T2Yob3duZXIubnVtZXJhbERlY2ltYWxNYXJrKSA+PSAwKSB7XG4gICAgICAgICAgICBwYXJ0cyA9IHZhbHVlLnNwbGl0KG93bmVyLm51bWVyYWxEZWNpbWFsTWFyayk7XG4gICAgICAgICAgICBwYXJ0SW50ZWdlciA9IHBhcnRzWzBdO1xuICAgICAgICAgICAgcGFydERlY2ltYWwgPSBvd25lci5udW1lcmFsRGVjaW1hbE1hcmsgKyBwYXJ0c1sxXS5zbGljZSgwLCBvd25lci5udW1lcmFsRGVjaW1hbFNjYWxlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXRjaCAob3duZXIubnVtZXJhbFRob3VzYW5kc0dyb3VwU3R5bGUpIHtcbiAgICAgICAgY2FzZSBOdW1lcmFsRm9ybWF0dGVyLmdyb3VwU3R5bGUubGFraDpcbiAgICAgICAgICAgIHBhcnRJbnRlZ2VyID0gcGFydEludGVnZXIucmVwbGFjZSgvKFxcZCkoPz0oXFxkXFxkKStcXGQkKS9nLCAnJDEnICsgb3duZXIuZGVsaW1pdGVyKTtcblxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBOdW1lcmFsRm9ybWF0dGVyLmdyb3VwU3R5bGUud2FuOlxuICAgICAgICAgICAgcGFydEludGVnZXIgPSBwYXJ0SW50ZWdlci5yZXBsYWNlKC8oXFxkKSg/PShcXGR7NH0pKyQpL2csICckMScgKyBvd25lci5kZWxpbWl0ZXIpO1xuXG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcGFydEludGVnZXIgPSBwYXJ0SW50ZWdlci5yZXBsYWNlKC8oXFxkKSg/PShcXGR7M30pKyQpL2csICckMScgKyBvd25lci5kZWxpbWl0ZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcnRJbnRlZ2VyLnRvU3RyaW5nKCkgKyBwYXJ0RGVjaW1hbC50b1N0cmluZygpO1xuICAgIH1cbn07XG5cbmlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlLmV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzID0gTnVtZXJhbEZvcm1hdHRlcjtcbn1cbiIsIi8qanNsaW50IG5vZGU6IHRydWUgKi9cbi8qIGdsb2JhbCBtb2R1bGU6IHRydWUsIGV4cG9ydHM6IHRydWUgKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUGhvbmVGb3JtYXR0ZXIgPSBmdW5jdGlvbiAoZm9ybWF0dGVyLCBkZWxpbWl0ZXIpIHtcbiAgICB2YXIgb3duZXIgPSB0aGlzO1xuXG4gICAgb3duZXIuZGVsaW1pdGVyID0gZGVsaW1pdGVyIHx8ICcgJztcbiAgICBvd25lci5kZWxpbWl0ZXJSRSA9IG5ldyBSZWdFeHAob3duZXIuZGVsaW1pdGVyLCBcImdcIik7XG4gICAgb3duZXIuZm9ybWF0dGVyID0gZm9ybWF0dGVyO1xufTtcblxuUGhvbmVGb3JtYXR0ZXIucHJvdG90eXBlID0ge1xuICAgIHNldEZvcm1hdHRlcjogZnVuY3Rpb24gKGZvcm1hdHRlcikge1xuICAgICAgICB0aGlzLmZvcm1hdHRlciA9IGZvcm1hdHRlcjtcbiAgICB9LFxuXG4gICAgZm9ybWF0OiBmdW5jdGlvbiAocGhvbmVOdW1iZXIpIHtcbiAgICAgICAgdmFyIG93bmVyID0gdGhpcztcblxuICAgICAgICBvd25lci5mb3JtYXR0ZXIuY2xlYXIoKTtcblxuICAgICAgICAvLyBvbmx5IGtlZXAgbnVtYmVyIGFuZCArXG4gICAgICAgIHBob25lTnVtYmVyID0gcGhvbmVOdW1iZXIucmVwbGFjZSgvW15cXGQrXS9nLCAnJyk7XG5cbiAgICAgICAgLy8gc3RyaXAgZGVsaW1pdGVyXG4gICAgICAgIHBob25lTnVtYmVyID0gcGhvbmVOdW1iZXIucmVwbGFjZShvd25lci5kZWxpbWl0ZXJSRSwgJycpO1xuXG4gICAgICAgIHZhciByZXN1bHQgPSAnJywgY3VycmVudCwgdmFsaWRhdGVkID0gZmFsc2U7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGlNYXggPSBwaG9uZU51bWJlci5sZW5ndGg7IGkgPCBpTWF4OyBpKyspIHtcbiAgICAgICAgICAgIGN1cnJlbnQgPSBvd25lci5mb3JtYXR0ZXIuaW5wdXREaWdpdChwaG9uZU51bWJlci5jaGFyQXQoaSkpO1xuXG4gICAgICAgICAgICAvLyBoYXMgKCktIG9yIHNwYWNlIGluc2lkZVxuICAgICAgICAgICAgaWYgKC9bXFxzKCktXS9nLnRlc3QoY3VycmVudCkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBjdXJyZW50O1xuXG4gICAgICAgICAgICAgICAgdmFsaWRhdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCF2YWxpZGF0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gY3VycmVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gZWxzZTogb3ZlciBsZW5ndGggaW5wdXRcbiAgICAgICAgICAgICAgICAvLyBpdCB0dXJucyB0byBpbnZhbGlkIG51bWJlciBhZ2FpblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3RyaXAgKClcbiAgICAgICAgLy8gZS5nLiBVUzogNzE2MTIzNDU2NyByZXR1cm5zICg3MTYpIDEyMy00NTY3XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdC5yZXBsYWNlKC9bKCldL2csICcnKTtcbiAgICAgICAgLy8gcmVwbGFjZSBsaWJyYXJ5IGRlbGltaXRlciB3aXRoIHVzZXIgY3VzdG9taXplZCBkZWxpbWl0ZXJcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoL1tcXHMtXS9nLCBvd25lci5kZWxpbWl0ZXIpO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxufTtcblxuaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBQaG9uZUZvcm1hdHRlcjtcbn1cbiJdfQ==
