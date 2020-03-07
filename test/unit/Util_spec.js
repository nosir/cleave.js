var _ = require('underscore');
var Util = require('../../src/utils/Util');
var json = require('../fixtures/util.json');

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
});
