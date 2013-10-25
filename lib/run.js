// Runs tests

'use strict';

var isError      = require('es5-ext/lib/Error/is-error')
  , isFunction   = require('es5-ext/lib/Function/is-function')
  , noop         = require('es5-ext/lib/Function/noop')
  , mapToArray   = require('es5-ext/lib/Object/map-to-array')
  , hforEach     = require('es5-ext/lib/Object/for-each')
  , deferred     = require('deferred')
  , createLogger = require('./logger')
  , createAssert = require('./assert')

  , nextTick   = process.nextTick
  , pattern = /^\s*function\s*\(\s*([tad])(?:\s*,\s*([tad]))?\s*\)/
  , run;

run = function run(testee, tests, assert, logger) {
	if (isFunction(tests)) {
		tests = { "": tests };
	}

	hforEach(tests, function (t) {
		var conf, match;
		if (isFunction(t)) {
			conf = t.conf = { t: true, a: true, d: false };
			if (t.length > 2) {
				conf.d = true;
			} else if ((match = t.toString().match(pattern))) {
				conf.t = conf.a = false;
				conf[match[1]] = true;
				if (match[2]) {
					conf[match[2]] = true;
				}
			}
		}
	});

	return deferred.reduce(mapToArray(tests), function (ignore, data) {
		var o, d, finish, done, name, f;
		name = data[0];
		f = data[1];
		d = deferred();
		finish = function () {
			logger.out(true);
			d.resolve();
		};
		logger.in(name, true);
		if (isFunction(f)) {
			try {
				if (f.conf.d) {
					done = function (o) {
						if (o) {
							if (isError(o)) {
								assert.fail(o);
								finish();
							} else {
								run(testee, o, assert, logger)(finish).end();
							}
						} else {
							finish();
						}
					};
					if (f.conf.t) {
						if (f.conf.a) {
							f(testee, assert, done);
						} else {
							f(testee, done);
						}
					} else if (f.conf.a) {
						f(assert, done);
					} else {
						f(done);
					}
				} else {
					if (f.conf.t) {
						o = f(testee, assert);
					} else {
						o = f(assert);
					}
					if (o) {
						run(testee, o, assert, logger)(finish).end();
					} else {
						finish();
					}
				}
			} catch (e) {
				logger.error(e);
				finish();
			}
		} else if (f == null) {
			assert.fail(new Error("No tests found at '" + name + "' property"));
			finish();
		} else {
			run(testee, f, assert, logger)(finish).end();
		}
		return d.promise;
	}, null)(noop);
};

module.exports = function (testee, test, assert, logger) {
	var r;
	logger = logger || createLogger();
	assert = assert || createAssert(logger);
	nextTick(function () {
		r = run(testee, test, assert, logger);
		if (logger.end) {
			r = r(logger.end.bind(logger));
		}
		r.end();
	});
	return logger;
};
