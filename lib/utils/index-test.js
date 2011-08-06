'use strict';

var fs        = require('fs')

  , a2p       = require('deferred/lib/async-to-promise').call
  , isPromise = require('deferred/lib/is-promise')
  , join      = require('deferred/lib/chain/join')

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
				var fc;
				return a2p(fs.stat, dir + f)
					(function (stats) {
						if (stats.isFile()) {
							if ((f.slice(-3) !== '.js') || (f === 'index.js')) {
								return;
							}
							f = f.slice(0, -3);
						} else if (!stats.isDirectory()) {
							return;
						}
						o[convert(f)] = true;
					});
			})).then(function () {
				return o;
			});
		});
};

module.exports = function (dir) {
	return function (t, a, d) {
		readDir(dir)(function (o) {
			var keys = Object.keys(t);
			Object.keys(o).forEach(function (f) {
				var i, fc;
				if ((i = keys.indexOf(f)) === -1) {
					fc = f.charAt(0).toUpperCase() + f.slice(1);
					if ((i = keys.indexOf(fc)) === -1) {
						a.ok(false, f + " - present");
					} else {
						a.ok(true, fc + " - present");
					}
				} else {
					a.ok(true, f + " - present");
				}
				if (i !== -1) {
					keys.splice(i, 1);
				}
			});
			a.ok(keys.length === 0, "[" + keys.toString() + "] - no extras");
			d();
		}).end();
	};
};

module.exports.readDir = readDir;
