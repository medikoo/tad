'use strict';

var curry     = require('es5-ext/lib/Function/prototype/curry')
  , contains  = curry.call(require('es5-ext/lib/Array/prototype/contains'))
  , noop      = require('es5-ext/lib/Function/noop')
  , not       = require('es5-ext/lib/Function/prototype/not')
  , oForEach  = require('es5-ext/lib/Object/for-each')
  , convert   = require('es5-ext/lib/String/prototype/hyphen-to-camel')
  , a2p       = require('deferred').promisify
  , isPromise = require('deferred/lib/is-promise')
  , fs        = require('fs')
  , normalize = require('path').normalize

  , readDir;

readDir = function (dir) {
	var o = {};
	if (isPromise(dir)) {
		return dir;
	}
	dir = normalize(dir);
	return a2p(fs.readdir)(dir).map(function (f) {
		if (f[0] === '_') return;
		if (f[0] === '.') return;
		if (f === 'node_modules') return;
		if (f === 'test') return;
		return a2p(fs.stat)(dir + '/' + f)(function (stats) {
			if (stats.isFile()) {
				if ((f.slice(-3) !== '.js') || (f === 'index.js')) {
					return;
				}
				f = f.slice(0, -3);
			} else if (!stats.isDirectory()) {
				return;
			}
			o[convert.call(f)] = normalize(dir + '/' + f);
		}, noop);
	})(o);
};

module.exports = function (dir, ignores) {
	return function (t, a, d) {
		readDir(dir)(function (o) {
			var keys = Object.keys(t), keysLc;
			if (ignores) {
				keys = keys.filter(not.call(contains), ignores);
			}
			keysLc = keys.map(function (name) { return name.toLowerCase(); });
			oForEach(o, function (path, f) {
				var i;
				if ((i = keysLc.indexOf(f.toLowerCase())) === -1) {
					a.ok(false, f + " - is present ?");
				} else {
					a.ok(true, f + " - is present ?");
				}
				if (i !== -1) {
					a(t[keys[i]], require(path), f + " - points its module ?");
					keys.splice(i, 1);
					keysLc.splice(i, 1);
				}
			});
			a.ok(keys.length === 0, "[" + keys.toString() + "] - no extras found ?");
			d();
		}).end();
	};
};

module.exports.readDir = readDir;
