'use strict';

var lock         = require('es5-ext/lib/Function/prototype/lock')
  , partial      = require('es5-ext/lib/Function/prototype/partial')
  , deferred     = require('deferred')
  , ee           = require('event-emitter')
  , fs           = require('fs')
  , resolve      = require('path').resolve
  , readdir      = require('fs2/lib/readdir')
  , findTestPath = require('./find-test-path')
  , findContext  = require('./find-context')

  , stat = deferred.promisify(fs.stat)

  , configure, readdirOpts;

require('./_tad-ignore-mode');

readdirOpts = { depth: Infinity, type: { file: true }, pattern: /\.js$/,
		ignoreRules: 'tad' };
configure = ee();

module.exports = function (paths) {
	var o, emitdata, emitend;
	if (typeof paths === 'string') {
		paths = arguments;
	}

	o = Object.create(configure);
	emitdata = o.emit.bind(o, 'data');
	emitend = lock.call(o.emit.bind(o, 'end'));

	deferred.reduce(paths, function (ignore, p) {
		var emit;
		emit = partial.call(emitdata, p);
		return stat(p)(function (stats) {
			if (stats.isFile()) return [p];
			if (stats.isDirectory()) {
				return readdir(p, readdirOpts).map(function (file) {
					return resolve(p, file);
				});
			}
			return new Error('Invalid path');
		})(function (paths) {
			return deferred.reduce(paths, function (ignore, testee) {
				emit = partial.call(emitdata, p, testee);
				return findTestPath(testee)(function (test) {
					if (!test) return;
					return findContext(testee, test)(function (context) {
						emit(test, context);
					});
				})(null, emit);
			}, null);
		}, emit);
	}, null)(emitend).end();

	return o.on.bind(o);
};
