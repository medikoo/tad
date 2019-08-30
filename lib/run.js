/* eslint max-lines: "off" */

// Runs tests

"use strict";

var isError      = require("es5-ext/error/is-error")
  , isFunction   = require("es5-ext/function/is-function")
  , noop         = require("es5-ext/function/noop")
  , toArray      = require("es5-ext/object/to-array")
  , hforEach     = require("es5-ext/object/for-each")
  , isValue      = require("es5-ext/object/is-value")
  , isThenable   = require("es5-ext/object/is-thenable")
  , deferred     = require("deferred")
  , createLogger = require("./logger")
  , createAssert = require("./assert");

var nextTick = process.nextTick
  , pattern = /^\s*function\s*\(\s*([tad])(?:\s*,\s*([tad]))?\s*\)/
  , run;

run = function self(testee, tests, assert, logger) {
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

	return deferred.reduce(
		toArray(tests),
		// eslint-disable-next-line max-statements
		function (ignore, data) {
			var testResult, d, finish, done, name, testFunction;
			name = data[0];
			testFunction = data[1];
			d = deferred();
			finish = function () {
				logger.out(true);
				d.resolve();
			};
			logger.in(name, true);
			if (isFunction(testFunction)) {
				try {
					if (testFunction.conf.d) {
						done = function (asyncTestResult) {
							if (asyncTestResult) {
								if (isError(asyncTestResult)) {
									assert.fail(asyncTestResult);
									finish();
								} else {
									self(testee, asyncTestResult, assert, logger)(finish).done();
								}
							} else {
								finish();
							}
						};
						if (testFunction.conf.t) {
							// eslint-disable-next-line max-depth
							if (testFunction.conf.a) {
								testFunction(testee, assert, done);
							} else {
								testFunction(testee, done);
							}
						} else if (testFunction.conf.a) {
							testFunction(assert, done);
						} else {
							testFunction(done);
						}
					} else {
						if (testFunction.conf.t) {
							testResult = testFunction(testee, assert);
						} else {
							testResult = testFunction(assert);
						}
						if (isThenable(testResult)) {
							testResult.then(
								function (thenableTestResult) {
									if (thenableTestResult) {
										self(testee, thenableTestResult, assert, logger)(
											finish
										).done();
									} else {
										finish();
									}
								},
								function (error) {
									assert.fail(error);
									finish();
								}
							);
						} else if (testResult) {
							self(testee, testResult, assert, logger)(finish).done();
						} else {
							finish();
						}
					}
				} catch (e) {
					logger.error(e);
					finish();
				}
			} else if (isValue(testFunction)) {
				self(testee, testFunction, assert, logger)(finish).done();
			} else {
				assert.fail(new Error("No tests found at '" + name + "' property"));
				finish();
			}
			return d.promise;
		},
		null
	)(noop);
};

module.exports = function (testee, test, assert, logger) {
	var runResult;
	logger = logger || createLogger();
	assert = assert || createAssert(logger);
	nextTick(function () {
		runResult = run(testee, test, assert, logger);
		if (logger.end) {
			runResult = runResult(logger.end.bind(logger));
		}
		runResult.done();
	});
	return logger;
};
