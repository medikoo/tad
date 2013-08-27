'use strict';

var CustomError = require('es5-ext/error/custom')
  , logger      = require('../lib/logger')();

module.exports = function (t, a) {
	t = t(logger);
	t(true, true, 'foo');
	t.ok(false, 'bar');
	t.not(false, true, 'not');
	t.deep([1, 2], [1, 2], 'deep');
	t.notDeep([1, 2], [2, 1], 'not deep');
	t.throws(function () { throw new CustomError('Test', 'TEST'); }, 'TEST',
		'throws');

	a.deep([logger[0].type, logger[0].data], ['pass', 'foo']);
	a.deep([logger[1].type, logger[1].data.message], ['fail', 'bar']);
	a.deep([logger[2].type, logger[2].data], ['pass', 'not'], "'not' support");
	a.deep([logger[3].type, logger[3].data], ['pass', 'deep'], "'deep' support");
	a.deep([logger[4].type, logger[4].data], ['pass', 'not deep'],
		"'not deep' support");
	a.deep([logger[5].type, logger[5].data], ['pass', 'throws'],
		"custom trhows support");
};
