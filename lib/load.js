// Imports lib and tests from given paths

'use strict';

var path          = require('path')

  , merge         = require('es5-ext/lib/Object/plain/merge').call
  , endsWith      = require('es5-ext/lib/String/ends-with')
  , requireSilent = require('next/lib/require-silent')(require);

module.exports = function (testeePath, testPath, context, withcoverage) {
	var o = {};
	o.testee = requireSilent(testeePath);
	o.test = requireSilent(testPath);

	if (!o.test && endsWith(testeePath, '/index.js')) {
		o.test = require('./utils/index-test')(path.dirname(testeePath));
	}

	if (o.test && o.test.__generic) {
		merge(o.test, require('./utils/factory')
			(require(path.dirname(testPath) + '/__scopes'), o.test.__generic));
		delete o.test.__generic;
	}

	return o;
};
