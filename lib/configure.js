"use strict";

var lock         = require("es5-ext/function/#/lock")
  , partial      = require("es5-ext/function/#/partial")
  , deferred     = require("deferred")
  , ee           = require("event-emitter")
  , fs           = require("fs")
  , resolve      = require("path").resolve
  , readdir      = require("fs2/readdir")
  , findTestPath = require("./find-test-path")
  , findContext  = require("./find-context");

var stat = deferred.promisify(fs.stat), configure, readdirOpts;

require("./tad-ignore-mode");

readdirOpts = {
	depth: Infinity,
	type: { file: true },
	pattern: /\.js$/,
	ignoreRules: ["git", "tad"]
};
configure = ee();

module.exports = function (inputPaths) {
	var config, emitdata, emitend;
	if (typeof inputPaths === "string") {
		inputPaths = arguments;
	}

	config = Object.create(configure);
	emitdata = config.emit.bind(config, "data");
	emitend = lock.call(config.emit.bind(config, "end"));

	deferred.reduce(
		inputPaths,
		function (ignore, modulePath) {
			var emit;
			emit = partial.call(emitdata, modulePath);
			return stat(modulePath)(function (stats) {
				if (stats.isFile()) return [modulePath];
				if (stats.isDirectory()) {
					return readdir(modulePath, readdirOpts).map(function (file) {
						return resolve(modulePath, file);
					});
				}
				throw new Error("Invalid path");
			})(function (paths) {
				return deferred.reduce(
					paths,
					function (ignore2, testee) {
						emit = partial.call(emitdata, modulePath, testee);
						return findTestPath(testee)(function (test) {
							if (!test) return null;
							return findContext(
								testee, test
							)(function (context) { emit(test, context); });
						})(null, emit);
					},
					null
				);
			}, emit);
		},
		null
	)(function () { process.nextTick(emitend); });

	return config.on.bind(config);
};
