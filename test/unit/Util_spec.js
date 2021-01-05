var _ = require('underscore');
var Util = require('../../src/utils/Util');
var json = require('../fixtures/util.json');
var DateFormatter = require('../../src/shortcuts/DateFormatter');
var TimeFormatter = require('../../src/shortcuts/TimeFormatter');

describe('Util', function () {
    describe('stripDelimiters:', function () {
        _.each(json.stripDelimiters, function (data) {
            var params = data.params;
            it('should strip delimiter for: ' + params[0] + ' to: ' + data.expected, function () {
                Util.stripDelimiters(params[0], params[1], params[2]).should.eql(data.expected);
            });
        });
    });

    describe('getFormattedValue:', function () {
        _.each(json.getFormattedValue, function (data) {
            var params = data.params;
            it('should get formatted value for: ' + params[0] + ' as: ' + data.expected, function () {
                Util.getFormattedValue(params[0], params[1], params[2], params[3], params[4], params[5]).should.eql(data.expected);
            });
        });
    });

    describe('getPrefixStrippedValue:', function () {
        _.each(json.getPrefixStrippedValue, function (data) {
            var params = data.params;
            it('should get prefix stripped value for: ' + params[0] + ' as: ' + data.expected, function () {
                Util.getPrefixStrippedValue(params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7], params[8]).should.eql(data.expected);
            });
        });
    });

    describe('getDateTimeValue:', function () {
        _.each(json.getDateTimeValue, function (data) {

            var params = data.params;
            var value = params[0];
            var dateFormatter = new DateFormatter(params[1], '', '');
            var timeFormatter = new TimeFormatter(params[2], 24);
            var delimiters = params[3];

            it('should get datetime value for: ' + params[0] + ' as: ' + data.expected, function () {
                Util.getDateTimeValue(value, dateFormatter, timeFormatter, delimiters).should.eql(data.expected);
            });
        });
    });
});
