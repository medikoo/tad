// Find test path for given lib path
// It may be dir (returns many libpath-testpath pairs)
// or file (one libpath-testpath pair).
// Pass libpath-testpath pairs collection for testing

'use strict';

var path             = require('path')
  , curry            = require('es5-ext/lib/Function/curry')
  , rcurry           = require('es5-ext/lib/Function/rcurry')
  , trim             = require('next/lib/path/trim')

  , getTestPath      = require('./get-test-path')
  , getTestFilenames = require('./get-test-filenames')
  , run              = require('./run-tests');

module.exports = function (testeePath, logger) {
	testeePath = trim(testeePath);
	return getTestPath(testeePath)
		.then(curry(getTestFilenames, testeePath))
		.then(function (paths) {
			logger.context = testeePath + ((paths[0][0] === testeePath) ? '' : '/');
			return paths;
		})
		.then(rcurry(run, logger), logger.error.bind(logger));
};
