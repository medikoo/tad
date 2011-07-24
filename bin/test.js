#!/usr/bin/env node

'use strict';

var curry      = require('es5-ext/lib/Function/curry')
  , seq        = require('es5-ext/lib/Function/sequence')
  , join       = require('deferred/lib/chain/join')
  , clierror   = require('cli-color/lib').red

  , readTests  = require('../lib/read-tests')
  , setupTests = require('../lib/load-tests')
  , engine     = require('../lib/engines/test')

  , die, paths;

die = function (message) {
	console.warn(message);
	console.warn("Usage: " + process.argv[1] + " <paths>...");
	process.exit(1);
};

paths = process.argv.slice(2);

if (!paths.length) {
	die("No paths specified.");
}
paths = paths.map(function (p) {
	return (p.charAt(0) !== '/') ? process.env.PWD + '/' + p : p;
});

readTests(paths, {
	onerror: function (err) { throw err; }
}).then(function (sets) {
	// console.log("SETS", sets);
	return join.apply(null, setupTests(sets).map(engine));
}).end();
