// Runs tests

'use strict';

var mapToArray = require('es5-ext/lib/Object/map-to-array').call
  , values     = require('es5-ext/lib/Object/plain/values').call
  , oForEach   = require('es5-ext/lib/Object/plain/for-each').call
  , isFunction = require('es5-ext/lib/Function/is-function')
  , saturate   = require('es5-ext/lib/Function/saturate')
  , hold       = require('es5-ext/lib/Function/hold')
  , noop       = require('es5-ext/lib/Function/noop')
  , deferred   = require('deferred/lib/deferred')
  , promise    = require('deferred/lib/promise')
  , all        = require('deferred/lib/chain/all')

  , createLogger = require('./logger')
  , createAssert = require('./assert')

  , pattern = /^\s*function\s*\(\s*([tad])(?:\s*,\s*([tad]))?\s*\)/;

var run = function (testee, tests, assert, logger) {
	if (isFunction(tests)) {
		tests = {"": tests};
	}

	values(tests).forEach(function (t) {
		var conf, match;
		if (isFunction(t)) {
			conf = t.conf = { t: true, a: true, d: false};
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

	return promise()(saturate(all, mapToArray(tests, hold(function (f, name) {
		var o, d, finish, done;
		d = deferred();
		finish = function () {
			logger.out();
			d.resolve();
		};
		logger.in(name);
		if (isFunction(f)) {
			try {
				if (f.conf.d) {
					done = function (o) {
						if (o) {
							if (o instanceof Error) {
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
		} else {
			run(testee, f, assert, logger)(finish).end();
		}
		return d.promise;
	}))))(noop);
};

module.exports = function (testee, test, assert, logger) {
	var r;
	logger = logger || createLogger();
	assert = assert || createAssert(logger);
	r = run(testee, test, assert, logger);
	if (logger.end) {
		r = r(logger.end.bind(logger));
	}
	r.end();

	return logger;
};
