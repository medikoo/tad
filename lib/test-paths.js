// Iterate paths to lib files
// Pass each for testing

'use strict';

var all     = require('deferred/lib/chain/all')

  , testPath = require('./test-path');

module.exports = function (paths, logger) {
	return all(paths.map(function (p) {
		return testPath(p, logger);
	}));
};
