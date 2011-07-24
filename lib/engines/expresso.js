'use strict';

var testAssert   = require('assert')
  , curry        = require('es5-ext/lib/Function/curry')
  , noop         = require('es5-ext/lib/Function/noop')
  , oForEach     = require('es5-ext/lib/Object/plain/for-each').call

  , createAssert = require('../lib/assert')
  , loadTests    = require('../lib/load-tests')
  , setupTests   = require('../lib/setup-tests');

var tests = module.exports = {};

loadTests(SETS).forEach(function (sets) {
	console.log("Test " + sets.name);
	sets.sets.forEach(function (set) {
		var testee = require(set.target);

		var forEachTest = function (setname, test, name) {
			var assert, r;
			name = setname + (name ? ": " + name : "");
			assert = createAssert(testAssert, name);
			tests[name] = test.async ?
				function (done) {
					test(testee, assert, curry(done, noop));
				} :
			function () {
				test(testee, assert);
			};

			if (!test.async) {
				r = test(testee, assert);
				if (r) {
					oForEach(setupTests(r), curry(forEachTest, name));
				}
			}
		};
		oForEach(set.tests, curry(forEachTest, set.name));
	});
});
