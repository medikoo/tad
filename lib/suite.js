'use strict';

var findSame  = require('es5-ext/lib/String/find-same-index').call
  , compact   = require('es5-ext/lib/Array/compact').call
  , deferred  = require('deferred/lib/deferred')
  , promise   = require('deferred/lib/promise')
  , console   = require('./console')
  , configure = require('./configure')
  , load      = require('./load')
  , run       = require('./run')

  , suite;

suite = {
	init: function (paths, options) {
		var conf, d;
		d = deferred();
		this.resolve = d.resolve;
		this.console = console();
		this.tail = promise();
		this.rindex = findSame.apply(null, paths);

		conf = configure(paths);
		conf('data', this.ondata.bind(this));
		conf('end', this.onend.bind(this));
		return d.promise;
	},
	ondata: function () {
		this.tail = this.tail(bap(this.process).bind(this, arguments));
	},
	process: function (p, fpath, tpath, context) {
		var pname = p.slice(this.index), fname, logger, o, d;
		d = deferred();
		if (fpath instanceof Error) {
			// Wrong path
			c.error(pname, null, fpath);
			return d.resolve();
		}

		fname = fpath.slice(rindex);
		if (tpath instanceof Error) {
			// Could not assume test file path (not within package)
			// or there were problems with obtaining context
			c.error(pname, fname, tpath);
			return d.resolve();
		}

		// Configured ok, load files
		o = load(fpath, tpath, context);

		// Any evaluation errors ?
		if (o.testee instanceof Error) {
			c.error(pname, fname, o.testee);
			return d.resolve();
		}
		if (o.test instanceof Error) {
			c.error(pname, fname, o.test);
			return d.resolve();
		}

		// Any missing file errors ?
		if (!o.testee) {
			c.error(pname, fname, "Could not find '" + fpath + "'.");
			return d.resolve();
		}
		if (!o.test) {
			c.error(pname, fname, "Not found tests for '" + fpath + "'. Tried '"
				+ tpath + "'.");
			return d.resolve();
		}

		// Loaded ok, run tests
		logger = run(o.testee, o.test);
		logger.on('data', function (o) {
			var name = [f.path].concat(o.msg);
			if (o.type === 'pass') {
				name.push(o.data);
			} else if ((o.type === 'fail') && o.data.operator) {
				name.push(o.data.message);
			}
			name = compact(name).join(': ');
			c[o.type](pname, name, o);
		});
		logger.on('end', d.resolve);

		return d.promise;
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
