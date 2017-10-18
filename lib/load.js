// Imports lib and tests from given paths

"use strict";

var assign        = require("es5-ext/object/assign")
  , endsWith      = require("es5-ext/string/#/ends-with")
  , path          = require("path")
  , commonPath    = require("path2/common")
  , requireSilent = require("next/module/require-silent")(require("next/module/require-in-context"))
  , requireFirst  = require("next/module/require-first-in-tree");

var dirname = path.dirname, sep = path.sep, ptrim;

ptrim = function (path) {
	return path.match(/[\u0000-\.0-\[\]-\uffff][\/\\]$/) ? path.slice(0, -1) : path;
};

module.exports = function (testeePath, testPath, context) {
	var o, scopes;
	o = {
		test: requireSilent(testPath, context),
		testee: requireSilent(testeePath, context)
	};

	if (!o.test && endsWith.call(testeePath, sep + "index.js")) {
		o.test = require("./utils/index-test")(dirname(testeePath), null, context);
	}

	if (o.test && o.test.__generic) {
		scopes = requireFirst(
			"__scopes",
			dirname(testPath),
			ptrim(commonPath(testeePath, testPath))
		);
		assign(o.test, require("./utils/factory")(scopes, o.test.__generic));
		delete o.test.__generic;
	}

	return o;
};
