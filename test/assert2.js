'use strict';

var logger = require('./__playground/logger')();

module.exports = function (t, a) {
	t = t(logger);
	t(true, true, 'foo');
	t.ok(false, 'bar');

	return {
		"Pass": function (t, a) {
			a.deepEqual([logger[0].type, logger[0].data], ['pass', 'foo']);
		},
		"Fail": function (t, a) {
			a.deepEqual([logger[1].type, logger[1].data.message], ['fail', 'bar']);
		}
	};
};
