'use strict';

var path             = require('path')
  , curry            = require('es5-ext/lib/Function/curry')
  , rcurry           = require('es5-ext/lib/Function/rcurry')
  , trim             = require('next/lib/path/trim')
  , ee               = require('event-emitter')

  , findTestsPath    = require('./get-test-path')
  , buildPairs       = require('./get-test-filenames')
  , run              = require('./run-tests')

  , createLogger = require('../lib/logger/node');

module.exports = function (paths) {
	var o, r;
	if (typeof paths === 'string') {
		paths = arguments;
	}

	ee(o = {}, r = {});

	all(map(paths, function (p) {
		findTestsPath(p)
		(curry(buildPairs, p))
		(function (pairs) {
			return all(pairs.map(ba(function (testee, test) {
				return run(testee, test);
			})));
		})
		(run, curry(ee.emit, 'path-error'));
	})).end();

	return r;
};

all(paths, function (p, r) {
	findTestPath(p)
	(buildPairs.curry(p))
	(all.rcurry(a2a(function (testee, test, r) {
		load(testee, test)
		(run, curry(ee.emit, 'path-error'))
		(ee.emit.curry('logger'))
		(r, r);
	})), ee.emit.curry('path-error'))
	(r, r);
})
(ee.emit.curry('end'))
.end();
