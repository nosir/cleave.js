var _ = require('underscore');
var DateFormatter = require('../../src/shortcuts/DateFormatter');
var dateGroups = require('../fixtures/date.json');

describe('DateFormatter', function () {
    _.each(dateGroups, function (dateGroup) {
        describe('pattern: ' + dateGroup.datePattern.join(', '), function () {
            var dateFormatter = new DateFormatter(dateGroup.datePattern);

            _.each(dateGroup.date, function (date) {
                it('should convert date ' + date[0] + ' to ' + date[1], function () {
                    dateFormatter.getValidatedDate(date[0]).should.eql(date[1]);
                });
            });
        });
    });
});
