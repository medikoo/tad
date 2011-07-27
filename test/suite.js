'use strict';

var pg = __dirname + '/__playground';
module.exports = function (t, a, d) {
	var outorg, errorg, outl = '', errl = '',  console, results = {};
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
