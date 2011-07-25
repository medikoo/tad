'use strict';

var bap              = require('es5-ext/lib/Function/bind-apply-args')
  , curry            = require('es5-ext/lib/Function/curry')
  , rcurry           = require('es5-ext/lib/Function/rcurry')
  , saturate         = require('es5-ext/lib/Function/saturate')
  , a2p              = require('deferred/lib/async-to-promise').call
  , ee               = require('event-emitter')

  , findTestsPath    = require('./find-test-path')
  , findContext      = require('./find-context')

  , setup;

setup = ee();

module.exports = function (paths) {
	var o, emitdata, emitend, emit;
	if (typeof paths === 'string') {
		paths = arguments;
	}

	o = Object.create(setup);
	emitdata = o.emit.bind(o, 'data');
	emitend = saturate(o.emit.bind(o, 'end'));

	all(paths, function (p) {
		emit = curry(emitdata, p);
		return a2p(fs.stat, p)
		(function (stats) {
			if (stats.isFile()) {
				return [p];
			} else if (stats.isDirectory()) {
				return getFiles(p)
				(invoke('filter', function (file) {
					return file.slice(-3) === '.js';
				}));
			} else {
				return new Error('Invalid path');
			}
		})
		(rcurry(all, function (testee) {
			emit = curry(emit, testee);
			return all(findTestPath(testee), curry(findContext, testee))
			(bap(emit), emit);
		}), emit);
	})
	(emitend).end();

	return o.on.bind(o);
};
