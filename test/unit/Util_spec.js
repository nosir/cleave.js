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
});
