'use strict';

var forEach        = require('es5-ext/lib/List/forEach').call
  , getPackageRoot = require('node-ext/lib/getPackageRoot')
  , pathTrim       = require('node-ext/lib/path/trim')
  , p              = require('promise').call
  , pMap           = require('promise/lib/map')
  , cerror         = require('cli-color').red

  , readTests      = require('../lib/read-tests')
  , engine         = require('../lib/engines/test')

  , options, die, run;

die = function (message) {
	console.warn(message);
	console.warn("Usage: " + process.argv[1] + " <paths>...");
	process.exit(1);
};

run = function (sets, testee) {
	testee = pathTrim(testee);
	return p(getPackageRoot, testee)
		.then(function (root) {
			var name = testee.slice(root.length + 1);
			if (name.indexOf('lib/') === 0) {
				name = name.slice('lib/'.length);
			}
			sets = sets.filter(function (set) {
				if (set instanceof Error) {
					console.error(cerror(set.message));
					return false;
				}
				return true;
			});
			engine(sets, name);
		});
};

options = process.argv.slice(2);

if (!options.length) {
	die("No files specified.");
}

pMap.apply(null, options.map(readTests))
	.then(function () {
		forEach(arguments, function (sets, i) {
			if (sets instanceof Error) {
				console.error(cerror(sets.message));
			} else {
				run(sets, options[i]);
			}
		});
	});
