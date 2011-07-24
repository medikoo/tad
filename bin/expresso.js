#!/usr/bin/env node

'use strict';

var fs        = require('fs')
  , path      = require('path')
  , spawn     = require('child_process').spawn

  , saturate  = require('es5-ext/lib/Function/saturate')
  , seq       = require('es5-ext/lib/Function/sequence')
  , pipe      = require('node-ext/lib/child_process/pipe')
  , relative  = require('node-ext/lib/path/relative')
  , a2p       = require('deferred/lib/async-to-promise').call
  , ba2p      = require('deferred/lib/async-to-promise').bind
  , all       = require('deferred/lib/chain/all')
  , clierror  = require('cli-color').red

  , nopt      = require('nopt')

  , readTests = require('../lib/read-tests')

  , argv, rootPath, expressoPath, tmpPath, tplPath, paths;

argv = nopt({
	growl: Boolean,
	coverage: Boolean,
	quiet: Boolean,
	serial: Boolean,
	boring: Boolean,
	version: Boolean,
	help: Boolean
},
{
	g: ["--growl"],
	c: ["--coverage"],
	q: ["--quiet"],
	s: ["--serial"],
	b: ["--boring"],
	v: ["--version"],
	h: ["--help"]
}).argv;

rootPath = path.dirname(__dirname);
expressoPath =  rootPath + '/node_modules/expresso/bin/expresso';
tmpPath = rootPath + '/tmp/expresso-' + (+new Date) + '.js';
tplPath = rootPath + '/lib/engines/expresso.js';

if (!argv.remain.length) {
	console.warn("No paths specified.");
	process.exit(1);
} else {
	paths = argv.remain.map(function (p) {
		return (p.charAt(0) !== '/') ? process.env.PWD + '/' + p : p;
	});

	all(readTests(paths, {
		onerror: seq(clierror, console.error),
		env: (argv.cooked.indexOf('--coverage') === -1) ? '/lib/' : '/lib-cov/'
	}), saturate(a2p, fs.readFile, tplPath, 'utf8'))
	.then(function (data) {
		return data[1].replace('SETS', JSON.stringify(data[0]));
	}, function (err) {
		console.error(clierror(err.message));
		process.exit(1);
	})
	.then(ba2p(fs.writeFile, tmpPath))
	.then(function () {
		var child = pipe(spawn(expressoPath,
			argv.original.slice(0, -argv.remain.length).concat(relative(tmpPath)),
			{ env: process.env }));
		return a2p(child.on.bind(child, 'exit'));
	}).end();
}
