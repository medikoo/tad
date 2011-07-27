// Imports lib and tests from given paths
// Runs tests

'use strict';

var path          = require('path')

  , merge         = require('es5-ext/lib/Object/plain/merge').call
  , endsWith      = require('es5-ext/lib/String/ends-with')
  , trimSame      = require('es5-ext/lib/String/trim-same-left')
  , trimLeft      = require('es5-ext/lib/String/trim-str-left').call
  , trimRight     = require('es5-ext/lib/String/trim-str-right').call
  , requireSilent = require('next/lib/require-silent')(require)

  , runSubtest    = require('./run-subtest');

module.exports = function (testeePath, testPath, context, withcoverage) {
	var o = {};
	o.testee = requireSilent(testeePath);
	o.test = requireSilent(testPath);

	if (!o.test && endsWith(testeePath, '/index.js')) {
		o.test = require('./utils/index-test')(path.dirname(testeePath));
	}

	if (o.test) {
		if (isFunction(o.test)) {
			o.test = {"": o.test};
		}

		if (o.test.__generic) {
			merge(o.test, require('./utils/factory')
				(require(path.dirname(testPath) + '/__scopes'), test.__generic));
			delete o.test.__generic;
		}

		// Workaround for http://code.google.com/p/v8/issues/detail?id=1419
		values(o.test).forEach(function (t) {
			if (t.length > 2) {
				t.async = true;
			} else if (t.length === 1) {
				t.oneArg = true;
			}
		});
	}
	return o;
};
