"use strict";

var spread       = require("es5-ext/function/#/spread")
  , deferred     = require("deferred")
  , path         = require("path")
  , commonPath   = require("path2/common")
  , runInContext = require("vm").runInContext
  , out          = require("./lib/console")
  , configure    = require("./lib/configure")
  , load         = require("./lib/load")
  , run          = require("./lib/run")

  , resolve = path.resolve, map = Array.prototype.map
  , suite, isError;

isError = function (e, context) {
	if (e instanceof Error) return true;
	if (context !== global) {
		return runInContext("(function () { return this instanceof Error; })",
			context).call(e);
	}
	return false;
};

suite = {
	init: function (paths, options) {
		var conf, d, root;
		d = deferred();
		paths = map.call(paths, function (path) {
 return resolve(path);
});
		this.resolve = d.resolve;
		this.console = out(options);
		this.tail = deferred(null);
		if (paths.length > 1) {
			root = commonPath.apply(null, paths);
			this.rindex = root ? root.length + 1 : 0;
		} else if (paths.length) {
			this.rindex = paths[0].length + 1;
		}

		conf = configure(paths);
		conf("data", this.ondata.bind(this));
		conf("end", this.onend.bind(this));
		return d.promise;
	},
	ondata: function () {
		this.tail = this.tail(spread.call(this.process).bind(this, arguments));
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

		fname = fpath.slice(this.rindex);
		if (tpath instanceof Error) {
			if (tpath.type === "testfile") {
				// Input is a test file, ignore
				return d.resolve();
			}
			// Could not assume test file path (not within package)
			// or there were problems with obtaining context
			this.console.error(pname, fname, tpath);
			return d.resolve();
		}

		// Configured ok, load files
		o = load(fpath, tpath, context);

		// Any files missing, any evaluation errors ?
		if (o.testee === undefined) {
			// File not accessible
			this.console.error(pname, fname, "Couldn't load module '" + fpath + "'");
			return d.resolve();
		}

		if (isError(o.test, context)) {
			this.console.error(pname, fname, o.test);
			return d.resolve();
		}
		if (isError(o.testee, context)) {
			this.console.error(pname, fname, o.testee);
			return d.resolve();
		}
		if (!o.test) {
			this.console.error(pname, fname, "Tests could not be loaded, tried '" +
				tpath + "'");
			return d.resolve();
		}

		// Loaded ok, run tests
		logger = run(o.testee, o.test);
		logger.on("data", function (o) {
			var name = [fname].concat(o.msg);
			if (o.type === "pass") {
				name.push(o.data);
			} else if ((o.type === "fail") && o.data.operator) {
				name.push(o.data.message);
			}
			name = name.filter(Boolean).join(": ");
			this.console[o.type](fname, name, o.data);
		}.bind(this));
		logger.on("end", function () {
			d.resolve();
		});

		return d.promise;
	},
	onend: function () {
		this.tail(this.end.bind(this)).done();
		delete this.tail;
	},
	end: function () {
		this.console.end();
		this.resolve(this);
	}
};

module.exports = function (paths, options) {
	return Object.create(suite).init(paths, options);
};
