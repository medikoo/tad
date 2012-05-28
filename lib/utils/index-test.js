'use strict';

var fs        = require('fs')
  , normalize = require('path').normalize
  , curry     = require('es5-ext/lib/Function/prototype/curry')
  , contains  = curry.call(require('es5-ext/lib/Array/prototype/contains'))
  , noop      = require('es5-ext/lib/Function/noop')
  , not       = require('es5-ext/lib/Function/prototype/not')
  , oForEach  = require('es5-ext/lib/Object/for-each')
  , convert   = require('es5-ext/lib/String/prototype/dash-to-camel-case')
  , a2p       = require('deferred').promisify
  , isPromise = require('deferred/lib/is-promise')

  , readDir;

readDir = function (dir) {
	var i, o = {};
	if (isPromise(dir)) {
		return dir;
	}
	dir = normalize(dir);
	return a2p(fs.readdir)(dir).map(function (f) {
		return a2p(fs.stat)(dir + '/' + f)(function (stats) {
			if (stats.isFile()) {
				if ((f.slice(-3) !== '.js') || (f === 'index.js')
						|| (f[0] === '_')) {
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
			var keys = Object.keys(t);
			if (ignores) {
				keys = keys.filter(not.call(contains), ignores);
			}
			oForEach(o, function (path, f) {
				var i, fc;
				if ((i = keys.indexOf(f)) === -1) {
					fc = f.charAt(0).toUpperCase() + f.slice(1);
					if ((i = keys.indexOf(fc)) === -1) {
						a.ok(false, f + " - is present ?");
					} else {
						a.ok(true, (f = fc) + " - is present ?");
					}
				} else {
					a.ok(true, f + " - is present ?");
				}
				if (i !== -1) {
					keys.splice(i, 1);
					a(t[f], require(path), f + " - points its module ?");
				}
			});
			a.ok(keys.length === 0, "[" + keys.toString() + "] - no extras found ?");
			d();
		}).end();
	};
};

module.exports.readDir = readDir;
