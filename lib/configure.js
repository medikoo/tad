'use strict';

var fs           = require('fs')
  , bapp         = require('es5-ext/lib/Function/bind-apply-args')
  , curry        = require('es5-ext/lib/Function/curry')
  , rcurry       = require('es5-ext/lib/Function/rcurry')
  , hold         = require('es5-ext/lib/Function/hold')
  , saturate     = require('es5-ext/lib/Function/saturate')
  , invoke       = require('es5-ext/lib/Function/invoke')
  , a2p          = require('deferred/lib/async-to-promise').call
  , ba2p         = require('deferred/lib/async-to-promise').bind
  , all          = require('deferred/lib/chain/all')
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
	emitend = saturate(o.emit.bind(o, 'end'));

	all(paths, hold(function (p) {
		var emit;
		p = ptrim(p);
		emit = curry(emitdata, p);
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
		(rcurry(all, hold(function (testee) {
			emit = curry(emitdata, p, testee);
			return all(findTestPath(testee), curry(findContext, testee))
			(bapp(emit), emit);
		})), emit);
	}))
	(emitend).end();

	return o.on.bind(o);
};
