// Imports lib and tests from given paths

'use strict';

var commonLeft    = require('es5-ext/array/#/common-left')
  , extend        = require('es5-ext/object/extend')
  , endsWith      = require('es5-ext/string/#/ends-with')
  , path          = require('path')
  , requireSilent = require('next/lib/module/require-silent')(
	require('next/lib/module/require-in-context')
)
  , requireFirst  = require('next/lib/module/require-first-in-tree')

  , dirname = path.dirname, sep = path.sep
  , ptrim;

ptrim = function (path) {
	return path.match(/[\u0000-\.0-\[\]-\uffff][\/\\]$/) ?
			path.slice(0, -1) : path;
};

module.exports = function (testeePath, testPath, context) {
	var o, scopes;
	o = {
		test: requireSilent(testPath, context),
		testee: requireSilent(testeePath, context)
	};

	if (!o.test && endsWith.call(testeePath, sep + 'index.js')) {
		o.test = require('./utils/index-test')(dirname(testeePath), null, context);
	}

	if (o.test && o.test.__generic) {
		scopes = requireFirst('__scopes', dirname(testPath),
			ptrim(testeePath.slice(0, commonLeft.call(testeePath, testPath))));
		extend(o.test, require('./utils/factory')(scopes, o.test.__generic));
		delete o.test.__generic;
	}

	return o;
};
