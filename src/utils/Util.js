'use strict';

var Util = {
    noop: function () {
    },

    strip: function (value, re) {
        return value.replace(re, '');
    },

    headStr: function (str, length) {
        return str.slice(0, length);
    },

    getMaxLength: function (blocks) {
        return blocks.reduce(function (previous, current) {
            return previous + current;
        }, 0);
    },

    // strip value by prefix length
    // for prefix: PRE
    // (PRE123, 3) -> 123
    // (PR123, 3) -> 23 this happens when user hits backspace in front of "PRE"
    getPrefixStrippedValue: function (value, prefix) {
        var escapedPrefix = this.getRegexpEscapedString(prefix);
        var pattern = new RegExp('^(' + escapedPrefix + ')+|$', 'g');

        return value.replace(pattern, '');
    },

    getRegexpEscapedString: function(str) {
        return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    },

    getFormattedValue: function (value, blocks, blocksLength, delimiter) {
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

if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = exports = Util;
}
