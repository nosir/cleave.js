/* jslint node: true */

'use strict';

var React = require('react');

var NumeralFormatter = require('./shortcuts/NumeralFormatter');
var DateFormatter = require('./shortcuts/DateFormatter');
var PhoneFormatter = require('./shortcuts/PhoneFormatter');
var CreditCardDetector = require('./shortcuts/CreditCardDetector');

var Utils = {
    strip: function (value, re) {
        return value.replace(re, '');
    },

    headStr: function (str, length) {
        return str.slice(0, length);
    }
};

var Cleave = React.createClass({
    componentDidMount: function () {
        this.init();
    },

    getInitialState: function () {
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

        vars.prefix = (vars.creditCard || vars.phone || vars.date) ? '' : (opts.prefix || '');
        vars.prefixLength = vars.prefix.length;

        vars.delimiter = opts.delimiter || (vars.date ? '/' : (vars.numeral ? ',' : ' '));
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

    init: function () {
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

    initNumeralFormatter: function () {
        var owner = this,
            vars = owner.state.vars;

        if (!vars.numeral) {
            return;
        }

        vars.numeralFormatter = new NumeralFormatter(
            vars.numeralDecimalMark,
            vars.numeralDecimalScale,
            vars.numeralThousandsGroupStyle,
            vars.delimiter
        );
    },

    initDateFormatter: function () {
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

    initPhoneFormatter: function () {
        var owner = this,
            vars = owner.state.vars;

        if (!vars.phone) {
            return;
        }

        // Cleave.AsYouTypeFormatter should be provided by
        // external google closure lib
        try {
            vars.phoneFormatter = new PhoneFormatter(
                new window.Cleave.AsYouTypeFormatter(vars.phoneRegionCode),
                vars.delimiter
            );
        } catch (ex) {
            throw new Error('Please include phone-type-formatter.{country}.js lib');
        }
    },

    onKeydown: function (event) {
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

    getMaxLength: function () {
        return this.state.vars.blocks.reduce(function (previous, current) {
            return previous + current;
        }, 0);
    },

    onChange: function(e) {
      this.onInput(e.target.value);
    },

    onInput: function (value) {
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

    render: function () {
        var { value, options, onKeydown, onChange, ...other } = this.props;
        //
        return (
            <input type="text" {...other}
                   value={this.state.vars.result}
                   onKeydown={this.onKeydown}
                   onChange={this.onChange}/>
        );
    }
});

module.exports = window.Cleave = Cleave;
