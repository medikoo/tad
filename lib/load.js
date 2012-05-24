// Imports lib and tests from given paths

'use strict';

var path          = require('path')
  , vm            = require('vm')
  , fs            = require('fs')

  , commonLeft    = require('es5-ext/lib/Array/prototype/common-left')
  , extend         = require('es5-ext/lib/Object/extend')
  , endsWith      = require('es5-ext/lib/String/prototype/ends-with')
  , deferred      = require('deferred/lib/deferred')
  , requireSilent = require('next/lib/require-silent')(
	require('next/lib/require-in-context')
)
  , requireFirst  = require('next/lib/require-first-in-tree')
  , ptrim         = require('next/lib/path/trim')

  , readFile = require('deferred').promisify(fs.readFile)
  , dirname = path.dirname
  , separator = (process.env.OS === 'Windows_NT') ? '\\' : '/'

  , ctxRequireSilent;

module.exports = function (testeePath, testPath, context, withcoverage) {
	var o, scopes;
	o = {
		testee: requireSilent(testeePath, context),
		test: requireSilent(testPath, context)
	};

	if (!o.test && endsWith.call(testeePath, separator + 'index.js')) {
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
