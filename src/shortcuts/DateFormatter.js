'use strict';

var DateFormatter = function (datePattern) {
    var owner = this;

    owner.blocks = [];
    owner.datePattern = datePattern;
    owner.initBlocks();
};

DateFormatter.prototype = {
    initBlocks: function () {
        var owner = this;
        owner.datePattern.forEach(function (value) {
            if (value === 'Y') {
                owner.blocks.push(4);
            } else {
                owner.blocks.push(2);
            }
        });
    },

    getBlocks: function () {
        return this.blocks;
    },

    getValidatedDate: function (value) {
        var owner = this, result = '';

        value = value.replace(/[^\d]/g, '');

        owner.blocks.forEach(function (length, index) {
            if (value.length > 0) {
                var sub = value.slice(0, length),
                    rest = value.slice(length);

                switch (owner.datePattern[index]) {
                  case 'd':
                    if (parseInt(sub, 10) > 31) {
                        sub = '31';
                    } else if (parseInt(sub, 10) === 0) {
                        sub = '01';
                    }
                    break;
                  case 'm':
                    if (parseInt(sub, 10) > 12) {
                        sub = '12';
                    } else if (parseInt(sub, 10) === 0) {
                        sub = '01';
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

if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = exports = DateFormatter;
}
