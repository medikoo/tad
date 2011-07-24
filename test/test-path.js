'use strict';

var createLogger = require('./__playground/logger')
  , playground   = __dirname + '/__playground';

module.exports = {
	"Run": function (t, a, d) {
		var logger = createLogger();
		t(playground + '/lib/sample.js', logger).then(function () {
			a.equal(logger.length, 1, "Tests count");
			a.ok(logger.every(function (test) {
				return test.type === 'pass';
			}), "All succesfull");
			d();
		}).end();
	},
	"Error": function (t, a, d) {
		var logger = createLogger();
		t('/blah.js', logger).then(function () {
			a.equal(logger.length, 1, "2Tests count");
			a.equal(logger[0].type, 'error', "2Test type");
			d();
		}).end();
	}
};
