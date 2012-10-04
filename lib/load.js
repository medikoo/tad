// Imports lib and tests from given paths

'use strict';

var commonLeft    = require('es5-ext/lib/Array/prototype/common-left')
  , extend        = require('es5-ext/lib/Object/extend')
  , endsWith      = require('es5-ext/lib/String/prototype/ends-with')
  , path          = require('path')
  , vm            = require('vm')
  , readFile      = require('fs2/lib/read-file')
  , requireSilent = require('next/lib/module/require-silent')(
	require('next/lib/module/require-in-context')
)
  , requireFirst  = require('next/lib/module/require-first-in-tree')

  , dirname = path.dirname, sep = path.sep
  , ptrim, ctxRequireSilent;

ptrim = function (path) {
	return path.match(/[\u0000-\.0-\[\]-\uffff][\/\\]$/) ?
		path.slice(0, -1) : path;
};

module.exports = function (testeePath, testPath, context, withcoverage) {
	var o, scopes;
	o = {
		testee: requireSilent(testeePath, context),
		test: requireSilent(testPath, context)
	};

	if (!o.test && endsWith.call(testeePath, sep + 'index.js')) {
		o.test = require('./utils/index-test')(dirname(testeePath));
	}

	if (o.test && o.test.__generic) {
		scopes = requireFirst('__scopes', dirname(testPath),
			ptrim(testeePath.slice(0, commonLeft.call(testeePath, testPath))));
		extend(o.test, require('./utils/factory')(scopes, o.test.__generic));
		delete o.test.__generic;
	}

	return o;
};
