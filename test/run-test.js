'use strict';

var flatten      = require('es5-ext/lib/List/flatten').call
  , createLogger = require('./__playground/logger')
  , assert       = require('../lib/assert2')

  , playground   = __dirname + '/__playground';

module.exports = {
	"Lib evaluation error": function (t, a) {
		var logger = createLogger();
		a.equal(t(playground + '/lib/evaluation-error.js', playground + '/test/evaluation-error.js',
			assert(logger), logger), null);
		a.equal(logger[0].type, 'error');
		a.ok(logger[0].data instanceof Error);
	},
	"No lib file": function (t, a) {
		var logger = createLogger();
		a.equal(t(playground + '/lib/no-file.js', playground + '/test/no-file.js',
			assert(logger), logger), null);
		a.equal(logger[0].type, 'error');
		a.ok(typeof logger[0].data === 'string');
	},
	"Test evaluation error": function (t, a) {
		var logger = createLogger();
		a.equal(t(playground + '/lib/sample.js', playground + '/lib/evaluation-error.js',
			assert(logger), logger), null);
		a.equal(logger[0].type, 'error');
		a.ok(logger[0].data instanceof Error);
	},
	"No test file": function (t, a) {
		var logger = createLogger();
		a.equal(t(playground + '/lib/no-test.js', playground + '/test/no-test.js',
			assert(logger), logger), null);
		a.equal(logger[0].type, 'error');
		a.ok(typeof logger[0].data === 'string');
	},
	"Automated index test": function (t, a, d) {
		var logger = createLogger();
		t(playground + '/lib/index-test/index.js',  playground + '/test/no-test.js',
			assert(logger), logger).then(function () {
				var data = flatten(logger.map(function (log) {
					return [log.type, log.data];
				}));
				a.ok(data.length > 0, "Any tests");
				a.equal(data.indexOf('error'), -1, "No errors");
				a.equal(data.indexOf('fail'), -1, "No fails");
				a.equal(data.indexOf('pass'), 0, "Any Passed");
				d();
			}).end();
	},
	"Generics handled": function (t, a, d) {
		var logger = createLogger();
		t(playground + '/lib/sample.js', playground + '/test/generics-test/test.js',
			assert(logger), logger).then(function () {
				var data = flatten(logger.map(function (log) {
					return [log.type, log.data];
				}));
				a.notEqual(data.length, 0, "Any tests");
				a.notEqual(data.indexOf('First'), -1, "Generics for first");
				a.notEqual(data.indexOf('Second'), -1, "Generics for second");
				d();
			});
	},
	"Succesfull": function (t, a, d) {
		var logger = createLogger();
		t(playground + '/lib/sample.js', playground + '/test/sample.js',
			assert(logger), logger).then(function () {
				a.equal(logger.length, 1, "Tests count");
				a.equal(logger[0].data, "Succesful test", "Test run");
				d();
			});
	}
};
