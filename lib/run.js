// Runs tests

'use strict';

var mapToArray = require('es5-ext/lib/Object/map-to-array').call
  , values     = require('es5-ext/lib/Object/plain/values').call
  , isFunction = require('es5-ext/lib/Function/is-function')
  , xcurry     = require('es5-ext/lib/Function/xcurry')
  , deferred   = require('deferred/lib/deferred')
  , all        = require('deferred/lib/chain/all');

var run = function (testee, tests, assert, logger) {
	return all(mapToArray(tests, xcurry(function (f, name) {
		var o, d, finish;
		d = deferred();
		finish = function () {
			logger.out();
			d.resolve();
		};
		logger.ind(name);
		if (isFunction(f)) {
			try {
				if (f.async) {
					f(testee, assert, function (o) {
						if (o) {
							run(testee, o, assert, logger).then(finish).end();
						} else {
							finish();
						}
					});
				} else if ((o = f(testee, assert))) {
					run(testee, o, assert, logger).then(finish).end();
				} else {
					finish();
				}
			} catch (e) {
				logger.error(e);
				finish();
			}
		} else {
			run(testee, f, assert, logger)(finish).end();
		}
		return d.promise;
	}, 2)));
};

module.exports = function (testee, test) {
	var logger, assert;
	logger = createLogger();
	assert = createAssert(logger);
	run(testee, test, assert, logger)
	(logger.end.bind(logger)).end();

	return logger;
};