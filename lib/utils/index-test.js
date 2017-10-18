"use strict";

var curry        = require("es5-ext/function/#/curry")
  , contains     = curry.call(require("es5-ext/array/#/contains"))
  , noop         = require("es5-ext/function/noop")
  , not          = require("es5-ext/function/#/not")
  , oForEach     = require("es5-ext/object/for-each")
  , convert      = require("es5-ext/string/#/hyphen-to-camel")
  , d            = require("d")
  , a2p          = require("deferred").promisify
  , isPromise    = require("deferred/is-promise")
  , reqInContext = require("next/module/require-in-context")
  , fs           = require("fs")
  , normalize    = require("path").normalize

  , defineProperty = Object.defineProperty
  , isConstant = RegExp.prototype.test.bind(/^[A-Z0-9_]+$/)
  , readDir;

readDir = function (dir) {
	var o = {};
	if (isPromise(dir)) {
		return dir;
	}
	dir = normalize(dir);
	return a2p(fs.readdir)(dir).map(function (f) {
		if (f[0] === "_") return;
		if (f[0] === ".") return;
		if (f === "lib") return;
		if (f === "node_modules") return;
		if (f === "test") return;
		return a2p(fs.stat)(dir + "/" + f)(function (stats) {
			if (stats.isFile()) {
				if ((f.slice(-3) !== ".js") || (f === "index.js")) {
					return;
				}
				f = f.slice(0, -3);
			} else if (!stats.isDirectory()) {
				return;
			}
			defineProperty(o, convert.call(f), d("cew", normalize(dir + "/" + f)));
		}, noop);
	})(o);
};

module.exports = function (dir, ignores, context) {
	if (context == null) context = global;
	return function (t, a, d) {
		readDir(dir)(function (o) {
			var keys = Object.keys(t), keysLc;
			if (ignores) {
				keys = keys.filter(not.call(contains), ignores);
			}
			keysLc = keys.map(function (name) {
				if (isConstant(name)) name = name.replace(/_/g, "");
				return name.toLowerCase();
			});
			oForEach(o, function (path, f) {
				var i = keysLc.indexOf(f.toLowerCase());
				if (i === -1) {
					a.ok(false, f + " - is present ?");
				} else {
					a.ok(true, f + " - is present ?");
				}
				if (i !== -1) {
					a(t[keys[i]], reqInContext(require.resolve(path), context),
						f + " - points its module ?");
					keys.splice(i, 1);
					keysLc.splice(i, 1);
				}
			});
			a.ok(keys.length === 0, "[" + keys.toString() + "] - no extras found ?");
			d();
		}).done();
	};
};

module.exports.readDir = readDir;
