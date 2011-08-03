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
  , requireSilent = require('next/lib/require-silent')(require)

  , readFile      = ba2p(fs.readFile)
  , getRequire    = ba2p(require('next/lib/get-require'));

module.exports = function (testeePath, testPath, context, withcoverage) {
	var d = deferred();
	var o = {};

	var prepareTest = function () {
		if (!o.test && endsWith(testeePath, '/index.js')) {
			o.test = require('./utils/index-test')(path.dirname(testeePath));
		}

		if (o.test && o.test.__generic) {
			merge(o.test, require('./utils/factory')
				(require(path.dirname(testPath) + '/__scopes'), o.test.__generic));
			delete o.test.__generic;
		}
	};

	// if (context !== global) {
	if (false) {
		o.test = requireSilent(testPath);
		prepareTest();
		var r = getRequire(testeePath);
		return readFile(testeePath, 'utf8')
		(function (src) {
			context.require = r;
			context.module = { exports: context.exports = {} };
			context.console = console;
			context = vm.createContext(context);
			try {
				vm.runInContext(src, context);
				o.testee = context.module.exports;

				// var lglobal = context.module.exports;
				// console.log(Object.getOwnPropertyNames(global).filter(function (prop) {
				//	return lglobal.props.indexOf(prop) === -1;
				// }));

				// console.log(lglobal.proto);
				// console.log(lglobal.proprops);
				// console.log(lglobal.haso);
				// console.log(lglobal.erro);

			} catch (e) {
				o.testee = e;
			}
		}, function () {
			o.testee = null;
		})
		(curry(d.resolve, o));
	} else {
		o.testee = requireSilent(testeePath);
		o.test = requireSilent(testPath);
		prepareTest();
	}

	return d.resolve(o);
};
