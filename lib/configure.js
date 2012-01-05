'use strict';

var fs           = require('fs')
  , match        = require('es5-ext/lib/Function/prototype/match')
  , curry        = require('es5-ext/lib/Function/prototype/curry')
  , rcurry       = require('es5-ext/lib/Function/prototype/rcurry')
  , hold         = require('es5-ext/lib/Function/prototype/hold')
  , lock         = require('es5-ext/lib/Function/prototype/lock')
  , invoke       = require('es5-ext/lib/Function/invoke')
  , deferred     = require('deferred')
  , getFiles     = deferred.promisify(require('next/lib/fs/readdir-files-deep'))
  , ptrim        = require('next/lib/path/trim')
  , ee           = require('event-emitter')

  , findTestPath = require('./find-test-path')
  , findContext  = require('./find-context')

  , stat = deferred.promisify(fs.stat)

  , configure;

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
		p = ptrim(p);
		emit = curry.call(emitdata, p);
		return stat(p)
		(function (stats) {
			if (stats.isFile()) {
				return [p];
			} else if (stats.isDirectory()) {
				return getFiles(p)
				(invoke('filter', function (file) {
					return file.slice(-3) === '.js';
				}))
				(invoke('map', function (file) {
					return p + '/' + file;
				}));
			} else {
				return new Error('Invalid path');
			}
		}).end(emit).reduce(function (ignore, testee) {
			emit = curry.call(emitdata, p, testee);
			return deferred(tmp = findTestPath(testee), tmp(curry.call(findContext, testee)))
				.match(emit, emit);
		});
	})
	(emitend).end();

	return o.on.bind(o);
};
