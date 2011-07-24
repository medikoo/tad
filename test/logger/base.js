'use strict';

var merge = require('es5-ext/lib/Object/merge').call;

module.exports = function (t, a) {
	t = merge([], t).init();
	t.start('HEAD');
	t.pass('foo');
	t.in('ONE');
	t.fail('bar');
	t.out('two');
	t.error('error');

	a.deepEqual(t.scope, ['HEAD']);
	a.equal(t.length, 3);
	a.deepEqual([t[0].type, t[0].data, t[0].scope.toString()],
		['pass', 'foo', 'HEAD']);
	a.deepEqual([t[1].type, t[1].data, t[1].scope.toString()],
		['fail', 'bar', 'HEAD,ONE']);
	a.deepEqual([t[2].type, t[2].data, t[2].scope.toString()],
		['error', 'error', 'HEAD']);
};
