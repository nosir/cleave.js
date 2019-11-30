/**
 * Props override
 */
var ExistingProperties = {
    assign: function (target, opts) {
        target = target || {};
        opts = opts || {};

        // credit card
        target.creditCard = opts.creditCard === undefined ? target.creditCard : opts.creditCard;
        target.creditCardStrictMode = opts.creditCardStrictMode === undefined ? target.creditCardStrictMode : opts.creditCardStrictMode;
        target.onCreditCardTypeChanged = opts.onCreditCardTypeChanged || target.creditCardStrictMode;

        // phone
        target.phone = opts.phone === undefined ? target.phone : opts.phone;
        target.phoneRegionCode = opts.phoneRegionCode || target.phoneRegionCode;

        // time
        target.time = opts.time === undefined ? target.time : opts.time;
        target.timePattern = opts.timePattern || target.timePattern;
        target.timeFormat = opts.timeFormat || target.timeFormat;

        // date
        target.date = opts.date === undefined ? target.date : opts.date;
        target.datePattern = opts.datePattern || target.date;
        target.dateMin = opts.dateMin || target.dateMin;
        target.dateMax = opts.dateMax || target.dateMax;

        // numeral
        target.numeral = opts.numeral === undefined ? target.numeral : opts.numeral;
        target.numeralIntegerScale = opts.numeralIntegerScale > 0 ? opts.numeralIntegerScale : target.numeralIntegerScale;
        target.numeralDecimalScale = opts.numeralDecimalScale >= 0 ? opts.numeralDecimalScale : target.numeralDecimalScale;
        target.numeralDecimalMark = opts.numeralDecimalMark || target.numeralDecimalMark;
        target.numeralThousandsGroupStyle = opts.numeralThousandsGroupStyle || target.numeralThousandsGroupStyle;
        target.numeralPositiveOnly = opts.numeralPositiveOnly === undefined ? target.numeralPositiveOnly : opts.numeralPositiveOnly;
        target.stripLeadingZeroes = opts.stripLeadingZeroes === undefined ? target.stripLeadingZeroes : opts.stripLeadingZeroes;
        target.signBeforePrefix = opts.signBeforePrefix || target.signBeforePrefix;

        // others
        target.numericOnly = opts.numericOnly === undefined ? target.numericOnly : opts.numericOnly;

        target.uppercase = opts.uppercase === undefined ? target.uppercase : opts.uppercase;
        target.lowercase = opts.lowercase === undefined ? target.lowercase : opts.lowercase;

        target.prefix = opts.prefix || target.prefix;
        target.noImmediatePrefix = opts.noImmediatePrefix === undefined ? target.noImmediatePrefix : opts.noImmediatePrefix;
        target.prefixLength = (opts.prefix || target.prefix).length;
        target.rawValueTrimPrefix = opts.rawValueTrimPrefix === undefined ? target.rawValueTrimPrefix : opts.rawValueTrimPrefix;
        target.copyDelimiter = opts.copyDelimiter === undefined ? target.copyDelimiter : opts.copyDelimiter;

        target.initValue = (opts.initValue !== undefined && opts.initValue !== null) ? opts.initValue.toString() : target.initValue;

        target.delimiter =
            (opts.delimiter || opts.delimiter === '') ? opts.delimiter :
                (opts.date ? '/' :
                    (opts.time ? ':' :
                        (opts.numeral ? ',' :
                            (opts.phone ? ' ' :
                                target.delimiter))));
        target.delimiterLength = target.delimiter.length;
        target.delimiterLazyShow = opts.delimiterLazyShow === undefined ? target.delimiterLazyShow : opts.delimiterLazyShow;
        target.delimiters = opts.delimiters || target.delimiters;

        target.blocks = opts.blocks || target.blocks;
        target.blocksLength = target.blocks.length;

        target.root = (typeof global === 'object' && global) ? global : window;
        target.document = opts.document || target.document;

        target.onValueChanged = opts.onValueChanged || target.onValueChanged;

        return target;
    }
};

module.exports = ExistingProperties;