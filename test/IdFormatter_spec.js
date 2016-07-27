var _ = require('underscore');
var IdFormatter = require('../src/shortcuts/IdFormatter');
var ids = require('./fixtures/id.json');

describe('IdFormatter', function () {
    _.each(ids, function (id) {
        var title = [];

        if (id.idType) {
            title.push('Id Type: ' + id.idType);
        }

        describe(title.join(', '), function () {
            var idFormatter = new IdFormatter(
                id.idType
            );

            _.each(id.ids, function (number) {
                it('should convert number ' + number[0] + ' to ' + number[1], function () {
                    idFormatter.format(number[0]).should.eql(number[1]);
                });
            });
        });
    });
});
