// Imports lib and tests from given paths

"use strict";

var assign        = require("es5-ext/object/assign")
  , endsWith      = require("es5-ext/string/#/ends-with")
  , path          = require("path")
  , commonPath    = require("path2/common")
  , requireSilent = require("next/module/require-silent")(require("next/module/require-in-context"))
  , requireFirst  = require("next/module/require-first-in-tree");

var dirname = path.dirname, sep = path.sep, ptrim;

ptrim = function (testPath) {
	return testPath.match(/[\u0000-.0-[\]-\uffff][/\\]$/) ? testPath.slice(0, -1) : testPath;
};

module.exports = function (testeePath, testPath, context) {
	var testConfig, scopes;
	testConfig = {
		test: requireSilent(testPath, context),
		testee: requireSilent(testeePath, context)
	};

	if (!testConfig.test && endsWith.call(testeePath, sep + "index.js")) {
		testConfig.test = require("./utils/index-test")(dirname(testeePath), null, context);
	}

	if (testConfig.test && testConfig.test.__generic) {
		scopes = requireFirst(
			"__scopes", dirname(testPath), ptrim(commonPath(testeePath, testPath))
		);
		assign(testConfig.test, require("./utils/factory")(scopes, testConfig.test.__generic));
		delete testConfig.test.__generic;
	}

	return testConfig;
};
