// Imports lib and tests from given paths

'use strict';

var path          = require('path')
  , vm            = require('vm')
  , fs            = require('fs')

  , curry         = require('es5-ext/lib/Function/curry')
  , merge         = require('es5-ext/lib/Object/plain/merge').call
  , endsWith      = require('es5-ext/lib/String/ends-with')
  , deferred      = require('deferred/lib/deferred')
  , ba2p          = require('deferred/lib/async-to-promise').bind
  , requireSilent = require('next/lib/require-silent')
(require('next/lib/require-in-context'))

  , readFile      = ba2p(fs.readFile)
  , getRequire    = ba2p(require('next/lib/get-require'))

  , ctxRequireSilent;

module.exports = function (testeePath, testPath, context, withcoverage) {
	var o;
	o = {
		testee: requireSilent(testeePath, context),
		test: requireSilent(testPath, context)
	};

	if (!o.test && endsWith(testeePath, '/index.js')) {
		o.test = require('./utils/index-test')(path.dirname(testeePath));
	}

	if (o.test && o.test.__generic) {
		merge(o.test, require('./utils/factory')
			(require(path.dirname(testPath) + '/__scopes'), o.test.__generic));
		delete o.test.__generic;
	}

	return o;
};
