'use strict';

var isFunction = require('es5-ext/lib/Function/is-function')
  , oForEach   = require('es5-ext/lib/Object/prototype/for-each');

module.exports = function (scopes, tests) {
	var r = {};
	oForEach.call(scopes, function (scope, typeName) {
		if (isFunction(tests)) {
			r[typeName] = tests.bind(scope);
		} else {
			oForEach.call(tests, function (test, testName) {
				r[typeName + ": " + testName] = test.bind(scope);
			});
		}
	});

	return r;
};
