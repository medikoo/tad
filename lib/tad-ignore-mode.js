"use strict";

var findRoot = require("next/module/find-package-root")
  , resolve  = require("path").resolve;

var isRoot;

require("fs2/lib/ignore-modes").tad = module.exports = {
	filename: ".testignore",
	isRoot: isRoot = function (path) {
		var promise = findRoot(resolve(path, "_find-that-root_"))(function (root) {
			return root === path;
		});
		promise.path = path;
		return promise;
	},
	isRootWatcher: isRoot
};
isRoot.returnsPromise = true;
