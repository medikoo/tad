'use strict';

var pg = __dirname + '/__playground'
  , n4 = (process.version.indexOf('v0.4') === 0);

module.exports = function (t, a, d) {
	if (!n4) {
		d();
		return;
	}
	var outorg, errorg, outl = '', errl = '';
	outorg = process.stdout._writeOut;
	errorg = process.stderr._writeOut;
	process.stdout._writeOut = function (data) {
		outl += data;
	};
	process.stderr._writeOut = function (data) {
		errl += data;
	};

	t([
		'/wrong/path',
		pg + '/lib/context-error/module.js',
		pg + '/lib/evaluation-error.js',
		pg + '/lib/test-evaluation-error.js',
		pg + '/lib/no-tests.js',
		pg + '/lib/module.js'
	])(function () {
		process.stdout._writeOut = outorg;
		process.stderr._writeOut = errorg;
		a.ok(true);
		d();
	}, function (err) {
		process.stdout._writeOut = outorg;
		process.stderr._writeOut = errorg;
		d(err);
	}).end();
};
