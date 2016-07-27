'use strict';

var IdFormatter = function (idType) {
    var owner = this;

    owner.idType = idType;

    if (owner.idType == IdFormatter.type.cpf) {
        owner.blocks = [3, 3, 3, 2];
    }
};

IdFormatter.type = {
    cpf: 'CPF'
};

IdFormatter.prototype = {
    getMaxLength: function () {
        var owner = this;

        if (owner.idType == IdFormatter.type.cpf) {
            return 14;
        }

        return;
    },

    getRawValue: function (value) {
        var owner = this;

        if (owner.idType == IdFormatter.type.cpf) {
            return value.replace(/[-.]/g, '');
        }

        return;
    },

    format: function (value) {
        var owner = this;

        // strip the non numeric letters
        value = value.replace(/[^\d]/g, '');

        switch (owner.idType) {
        case IdFormatter.type.cpf:
            // add a . before every group of 3 numbers
            value = value.replace(/([0-9]{3})/g, '.$1');

            // remove the remaining . at the beginning
            value = value.replace(/^\./, '');

            // add a - before the last 2 numbers
            value = value.replace(/([0-9]{2})$/, '-$1');

            break;
        }

        return value;
    }
};

if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = exports = IdFormatter;
}
