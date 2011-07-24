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

module.exports = function (testeePath, testPath, assert, logger) {
	var testee = requireSilent(testeePath)
	  , test = requireSilent(testPath)
	  , time = new Date;

	logger.start(testeePath);

	// Handle evaluation errors
	if (testee instanceof Error) {
		logger.error(testee);
		logger.end();
		return null;
	} else if (test instanceof Error) {
		logger.error(test);
		logger.end();
		return null;
	}

	// Handle missing file errors
	if (!testee) {
		logger.error("Could not find '" + testeePath + "'.");
		logger.end();
		return null;
	} else if (!test) {
		if (endsWith(testeePath, '/index.js')) {
			test = require('./utils/index-test')(path.dirname(testeePath));
		} else {
			logger.error("Not found tests for '"
				+ testeePath + "'. Tried '" + testPath + "'.");
			logger.end();
			return null;
		}
	}

	if (test.__generic) {
		merge(test, require('./utils/factory')
			(require(path.dirname(testPath) + '/__scopes'), test.__generic));
		delete test.__generic;
	}

	return runSubtest(testee, test, assert, logger).then(logger.end.bind(logger));
};
