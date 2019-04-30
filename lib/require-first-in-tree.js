"use strict";

var path                  = require("path")
  , isModuleNotFoundError = require("ncjsm/is-module-not-found-error");

var dirname = path.dirname, sep = path.sep;

module.exports = function (modulePath, currentPath, topPath) {
	while (currentPath !== topPath) {
		var currentModulePath = currentPath + sep + modulePath;
		try {
			return require(currentModulePath);
		} catch (error) {
			if (!isModuleNotFoundError(error, currentModulePath)) throw error;
		}
		currentPath = dirname(currentPath);
	}
	return null;
};
