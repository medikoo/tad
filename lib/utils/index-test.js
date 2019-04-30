"use strict";

var curry        = require("es5-ext/function/#/curry")
  , contains     = curry.call(require("es5-ext/array/#/contains"))
  , noop         = require("es5-ext/function/noop")
  , not          = require("es5-ext/function/#/not")
  , oForEach     = require("es5-ext/object/for-each")
  , isValue      = require("es5-ext/object/is-value")
  , convert      = require("es5-ext/string/#/hyphen-to-camel")
  , d            = require("d")
  , a2p          = require("deferred").promisify
  , isPromise    = require("deferred/is-promise")
  , reqInContext = require("../require-in-context")
  , fs           = require("fs")
  , normalize    = require("path").normalize;

var defineProperty = Object.defineProperty
  , isConstant = RegExp.prototype.test.bind(/^[A-Z0-9_]+$/)
  , readDir;

readDir = function (dir) {
	var result = {};
	if (isPromise(dir)) {
		return dir;
	}
	dir = normalize(dir);
	return a2p(fs.readdir)(dir).map(function (filename) {
		if (filename[0] === "_") return null;
		if (filename[0] === ".") return null;
		if (filename === "lib") return null;
		if (filename === "node_modules") return null;
		if (filename === "test") return null;
		return a2p(fs.stat)(dir + "/" + filename)(function (stats) {
			if (stats.isFile()) {
				if (filename.slice(-3) !== ".js" || filename === "index.js") {
					return;
				}
				filename = filename.slice(0, -3);
			} else if (!stats.isDirectory()) {
				return;
			}
			defineProperty(
				result, convert.call(filename), d("cew", normalize(dir + "/" + filename))
			);
		}, noop);
	})(result);
};

module.exports = function (dir, ignores, context) {
	if (!isValue(context)) context = global;
	return function (t, a, done) {
		readDir(dir)(function (fileList) {
			var keys = Object.keys(t), keysLc;
			if (ignores) {
				keys = keys.filter(not.call(contains), ignores);
			}
			keysLc = keys.map(function (name) {
				if (isConstant(name)) name = name.replace(/_/g, "");
				return name.toLowerCase();
			});
			oForEach(fileList, function (path, value) {
				var i = keysLc.indexOf(value.toLowerCase());
				if (i === -1) {
					a.ok(false, value + " - is present ?");
				} else {
					a.ok(true, value + " - is present ?");
				}
				if (i !== -1) {
					a(
						t[keys[i]], reqInContext(require.resolve(path), context),
						value + " - points its module ?"
					);
					keys.splice(i, 1);
					keysLc.splice(i, 1);
				}
			});
			a.ok(keys.length === 0, "[" + keys.toString() + "] - no extras found ?");
			done();
		}).done();
	};
};

module.exports.readDir = readDir;
