'use strict';

var React = require('react'); // eslint-disable-line no-unused-vars
var CreateReactClass = require('create-react-class');

var NumeralFormatter = require('./shortcuts/NumeralFormatter');
var DateFormatter = require('./shortcuts/DateFormatter');
var PhoneFormatter = require('./shortcuts/PhoneFormatter');
var CreditCardDetector = require('./shortcuts/CreditCardDetector');
var Util = require('./utils/Util');
var DefaultProperties = require('./common/DefaultProperties');

var cleaveReactClass = CreateReactClass({
    componentDidMount: function () {
        this.init();
    },

    componentDidUpdate: function () {
        var owner = this;

        if (!owner.state.updateCursorPosition) {
            return;
        }

        owner.setCurrentSelection(owner.state.cursorPosition);
    },

    componentWillReceiveProps: function (nextProps) {
        var owner = this,
            phoneRegionCode = (nextProps.options || {}).phoneRegionCode,
            newValue = nextProps.value;

        if (newValue !== undefined) {
            newValue = newValue.toString();

            if (newValue !== owner.state.value && newValue !== owner.properties.result) {                
                owner.properties.initValue = newValue;
                owner.onInput(newValue, true);                
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

        if (!options) {
            options = {};
        }
        options.initValue = value;

        owner.properties = DefaultProperties.assign({}, options);

        return {
            value: owner.properties.result,
            cursorPosition: 0,
            updateCursorPosition: false
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

        // avoid touch input field if value is null
        // otherwise Firefox will add red box-shadow for <input required />
        if (pps.initValue || (pps.prefix && !pps.noImmediatePrefix)) {
            owner.onInput(pps.initValue);
        }

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
            pps.stripLeadingZeroes,
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

        pps.backspace = false;

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

    getISOFormatDate: function () {
        var owner = this,
            pps = owner.properties;

        return pps.date ? pps.dateFormatter.getISOFormatDate() : '';
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

    onInput: function (value, fromProps) {
        var owner = this, pps = owner.properties;

        if (Util.isAndroidBackspaceKeydown(owner.lastInputValue, owner.element.value) && 
        Util.isDelimiter(pps.result.slice(-pps.delimiterLength), pps.delimiter, pps.delimiters)) {
            pps.backspace = true;
        }

        // case 1: delete one more character "4"
        // 1234*| -> hit backspace -> 123|
        // case 2: last character is not delimiter which is:
        // 12|34* -> hit backspace -> 1|34*

        if (!fromProps && !pps.numeral && pps.backspace && !Util.isDelimiter(value.slice(-pps.delimiterLength), pps.delimiter, pps.delimiters)) {
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
            if (pps.prefix && (!pps.noImmediatePrefix || value.length)) {
                pps.result = pps.prefix + pps.numeralFormatter.format(value);
            } else {
                pps.result = pps.numeralFormatter.format(value);
            }
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
        if (pps.prefix && (!pps.noImmediatePrefix || value.length)) {
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
        pps.result = Util.getFormattedValue(
            value,
            pps.blocks, pps.blocksLength,
            pps.delimiter, pps.delimiters, pps.delimiterLazyShow
        );

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

    getNextCursorPosition: function (endPos, oldValue, newValue) {
        // If cursor was at the end of value, just place it back.
        // Because new value could contain additional chars.
        if (oldValue.length === endPos) {
            return newValue.length;
        }

        return endPos;
    },

    setCurrentSelection: function (cursorPosition) {
        var elem = this.element;

        this.setState({
            updateCursorPosition: false
        });

        if ( elem === document.activeElement ) {
          if ( elem.createTextRange ) {
            var range = elem.createTextRange();
            range.move('character', cursorPosition);
            range.select();
          } else {
            elem.setSelectionRange(cursorPosition, cursorPosition);
          }
        }
    },

    updateValueState: function () {
        var owner = this;

        if (!owner.element) {
            owner.setState({ value: owner.properties.result });
        }

        var endPos = owner.element.selectionEnd;
        var oldValue = owner.element.value;
        var newValue = owner.properties.result;
        var nextCursorPosition = owner.getNextCursorPosition(endPos, oldValue, newValue);

        owner.lastInputValue = owner.properties.result;
        
        if (owner.isAndroid) {
            window.setTimeout(function () {
                owner.setState({
                    value: owner.properties.result,
                    cursorPosition: nextCursorPosition,
                    updateCursorPosition: true
                });
            }, 1);

            return;
        }

        owner.setState({
            value: owner.properties.result,
            cursorPosition: nextCursorPosition,
            updateCursorPosition: true
        });
    },

    render: function () {
        var owner = this;
        // eslint-disable-next-line
        var { value, options, onKeyDown, onFocus, onBlur, onChange, onInit, htmlRef, ...propsToTransfer } = owner.props;

        return (
            <input
                type="text"
                ref={function (ref) {
                    owner.element = ref;

                    if (!htmlRef) {
                        return;
                    }

                    htmlRef.apply(this, arguments);
                }}
                value={owner.state.value}
                onKeyDown={owner.onKeyDown}
                onChange={owner.onChange}
                onFocus={owner.onFocus}
                onBlur={owner.onBlur}
                {...propsToTransfer}
            />
        );
    }
});

module.exports = cleaveReactClass;
