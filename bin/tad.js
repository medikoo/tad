#!/usr/bin/env node

"use strict";

require("essentials");

var compact  = require("es5-ext/array/#/compact")
  , flatten  = require("es5-ext/array/#/flatten")
  , deferred = require("deferred")
  , path     = require("path")
  , findRoot = require("next/module/find-package-root")
  , readdir  = require("fs2/readdir")
  , stat     = require("fs2/stat")
  , argv     = require("optimist")
		.usage("Usage: $0 [options] [paths]")
		.boolean(["a", "m"])
		.describe("a", "Display all tests names, including passed")
		.describe("m", "Minimise output, verbose only for fails or errors").argv;

var extname   = path.extname
  , resolve   = path.resolve
  , initSuite = require("..");

if (!argv._.length) argv._ = ["."];

require("../lib/tad-ignore-mode");

deferred
	.map(argv._, function (inputPath) {
		if (inputPath !== ".") return inputPath;
		inputPath = resolve(".");
		return findRoot(resolve(inputPath, "x"))(function (root) {
			if (root !== inputPath) return inputPath;
			return readdir(inputPath, {
				type: { file: true, directory: true },
				ignoreRules: ["git", "tad"]
			})
				.map(function (name) {
					var filename = resolve(inputPath, name);
					return stat(resolve(inputPath, name))(function (stats) {
						if (stats.isDirectory()) {
							if (name === "node_modules") return null;
							if (name === "bin") return null;
							if (name === "test") return null;
							if (name === "examples") return null;
							return filename;
						}
						if (name[0] === ".") return null;
						if (extname(name) === ".js") return filename;
						return null;
					});
				})
				.invoke(compact);
		});
	})(function (paths) {
		return initSuite(flatten.call(paths), argv)(function (suite) {
			var suiteConsole = suite.console;
			process.on("exit", function () {
				if (suiteConsole.errored) process.exitCode = 2;
				else if (suiteConsole.failed) process.exitCode = 1;
			});
		});
	})
	.done();
