'use strict';

var Util = {
    noop: function () {
    },

    strip: function (value, re) {
        return value.replace(re, '');
    },

    isDelimiter: function (letter, delimiter, delimiters) {
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

    stripDelimiters: function (value, delimiter, delimiters) {
        // single delimiter
        if (delimiters.length === 0) {
            return value.replace(new RegExp('\\' + delimiter, 'g'), '');
        }

        // multiple delimiters
        delimiters.forEach(function (current) {
            value = value.replace(new RegExp('\\' + current, 'g'), '');
        });

        return value;
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
    getPrefixStrippedValue: function (value, prefixLength) {
        return value.slice(prefixLength);
    },

    getFormattedValue: function (value, blocks, blocksLength, delimiter, delimiters) {
        var result = '',
            multipleDelimiters = delimiters.length > 0,
            currentDelimiter;

        blocks.forEach(function (length, index) {
            if (value.length > 0) {
                var sub = value.slice(0, length),
                    rest = value.slice(length);

                result += sub;

                currentDelimiter = multipleDelimiters ? (delimiters[index] || currentDelimiter) : delimiter;

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

if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = exports = Util;
}
