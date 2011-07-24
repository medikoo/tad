'use strict';

var fs             = require('fs')
  , path           = require('path')

  , isFunction     = require('es5-ext/lib/Function/is-function')
  , bapply         = require('es5-ext/lib/Function/bind-apply-args')
  , aritize        = require('es5-ext/lib/Function/aritize')
  , curry          = require('es5-ext/lib/Function/curry')
  , saturate       = require('es5-ext/lib/Function/saturate')
  , seq            = require('es5-ext/lib/Function/sequence')
  , compact        = require('es5-ext/lib/List/compact').call
  , filter         = require('es5-ext/lib/List/filter').call
  , flatten        = require('es5-ext/lib/List/flatten').call
  , map            = require('es5-ext/lib/List/map').call
  , merge          = require('es5-ext/lib/Object/plain/merge').call
  , getPackageRoot = require('next/lib/get-package-root')
  , fileExists     = require('next/lib/fs/file-exists')
  , pathTrim       = require('next/lib/path/trim')
  , a2p            = require('deferred/lib/async-to-promise').call
  , all            = require('deferred/lib/chain/all')
  , join           = require('deferred/lib/chain/join')

  , getSetup, keepName, readFile, readDir, readPath;

getSetup = function (name) {
	return function (set) {
		return { sets: set, name: name };
	};
};

readFile = function (fpath, root, env) {
	var set = {}, tests = root + '/test/' + fpath;
	set.name = fpath.slice(0, -3);
	set.target = root + env + fpath;

	return a2p(fileExists, tests)
		.then(function (exists) {
			if (!exists) {
				if (set.name.split('/').pop() === 'index') {
					set.tests = ':index';
				} else {
					return new Error("Could not find tests for '" + set.name + "'. "
						+ "Searched in '" + tests + "'");
				}
			} else {
				set.tests = tests.slice(0, -3);
			}
			return set;
		});
};

readDir = function (dpath, root, env) {
	var fullpath = pathTrim(root + env + dpath);
	return a2p(fs.readdir, fullpath)
		.then(function (files) {
			return join(files.map(function (name) {
				var filepath = fullpath + '/' + name;
				return a2p(fs.stat, filepath)
					.then(function (stats) {
						if (stats.isFile()) {
							if (name.slice(-3) === '.js') {
								return readFile((dpath ? (dpath + '/') : '') + name, root, env);
							}
						} else if (stats.isDirectory()) {
							return readDir((dpath ? (dpath + '/') : '') + name, root, env);
						}
						return null;
					});
			}));
		}).then(seq(flatten, compact));
};

readPath = function (options, tpath) {
	return all(a2p(fs.stat, tpath), a2p(getPackageRoot, tpath))
		.then(bapply(function (stats, root) {
			var env = options.env, setup;
			tpath = tpath.slice(root.length + 1);
			if ((tpath === 'lib') || (tpath.indexOf('lib/') === 0)) {
				tpath = tpath.slice('lib/'.length);
				env = env || '/lib/';
			} else if (!env) {
				env = '/';
			}
			setup = getSetup(tpath);
			if (stats.isFile()) {
				return readFile(tpath, root, env).then(Array).then(setup);
			} else if (stats.isDirectory()) {
				return readDir(tpath, root, env).then(setup);
			} else {
				return new Error("Path should point file or folder");
			}
		}));
};

module.exports = function (paths, options) {

	// detect test path
	// get pairs
	// 
	// load tests
	// 

	return join(paths.map(pathTrim).map(curry(readPath, options)))
		.then(function (args) {
			// console.log("pMAP args", args);
			var sets = filter(map(args, function (sets, i) {
				if (sets instanceof Error) {
					if (options.onerror) {
						options.onerror(sets.message);
					}
					return null;
				} else {
					sets.sets = sets.sets.filter(function (set) {
						if (set instanceof Error) {
							if (options.onerror) {
								options.onerror(set.message);
							}
							return false;
						}
						return true;
					});
					return sets;
				}
			}), Boolean);
			return sets.length ? sets : new Error('No tests found');
		});
};
