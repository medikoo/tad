"use strict";

var spread       = require("es5-ext/function/#/spread")
  , deferred     = require("deferred")
  , path         = require("path")
  , commonPath   = require("path2/common")
  , runInContext = require("vm").runInContext
  , out          = require("./lib/console")
  , configure    = require("./lib/configure")
  , load         = require("./lib/load")
  , run          = require("./lib/run");

var resolve = path.resolve, map = Array.prototype.map, suite, isError;

isError = function (e, context) {
	if (e instanceof Error) return true;
	if (context !== global) {
		return runInContext("(function () { return this instanceof Error; })", context).call(e);
	}
	return false;
};

suite = {
	init: function (paths, options) {
		var conf, d, projectRoot;
		d = deferred();
		paths = map.call(paths, function (testPath) { return resolve(testPath); });
		this.resolve = d.resolve;
		this.console = out(options);
		this.tail = deferred(null);
		if (paths.length > 1) {
			projectRoot = commonPath.apply(null, paths);
			this.rindex = projectRoot ? projectRoot.length + 1 : 0;
		} else if (paths.length) {
			this.rindex = paths[0].length + 1;
		}

		conf = configure(paths);
		conf("data", this.ondata.bind(this));
		conf("end", this.onend.bind(this));
		return d.promise;
	},
	ondata: function () { this.tail = this.tail(spread.call(this.process).bind(this, arguments)); },
	// eslint-disable-next-line max-statements
	process: function (modulePath, fpath, tpath, context) {
		var pname = modulePath.slice(this.rindex), fname, logger, testModuleConfig, d;
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
		testModuleConfig = load(fpath, tpath, context);

		// Any files missing, any evaluation errors ?
		if (testModuleConfig.testee === undefined) {
			// File not accessible
			this.console.error(pname, fname, "Couldn't load module '" + fpath + "'");
			return d.resolve();
		}

		if (isError(testModuleConfig.test, context)) {
			this.console.error(pname, fname, testModuleConfig.test);
			return d.resolve();
		}
		if (isError(testModuleConfig.testee, context)) {
			this.console.error(pname, fname, testModuleConfig.testee);
			return d.resolve();
		}
		if (!testModuleConfig.test) {
			this.console.error(pname, fname, "Tests could not be loaded, tried '" + tpath + "'");
			return d.resolve();
		}

		// Loaded ok, run tests
		logger = run(testModuleConfig.testee, testModuleConfig.test);
		logger.on(
			"data",
			function (testResult) {
				var name = [fname].concat(testResult.msg);
				if (testResult.type === "pass") {
					name.push(testResult.data);
				} else if (testResult.type === "fail" && testResult.data.operator) {
					name.push(testResult.data.message);
				}
				name = name.filter(Boolean).join(": ");
				this.console[testResult.type](fname, name, testResult.data);
			}.bind(this)
		);
		logger.on("end", function () { d.resolve(); });

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

module.exports = function (paths, options) { return Object.create(suite).init(paths, options); };
