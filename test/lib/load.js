'use strict';

var resolve = require('path').resolve

  , pg = resolve(__dirname, '../__playground');

module.exports = function (t, a) {
	var o = t(pg + '/lib/evaluation-error.js', pg + '/not/existing/path', global);
	a.ok(o.testee instanceof Error, "Evaluation error");
	a(o.test, undefined, "Not found");

	o = t(resolve(pg, 'lib/index-test/index.js'),
		resolve(pg, 'not/existing/path'), global);
	a(typeof o.test, 'function', "Automatic index test");

	o = t(pg + '/lib/module.js', pg + '/test/generics-test/test.js', global);
	a(typeof o.test.__generic, 'undefined', "Generics test");
};
