"use strict";

var path     = require("path")
  , findRoot = require("next/module/find-package-root");

var resolve = path.resolve, sep = path.sep;

module.exports = function (tpath) {
	return findRoot(tpath)(function (projectPath) {
		var e;
		tpath = tpath.slice(projectPath.length + 1).split(sep);
		if (tpath[0] === "test") {
			e = new Error("Input seems to be a test file");
			e.type = "testfile";
			throw e;
		}
		return resolve(projectPath, "test" + sep + tpath.join(sep));
	});
};
