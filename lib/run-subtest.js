// Runs tests

'use strict';

var mapToArray = require('es5-ext/lib/Object/map-to-array').call
  , values     = require('es5-ext/lib/Object/plain/values').call
  , isFunction = require('es5-ext/lib/Function/is-function')
  , xcurry     = require('es5-ext/lib/Function/xcurry')
  , deferred   = require('deferred/lib/deferred')
  , all        = require('deferred/lib/chain/all');

module.exports = function run (testee, tests, assert, logger) {
	if (isFunction(tests)) {
		tests = {"": tests};
	}

	// Workaround for http://code.google.com/p/v8/issues/detail?id=1419
	values(tests).forEach(function (t) {
		if (t.length > 2) {
			t.async = true;
		} else if (t.length === 1) {
			t.oneArg = true;
		}
	});

	return all(mapToArray(tests, xcurry(function (f, name) {
		var o, d, finish;
		d = deferred();
		finish = function () {
			logger.out();
			d.resolve();
		};
		logger.in(name);
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
			run(testee, f, assert, logger).then(finish);
		}
		return d.promise;
	}, 2)));
};
