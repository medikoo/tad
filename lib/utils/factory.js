"use strict";

var isFunction = require("es5-ext/function/is-function")
  , oForEach   = require("es5-ext/object/for-each");

module.exports = function (scopes, tests) {
	var r = {};
	oForEach(scopes, function (scope, typeName) {
		if (isFunction(tests)) {
			r[typeName] = tests.bind(scope);
		} else {
			oForEach(tests, function (test, testName) {
				r[typeName + ": " + testName] = test.bind(scope);
			});
		}
	});

	return r;
};
