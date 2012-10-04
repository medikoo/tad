'use strict';

var fs           = require('fs')
  , resolve      = require('path').resolve
  , match        = require('es5-ext/lib/Function/prototype/match')
  , lock         = require('es5-ext/lib/Function/prototype/lock')
  , partial      = require('es5-ext/lib/Function/prototype/partial')
  , invoke       = require('es5-ext/lib/Function/invoke')
  , deferred     = require('deferred')
  , readdir      = require('fs2/lib/readdir')
  , ee           = require('event-emitter')

  , findTestPath = require('./find-test-path')
  , findContext  = require('./find-context')

  , stat = deferred.promisify(fs.stat)

  , configure, readdirOpts;

readdirOpts = { depth: Infinity, type: { file: true } };
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
		var emit, tmp;
		emit = partial.call(emitdata, p);
		return stat(p)(function (stats) {
			if (stats.isFile()) {
				return [p];
			} else if (stats.isDirectory()) {
				return readdir(p, readdirOpts)(invoke('filter', function (file) {
					return file.slice(-3) === '.js';
				}))(invoke('map', function (file) {
					return resolve(p, file);
				}));
			} else {
				return new Error('Invalid path');
			}
		})(function (paths) {
			return deferred.reduce(paths, function (ignore, testee) {
				emit = partial.call(emitdata, p, testee);
				return deferred(tmp = findTestPath(testee),
					tmp(partial.call(findContext, testee))).match(emit, emit);
			}, null);
		}, emit);
	}, null)(emitend).end();

	return o.on.bind(o);
};
