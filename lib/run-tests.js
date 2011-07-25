// Iterate libpath-testpath pairs collection
// Run tests for each

'use strict';

var bapply       = require('es5-ext/lib/Function/bind-apply-args')
  , saturate     = require('es5-ext/lib/Function/saturate')
  , all          = require('deferred/lib/chain/all')

  , createAssert = require('./assert')
  , runTest      = require('./run-test');

module.exports = function (pairs, logger) {
	var assert = createAssert(logger);

	return all(pairs.map(bapply(function (testee, test) {
		return saturate(runTest, testee, test, assert, logger);
	})));
};
