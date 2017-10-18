"use strict";

var isFunction = require("es5-ext/function/is-function")
  , oForEach   = require("es5-ext/object/for-each");

module.exports = function (scopes, tests) {
	var result = {};
	oForEach(scopes, function (scope, typeName) {
		if (isFunction(tests)) {
			result[typeName] = tests.bind(scope);
		} else {
			oForEach(tests, function (test, testName) {
				result[typeName + ": " + testName] = test.bind(scope);
			});
		}
	});

	return result;
};
