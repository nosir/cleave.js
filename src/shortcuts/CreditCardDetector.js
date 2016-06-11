/*jslint node: true */
/* global window: true, module: true, exports: true, define: true */

'use strict';
var CreditCardDetector = {
    blocks: {
        uatp:          [4, 5, 6],
        amex:          [4, 6, 5],
        diners:        [4, 6, 4],
        mastercard:    [4, 4, 4, 4],
        dankort:       [4, 4, 4, 4],
        instapayment:  [4, 4, 4, 4],
        jcb:           [4, 4, 4, 4],
        generalStrict: [4, 4, 4, 7],
        generalLoose:  [4, 4, 4, 4]
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

    getBlocksByPAN: function (value, strictMode) {
        var blocks = CreditCardDetector.blocks,
            re = CreditCardDetector.re,
            strict = !!strictMode;

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
        } else if (strict) {
            return blocks.generalStrict;
        } else {
            return blocks.generalLoose;
        }
    }
};

if (typeof module === 'object' && typeof module.exports === 'object') {
    // CommonJS
    module.exports = exports = CreditCardDetector;
} else if (typeof define === 'function' && define.amd) {
    // AMD
    define(function () {
        return CreditCardDetector;
    });
} else if (typeof window === 'object') {
    // Normal way
    window.Cleave.CreditCardDetector = CreditCardDetector;
}
