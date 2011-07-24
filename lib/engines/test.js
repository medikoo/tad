'use strict';

var engine       = require('test/engines/common/test')
  , Log          = require('test/log').Log

  , curry        = require('es5-ext/lib/Function/curry')
  , bindMethods  = require('es5-ext/lib/Object/bind-methods').call
  , oForEach     = require('es5-ext/lib/Object/plain/for-each').call
  , deferred     = require('deferred/lib')

  , createAssert = require('../assert')
  , setupTests   = require('../setup-tests')

  , ifError, log = Log();

bindMethods(log, log, Log.prototype);

ifError = function (err) {
	if (err) {
		this.fail(err);
	} else {
		this.ok(true);
	}
};

module.exports = function (sets) {
	var o, inProgress, allStarted, done, allDone, eDone, d = deferred();

	done = function () {
		if (!--inProgress && allStarted) {
			allDone();
		}
	};

	allDone = function () {
		eDone();
		d.resolve();
	};

	o = {}; o['test ' + sets.name] = function (testAssert, testDone) {
		testAssert.ifError = ifError;
		inProgress = 0;
		eDone = testDone;
		sets.sets.forEach(function (set) {
			var testee = require(set.target.slice(0, -3));

			var forEachTest = function (setname, test, name) {
				var assert, r;
				name = setname + (name ? ": " + name : "");
				assert = createAssert(testAssert, name);
				if (test.async) {
					++inProgress;
					r = test(testee, assert, done);
				} else {
					r = test(testee, assert);
				}
				if (r) {
					oForEach(setupTests(r), curry(forEachTest, name));
				}
			};
			oForEach(set.tests, curry(forEachTest, set.name));
		});
		allStarted = true;
		if (!inProgress) {
			allDone();
		}
	};
	//o.mute = true;
	engine.run(o, function (suite) {
		// suite = suite.units[0];
		// log.print(suite.name);
		// suite.passes.forEach(log.pass);
		// suite.fails.forEach(log.fail);
		// suite.errors.forEach(log.error);
		// log.print('');
	});

	return d.promise;
};
