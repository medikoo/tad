'use strict';

var isFunction    = require('es5-ext/lib/Function/is-function')
  , path          = require('path')
  , createContext = require('vm').createContext
  , findRoot      = require('next/lib/module/find-package-root')
  , requireFirst  = require('next/lib/module/require-silent')(
	require('next/lib/module/require-first-in-tree')
);

module.exports = function (lpath, tpath) {
	tpath = path.dirname(tpath);
	return findRoot(tpath)(function (root) {
		var c = requireFirst('__tad', tpath, root);
		if (c) {
			if (c instanceof Error) {
				return c;
			} else if (c.context) {
				c = c.context;
				if (isFunction(c)) {
					c = c(lpath);
				}
				c.console = console;
				return createContext(c);
			}
		}
		return global;
	});
};
