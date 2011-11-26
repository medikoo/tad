'use strict';

var fs           = require('fs')
  , match        = require('es5-ext/lib/Function/prototype/match')
  , curry        = require('es5-ext/lib/Function/prototype/curry')
  , rcurry       = require('es5-ext/lib/Function/rcurry').call
  , hold         = require('es5-ext/lib/Function/prototype/hold')
  , lock         = require('es5-ext/lib/Function/prototype/lock')
  , invoke       = require('es5-ext/lib/Function/invoke')
  , a2p          = require('deferred/lib/async-to-promise').call
  , ba2p         = require('deferred/lib/async-to-promise').bind
  , all          = require('deferred/lib/join/all')
  , getFiles     = ba2p(require('next/lib/fs/readdir-files-deep'))
  , ptrim        = require('next/lib/path/trim')
  , ee           = require('event-emitter')

  , findTestPath = require('./find-test-path')
  , findContext  = require('./find-context')

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

	all(paths, hold.call(function (p) {
		var emit;
		p = ptrim(p);
		emit = curry.call(emitdata, p);
		return a2p(fs.stat, p)
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
		})
		(rcurry(all, hold.call(function (testee) {
			emit = curry.call(emitdata, p, testee);
			return all(findTestPath(testee), curry.call(findContext, testee))
			(match.call(emit), emit);
		})), emit);
	}))
	(emitend).end();

	return o.on.bind(o);
};
