'use strict';

var logger     = require('./__playground/logger')()
  , playground = __dirname + '/__playground';

module.exports = function (t, a, d) {
	t([
		[playground + '/lib/sample.js', playground + '/test/sample.js'],
		[playground + '/lib/sample2.js', playground + '/test/sample2.js']
	], logger).then(function () {
		a.equal(logger.length, 2, "Tests count");
		a.ok(logger.every(function (test) {
			return test.type === 'pass';
		}), "All succesfull");
		d();
	});
};
