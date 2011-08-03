'use strict';

var findSame  = require('es5-ext/lib/String/find-same-left').call
  , bapp      = require('es5-ext/lib/Function/bind-apply-args')
  , compact   = require('es5-ext/lib/Array/compact').call
  , map       = require('es5-ext/lib/List/map').call
  , deferred  = require('deferred/lib/deferred')
  , promise   = require('deferred/lib/promise')
  , ptrim     = require('next/lib/path/trim')
  , out       = require('./console')
  , configure = require('./configure')
  , load      = require('./load')
  , run       = require('./run')

  , suite;

suite = {
	init: function (paths, options) {
		var conf, d;
		d = deferred();
		paths = map(paths, ptrim);
		this.resolve = d.resolve;
		this.console = out(options);
		this.tail = promise();
		this.rindex = findSame.apply(null, paths);

		conf = configure(paths);
		conf('data', this.ondata.bind(this));
		conf('end', this.onend.bind(this));
		return d.promise;
	},
	ondata: function (a, b) {
		this.tail = this.tail(bapp(this.process).bind(this, arguments));
	},
	process: function (p, fpath, tpath, context) {
		var pname = p.slice(this.rindex), fname, logger, o, d;
		d = deferred();
		this.console.break();
		if (fpath instanceof Error) {
			// Wrong path
			this.console.error(pname, null, fpath);
			return d.resolve();
		}

		fname = fpath.slice(this.rindex + 1);
		if (tpath instanceof Error) {
			// Could not assume test file path (not within package)
			// or there were problems with obtaining context
			this.console.error(pname, fname, tpath);
			return d.resolve();
		}

		// Configured ok, load files
		return load(fpath, tpath, context)
		(function (o) {

			// Any evaluation errors ?
			if (o.testee instanceof Error) {
				this.console.error(pname, fname, o.testee);
				return d.resolve();
			}
			if (o.test instanceof Error) {
				this.console.error(pname, fname, o.test);
				return d.resolve();
			}

			// Any files missing ?
			if (!o.testee) {
				// Unlikely, result of race condition, file was here (current event loop)
				this.console.error(pname, fname, "Couldn't find '" + fpath + "'");
				return d.resolve();
			}
			if (!o.test) {
				this.console.error(pname, fname, "Tests not found, tried '" + tpath
					+ "'");
				return d.resolve();
			}

			// Loaded ok, run tests
			logger = run(o.testee, o.test);
			logger.on('data', function (o) {
				var name = [fname].concat(o.msg);
				if (o.type === 'pass') {
					name.push(o.data);
				} else if ((o.type === 'fail') && o.data.operator) {
					name.push(o.data.message);
				}
				name = compact(name).join(': ');
				this.console[o.type](compact([pname, fname]).join('/'), name, o.data);
			}.bind(this));
			logger.on('end', function () {
				d.resolve();
			});

			return d.promise;
		}.bind(this), d.resolve);
	},
	onend: function () {
		this.tail(this.end.bind(this)).end();
		delete this.tail;
	},
	end: function () {
		this.console.end();
		this.resolve();
	}
};

module.exports = function (paths, options) {
	return Object.create(suite).init(paths, options);
};
