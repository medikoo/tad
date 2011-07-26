'use strict';

var setup   = require('./setup')
  , console = require('./console');

module.exports = function (paths, options, cb) {
	var s, c;
	if (typeof paths === 'string') {
		paths = arguments;
	}

	s = setup(paths);
	c = console();
	s('data', function (p, fpath, tpath, context) {
		if (fpath instanceof Error) {
			// path not readable
			c.error(fpath);
		} 
	});

	s('end', cb);
};
