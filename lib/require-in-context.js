// Require module in given context

"use strict";

var validValue            = require("es5-ext/object/valid-value")
  , Module                = require("module")
  , readFileSync          = require("fs").readFileSync
  , path                  = require("path")
  , vm                    = require("vm")
  , memoize               = require("memoizee")
  , isModuleNotFoundError = require("ncjsm/is-module-not-found-error");

var dirname = path.dirname
  , extname = path.extname
  , objHasOwnProperty = Object.prototype.hasOwnProperty
  , natives = process.binding("natives")
  , wrap = Module.wrap;

var get = memoize(function (modulePath) { return new Module(modulePath, module); }, { length: 2 });

module.exports = exports = function (modulePath, context/*, options*/) {
	var options = arguments[2] || {};
	var fmodule, content, dirpath;

	validValue(context);
	if (context === global) {
		try {
			return require(modulePath);
		} catch (error) {
			if (options.isSilent && isModuleNotFoundError(error, modulePath)) return null;
			throw error;
		}
	}
	if (objHasOwnProperty.call(natives, modulePath)) return require(modulePath);
	fmodule = get(modulePath, context);
	if (fmodule.loaded) return fmodule.exports;
	fmodule.filename = modulePath;
	dirpath = dirname(modulePath);
	fmodule.paths = Module._nodeModulePaths(dirpath);
	fmodule.require = function (targetPath) {
		return exports(Module._resolveFilename(String(targetPath), this), context);
	};
	try {
		content = readFileSync(modulePath, "utf8");
	} catch (e) {
		if (e.code === "ENOENT") {
			if (options.isSilent) return null;
			throw new Error("Cannot find module '" + modulePath + "'");
		}
		throw e;
	}
	fmodule.loaded = true;
	if (extname(modulePath) === ".json") {
		fmodule.exports = JSON.parse(content);
	} else {
		vm.runInContext(wrap(content), context, modulePath).call(
			fmodule.exports, fmodule.exports, fmodule.require.bind(fmodule), fmodule, modulePath,
			dirpath
		);
	}
	return fmodule.exports;
};
