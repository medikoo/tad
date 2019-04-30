"use strict";

var isFunction    = require("es5-ext/function/is-function")
  , path          = require("path")
  , createContext = require("vm").createContext
  , findRoot      = require("next/module/find-package-root")
  , requireFirst  = require("./require-first-in-tree");

module.exports = function (lpath, tpath) {
	tpath = path.dirname(tpath);
	return findRoot(tpath)(function (projectPath) {
		var context = requireFirst("__tad", tpath, projectPath);
		if (context) {
			if (context instanceof Error) throw context;
			if (context.context) {
				context = context.context;
				if (isFunction(context)) context = context(lpath);
				context.console = console;
				return createContext(context);
			}
		}
		return global;
	});
};
