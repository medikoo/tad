'use strict';

var path          = require('path')
  , isFunction    = require('es5-ext/lib/Function/is-function')
  , ba2p          = require('deferred/lib/async-to-promise').bind
  , findRoot      = ba2p(require('next/lib/get-package-root'))
  , requireSilent = require('next/lib/require-silent')(require);

module.exports = function (lpath, tpath) {
	tpath = path.dirname(tpath);
	return findRoot(tpath)
	(function (root) {
		var c;
		while (true) {
			c = requireSilent(tpath + '/__tad.js');
			if (c) {
				if (c instanceof Error) {
					return c;
				} else if (c.context) {
					if (isFunction(c.context)) {
						return c.context(lpath);
					} else {
						return c.context;
					}
				}
			}
			if (tpath === root) {
				return global;
			}
			tpath = path.dirname(tpath);
		}
	});
};
