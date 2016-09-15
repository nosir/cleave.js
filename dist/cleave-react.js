(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"));
	else if(typeof define === 'function' && define.amd)
		define(["react"], factory);
	else if(typeof exports === 'object')
		exports["Cleave"] = factory(require("react"));
	else
		root["Cleave"] = factory(root["React"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _Cleave = __webpack_require__(1);

	var _Cleave2 = _interopRequireDefault(_Cleave);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = _Cleave2.default;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

	var React = __webpack_require__(2);

	var NumeralFormatter = __webpack_require__(3);
	var DateFormatter = __webpack_require__(4);
	var PhoneFormatter = __webpack_require__(5);
	var CreditCardDetector = __webpack_require__(6);
	var Util = __webpack_require__(7);
	var DefaultProperties = __webpack_require__(8);

	var Cleave = React.createClass({
	    displayName: 'Cleave',

	    componentDidMount: function componentDidMount() {
	        this.init();
	    },

	    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
	        var owner = this,
	            phoneRegionCode = nextProps.options.phoneRegionCode,
	            newValue = nextProps.value;

	        if (newValue !== undefined) {
	            newValue = newValue.toString();

	            if (newValue !== owner.properties.initValue) {
	                owner.properties.initValue = newValue;
	                owner.onInput(newValue);
	            }
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
	        var onInit = _owner$props.onInit;


	        owner.registeredEvents = {
	            onInit: onInit || Util.noop,
	            onChange: onChange || Util.noop,
	            onKeyDown: onKeyDown || Util.noop
	        };

	        options.initValue = value;

	        owner.properties = DefaultProperties.assign({}, options);

	        return {
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

	        owner.registeredEvents.onInit(owner);
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
	            pps.phoneFormatter = new PhoneFormatter(new pps.root.Cleave.AsYouTypeFormatter(pps.phoneRegionCode), pps.delimiter);
	        } catch (ex) {
	            throw new Error('Please include phone-type-formatter.{country}.js lib');
	        }
	    },

	    setRawValue: function setRawValue(value) {
	        var owner = this,
	            pps = owner.properties;

	        value = value.toString();

	        if (pps.numeral) {
	            value = value.replace('.', pps.numeralDecimalMark);
	        }

	        owner.onChange({ target: { value: value } });
	    },

	    onInit: function onInit(owner) {
	        return owner;
	    },

	    onKeyDown: function onKeyDown(event) {
	        var owner = this,
	            pps = owner.properties,
	            charCode = event.which || event.keyCode;

	        // hit backspace when last character is delimiter
	        if (charCode === 8 && Util.isDelimiter(pps.result.slice(-1), pps.delimiter, pps.delimiters)) {
	            pps.backspace = true;
	        } else {
	            pps.backspace = false;
	        }

	        owner.registeredEvents.onKeyDown(event);
	    },

	    onChange: function onChange(event) {
	        var owner = this,
	            pps = owner.properties,
	            rawValue;

	        owner.onInput(event.target.value);

	        rawValue = pps.result;

	        if (pps.rawValueTrimPrefix) {
	            rawValue = Util.getPrefixStrippedValue(rawValue, pps.prefix, pps.prefixLength);
	        }

	        if (pps.numeral) {
	            rawValue = pps.numeralFormatter.getRawValue(rawValue);
	        } else {
	            rawValue = Util.stripDelimiters(rawValue, pps.delimiter, pps.delimiters);
	        }

	        event.target.rawValue = rawValue;
	        event.target.value = pps.result;

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

	        if (!pps.numeral && pps.backspace && !Util.isDelimiter(value.slice(-1), pps.delimiter, pps.delimiters)) {
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
	        value = Util.stripDelimiters(value, pps.delimiter, pps.delimiters);

	        // strip prefix
	        value = Util.getPrefixStrippedValue(value, pps.prefix, pps.prefixLength);

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
	        pps.result = Util.getFormattedValue(value, pps.blocks, pps.blocksLength, pps.delimiter, pps.delimiters);

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
	        var _owner$props2 = owner.props;
	        var value = _owner$props2.value;
	        var options = _owner$props2.options;
	        var onKeyDown = _owner$props2.onKeyDown;
	        var onChange = _owner$props2.onChange;
	        var onInit = _owner$props2.onInit;

	        var propsToTransfer = _objectWithoutProperties(_owner$props2, ['value', 'options', 'onKeyDown', 'onChange', 'onInit']);

	        return React.createElement('input', _extends({
	            type: 'text',
	            value: owner.state.value,
	            onKeyDown: owner.onKeyDown,
	            onChange: owner.onChange
	        }, propsToTransfer, {
	            propsToIgnore: [value, options, onKeyDown, onChange, onInit]
	        }));
	    }
	});

	module.exports = Cleave;

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

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

	        // strip non numeric letters except minus and "M"
	        // this is to ensure prefix has been stripped
	        .replace(/[^\dM-]/g, '')

	        // replace the leading minus with reserved placeholder
	        .replace(/^\-/, 'N')

	        // strip the other minus sign (if present)
	        .replace(/\-/g, '')

	        // replace the minus sign (if present)
	        .replace('N', '-')

	        // replace decimal mark
	        .replace('M', owner.numeralDecimalMark)

	        // strip any leading zeros
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

	module.exports = NumeralFormatter;

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

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

	module.exports = DateFormatter;

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

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

	module.exports = PhoneFormatter;

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

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
	        maestro: [4, 4, 4, 4],
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

	        // starts with 50/56-58/6304/67; 16 digits
	        maestro: /^(?:5[0678]\d{0,2}|6304|67\d{0,2})\d{0,12}/,

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
	        } else if (re.maestro.test(value)) {
	            return {
	                type: 'maestro',
	                blocks: blocks.maestro
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

	module.exports = CreditCardDetector;

/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';

	var Util = {
	    noop: function noop() {},

	    strip: function strip(value, re) {
	        return value.replace(re, '');
	    },

	    isDelimiter: function isDelimiter(letter, delimiter, delimiters) {
	        // single delimiter
	        if (delimiters.length === 0) {
	            return letter === delimiter;
	        }

	        // multiple delimiters
	        return delimiters.some(function (current) {
	            if (letter === current) {
	                return true;
	            }
	        });
	    },

	    stripDelimiters: function stripDelimiters(value, delimiter, delimiters) {
	        // single delimiter
	        if (delimiters.length === 0) {
	            var delimiterRE = delimiter ? new RegExp('\\' + delimiter, 'g') : '';

	            return value.replace(delimiterRE, '');
	        }

	        // multiple delimiters
	        delimiters.forEach(function (current) {
	            value = value.replace(new RegExp('\\' + current, 'g'), '');
	        });

	        return value;
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
	    getPrefixStrippedValue: function getPrefixStrippedValue(value, prefix, prefixLength) {
	        if (value.slice(0, prefixLength) !== prefix) {
	            var diffIndex = this.getFirstDiffIndex(prefix, value.slice(0, prefixLength));

	            value = prefix + value.slice(diffIndex, diffIndex + 1) + value.slice(prefixLength + 1);
	        }

	        return value.slice(prefixLength);
	    },

	    getFirstDiffIndex: function getFirstDiffIndex(prev, current) {
	        var index = 0;

	        while (prev.charAt(index) === current.charAt(index)) {
	            if (prev.charAt(index++) === '') return -1;
	        }return index;
	    },

	    getFormattedValue: function getFormattedValue(value, blocks, blocksLength, delimiter, delimiters) {
	        var result = '',
	            multipleDelimiters = delimiters.length > 0,
	            currentDelimiter;

	        blocks.forEach(function (length, index) {
	            if (value.length > 0) {
	                var sub = value.slice(0, length),
	                    rest = value.slice(length);

	                result += sub;

	                currentDelimiter = multipleDelimiters ? delimiters[index] || currentDelimiter : delimiter;

	                if (sub.length === length && index < blocksLength - 1) {
	                    result += currentDelimiter;
	                }

	                // update remaining string
	                value = rest;
	            }
	        });

	        return result;
	    }
	};

	module.exports = Util;

/***/ },
/* 8 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';

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
	        target.rawValueTrimPrefix = !!opts.rawValueTrimPrefix;
	        target.copyDelimiter = !!opts.copyDelimiter;

	        target.initValue = opts.initValue === undefined ? '' : opts.initValue.toString();

	        target.delimiter = opts.delimiter || opts.delimiter === '' ? opts.delimiter : opts.date ? '/' : opts.numeral ? ',' : opts.phone ? ' ' : ' ';
	        target.delimiters = opts.delimiters || [];

	        target.blocks = opts.blocks || [];
	        target.blocksLength = target.blocks.length;

	        target.root = (typeof global === 'undefined' ? 'undefined' : _typeof(global)) === 'object' && global ? global : window;

	        target.maxLength = 0;

	        target.backspace = false;
	        target.result = '';

	        return target;
	    }
	};

	module.exports = DefaultProperties;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ }
/******/ ])
});
;