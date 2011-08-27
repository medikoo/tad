'use strict';

var fs        = require('fs')

  , a2p       = require('deferred/lib/async-to-promise').call
  , isPromise = require('deferred/lib/is-promise')
  , join      = require('deferred/lib/join/default')

  , oForEach  = require('es5-ext/lib/Object/plain/for-each').call
  , convert   = require('es5-ext/lib/String/convert/dash-to-camel-case')

  , readDir;


readDir = function (dir) {
	var i, o = {};
	if (isPromise(dir)) {
		return dir;
	}
	if (dir.slice(-1) !== '/') {
		dir += '/';
	}
	return a2p(fs.readdir, dir)
		(function (files) {
			return join(files.map(function (f) {
				return a2p(fs.stat, dir + f)
					(function (stats) {
						if (stats.isFile()) {
							if ((f.slice(-3) !== '.js') || (f === 'index.js')
								 || (f[0] === '_')) {
								return;
							}
							f = f.slice(0, -3);
						} else if (!stats.isDirectory()) {
							return;
						}
						o[convert(f)] = dir + f;
					});
			}))(function () {
				return o;
			});
		});
};

module.exports = function (dir) {
	return function (t, a, d) {
		readDir(dir)(function (o) {
			var keys = Object.keys(t);
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
