'use strict';

var path       = require('path')

  , isFunction = require('es5-ext/lib/Function/is-function')
  , values     = require('es5-ext/lib/Object/plain/values').call;

module.exports = function (tests) {
	if (isFunction(tests)) {
		tests = {"": tests};
	}

	// Workaround for http://code.google.com/p/v8/issues/detail?id=1419
	values(tests).forEach(function (test) {
		if (test.length > 2) {
			test.async = true;
		} else if (test.length === 1) {
			test.oneArg = true;
		}
	});

	return tests;
};
