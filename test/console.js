'use strict';

var AssertionError = require('test/assert').AssertionError
  , oForEach = require('es5-ext/lib/Object/plain/for-each').call;

module.exports = function (t, a) {
	var outorg, errorg, outl = '', errl = '',  console, results = {};
	outorg = process.stdout._writeOut;
	errorg = process.stderr._writeOut;
	process.stdout._writeOut = function (data) {
		outl += data;
	};
	process.stderr._writeOut = function (data) {
		errl += data;
	};

	console = t({});

	console.pass('foo', 'bar');
	results['Pass content'] = [outl.length > 0];
	results['Pass lines'] = [outl.split('\n').length, 1];
	outl = '';

	console.pass('foo', 'bar');
	results['Second Pass content'] = [outl.length > 0];
	results['Second Pass lines'] = [outl.split('\n').length, 1];
	outl = '';

	console.fail('foo', 'bar', new AssertionError({
		message: 'foo',
		actual: 'foo',
		expected: 'foo',
		operator: 'foo'
	}));
	results['Fail content'] = [outl.length > 0];
	results['Fail lines'] = [outl.split('\n').length, 6];
	outl = '';

	console.error('foo', 'bar', new Error('foo'));
	results['Error content'] = [outl.length > 0];
	results['Error lines'] = [outl.split('\n').length > 4];
	outl = '';

	console.fail('foo', 'bar', new Error('foo'));
	results['Fail error  content'] = [outl.length > 0];
	results['Fail error  lines'] = [outl.split('\n').length > 4];
	outl = '';

	console.fail('foo', 'bar', new AssertionError({
		message: 'foo',
		operator: 'throws'
	}));
	results['Fail throws content'] = [outl.length > 0];
	results['Fail throws lines'] = [outl.split('\n').length, 3];
	outl = '';

	console.end();
	results['Summary content'] = [outl.length > 0];
	results['Summary length'] = [outl.split('\n').length, 4];
	outl = '';

	results['No errors stdout'] = [errl.length, 0];
	errl = '';

	console = t({ a: true });
	console.pass('foo', 'bar');
	results['Show all Pass content'] = [outl.length > 0];
	results['Show all Pass lines'] = [outl.split('\n').length, 2];
	outl = '';

	console.pass('foo', 'bar');
	results['Show all second Pass content'] = [outl.length > 0];
	results['Show all second Pass lines'] = [outl.split('\n').length, 2];
	outl = '';

	console.end();

	results['Show all no errors stdout'] = [errl.length, 0];
	errl = '';

	process.stdout._writeOut = outorg;
	process.stderr._writeOut = errorg;

	oForEach(results, function (r, name) {
		if (r.length === 1) {
			a.ok(r[0], name);
		} else {
			a(r[0], r[1], name);
		}
	});
};
