'use strict';

var setup = require('./setup');

module.exports = function (paths, options, cb) {
	var s;
	if (typeof paths === 'string') {
		paths = arguments;
	}

	s = setup(paths);
	s('data', function (p, fpath, tpath, context) {
		
	});

	s('end', cb);
};