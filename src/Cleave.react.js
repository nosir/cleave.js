'use strict';

var React = require('react'); // eslint-disable-line no-unused-vars
var CreateReactClass = require('create-react-class');

var NumeralFormatter = require('./shortcuts/NumeralFormatter');
var DateFormatter = require('./shortcuts/DateFormatter');
var PhoneFormatter = require('./shortcuts/PhoneFormatter');
var CreditCardDetector = require('./shortcuts/CreditCardDetector');
var Util = require('./utils/Util');
var DefaultProperties = require('./common/DefaultProperties');

var Cleave = CreateReactClass({
    componentDidMount: function () {
        this.init();
    },

    componentWillReceiveProps: function (nextProps) {
        var owner = this,
            phoneRegionCode = (nextProps.options || {}).phoneRegionCode,
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

    getInitialState: function () {
        var owner = this,
            { value, options, onKeyDown, onChange, onFocus, onBlur, onInit } = owner.props;

        owner.registeredEvents = {
            onInit:    onInit || Util.noop,
            onChange:  onChange || Util.noop,
            onFocus:   onFocus || Util.noop,
            onBlur:    onBlur || Util.noop,
            onKeyDown: onKeyDown || Util.noop
        };

        (options || {}).initValue = value;

        owner.properties = DefaultProperties.assign({}, options);

        return {
            value: owner.properties.result
        };
    },

    init: function () {
        var owner = this,
            pps = owner.properties;

        // so no need for this lib at all
        if (!pps.numeral && !pps.phone && !pps.creditCard && !pps.date && (pps.blocksLength === 0 && !pps.prefix)) {
            owner.onInput(pps.initValue);
            owner.registeredEvents.onInit(owner);

            return;
        }

        pps.maxLength = Util.getMaxLength(pps.blocks);

        owner.isAndroid = Util.isAndroid();

        owner.initPhoneFormatter();
        owner.initDateFormatter();
        owner.initNumeralFormatter();

        owner.onInput(pps.initValue);

        owner.registeredEvents.onInit(owner);
    },

    initNumeralFormatter: function () {
        var owner = this,
            pps = owner.properties;

        if (!pps.numeral) {
            return;
        }

        pps.numeralFormatter = new NumeralFormatter(
            pps.numeralDecimalMark,
            pps.numeralIntegerScale,
            pps.numeralDecimalScale,
            pps.numeralThousandsGroupStyle,
            pps.numeralPositiveOnly,
            pps.delimiter
        );
    },

    initDateFormatter: function () {
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

    initPhoneFormatter: function () {
        var owner = this,
            pps = owner.properties;

        if (!pps.phone) {
            return;
        }

        // Cleave.AsYouTypeFormatter should be provided by
        // external google closure lib
        try {
            pps.phoneFormatter = new PhoneFormatter(
                new pps.root.Cleave.AsYouTypeFormatter(pps.phoneRegionCode),
                pps.delimiter
            );
        } catch (ex) {
            throw new Error('Please include phone-type-formatter.{country}.js lib');
        }
    },

    setRawValue: function (value) {
        var owner = this,
            pps = owner.properties;

        value = value !== undefined && value !== null ? value.toString() : '';

        if (pps.numeral) {
            value = value.replace('.', pps.numeralDecimalMark);
        }

        owner.onChange({target: {value: value}});
    },

    getRawValue: function () {
        var owner = this, pps = owner.properties,
            rawValue = pps.result;

        if (pps.rawValueTrimPrefix) {
            rawValue = Util.getPrefixStrippedValue(rawValue, pps.prefix, pps.prefixLength);
        }

        if (pps.numeral) {
            rawValue = pps.numeralFormatter.getRawValue(rawValue);
        } else {
            rawValue = Util.stripDelimiters(rawValue, pps.delimiter, pps.delimiters);
        }

        return rawValue;
    },

    onInit: function (owner) {
        return owner;
    },

    onKeyDown: function (event) {
        var owner = this,
            pps = owner.properties,
            charCode = event.which || event.keyCode;

        // hit backspace when last character is delimiter
        if (charCode === 8 && Util.isDelimiter(pps.result.slice(-pps.delimiterLength), pps.delimiter, pps.delimiters)) {
            pps.backspace = true;
        } else {
            pps.backspace = false;
        }

        owner.registeredEvents.onKeyDown(event);
    },

    onFocus: function (event) {
        var owner = this, pps = owner.properties;

        event.target.rawValue = owner.getRawValue();
        event.target.value = pps.result;

        owner.registeredEvents.onFocus(event);
    },

    onBlur: function (event) {
        var owner = this, pps = owner.properties;

        event.target.rawValue = owner.getRawValue();
        event.target.value = pps.result;

        owner.registeredEvents.onBlur(event);
    },


    onChange: function (event) {
        var owner = this, pps = owner.properties;

        owner.onInput(event.target.value);

        event.target.rawValue = owner.getRawValue();
        event.target.value = pps.result;

        owner.registeredEvents.onChange(event);
    },

    onInput: function (value) {
        var owner = this, pps = owner.properties,
            prev = pps.result;

        // case 1: delete one more character "4"
        // 1234*| -> hit backspace -> 123|
        // case 2: last character is not delimiter which is:
        // 12|34* -> hit backspace -> 1|34*

        if (!pps.numeral && pps.backspace && !Util.isDelimiter(value.slice(-pps.delimiterLength), pps.delimiter, pps.delimiters)) {
            value = Util.headStr(value, value.length - pps.delimiterLength);
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
        value = pps.maxLength > 0 ? Util.headStr(value, pps.maxLength) : value;

        // apply blocks
        pps.result = Util.getFormattedValue(value, pps.blocks, pps.blocksLength, pps.delimiter, pps.delimiters);

        // nothing changed
        // prevent update value to avoid caret position change
        if (prev === pps.result && prev !== pps.prefix) {
            return;
        }

        owner.updateValueState();
    },

    updateCreditCardPropsByValue: function (value) {
        var owner = this, pps = owner.properties,
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

    updateValueState: function () {
        var owner = this;

        if (owner.isAndroid) {
            window.setTimeout(function () {
                owner.setState({value: owner.properties.result});
            }, 1);

            return;
        }

        owner.setState({value: owner.properties.result});
    },

    render: function () {
        var owner = this,
            { value, options, onKeyDown, onFocus, onBlur, onChange, onInit, htmlRef, ...propsToTransfer } = owner.props;

        return (
            <input
                type="text"
                ref={htmlRef}
                value={owner.state.value}
                onKeyDown={owner.onKeyDown}
                onChange={owner.onChange}
                onFocus={owner.onFocus}
                onBlur={owner.onBlur}
                {...propsToTransfer}
                data-cleave-ignore={[value, options, onFocus, onBlur, onKeyDown, onChange, onInit, htmlRef]}
            />
        );
    }
});

module.exports = Cleave;
