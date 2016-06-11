/*jslint node: true */
/* global window: true, module: true, exports: true, define: true */

'use strict';

var PhoneFormatter = function (formatter, delimiter) {
    var owner = this;

    owner.delimiter = delimiter || ' ';
    owner.delimiterRE = new RegExp(owner.delimiter, "g");
    owner.formatter = formatter;
};

PhoneFormatter.prototype = {
    setFormatter: function (formatter) {
        this.formatter = formatter;
    },

    format: function (phoneNumber) {
        var owner = this;

        owner.formatter.clear();

        // only keep number and +
        phoneNumber = phoneNumber.replace(/[^\d+]/g, '');

        // strip delimiter
        phoneNumber = phoneNumber.replace(owner.delimiterRE, '');

        var result = '', current, validated = false;

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

if (typeof module === 'object' && typeof module.exports === 'object') {
    // CommonJS
    module.exports = exports = PhoneFormatter;
} else if (typeof define === 'function' && define.amd) {
    // AMD
    define(function () {
        return PhoneFormatter;
    });
} else if (typeof window === 'object') {
    // Normal way
    window.Cleave.PhoneFormatter = PhoneFormatter;
}
