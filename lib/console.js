"use strict";

var call      = Function.prototype.call
  , partial   = require("es5-ext/function/#/partial")
  , last      = require("es5-ext/array/#/last")
  , indent    = call.bind(partial.call(require("es5-ext/string/#/indent"), " ", 17))
  , format    = call.bind(partial.call(require("es5-ext/date/#/format"), "%H:%M:%S.%L "))
  , dpad      = partial.call(require("es5-ext/string/#/pad"), " ", 12)
  , duration  = require("duration")
  , inspect   = require("util").inspect
  , clc       = require("cli-color")
  , ctrim     = require("cli-color/strip")
  , cthrobber = require("cli-color/throbber");

var write = process.stdout.write.bind(process.stdout)
  , lerror = clc.magenta
  , lfail = clc.red
  , lpass = clc.green
  , lsummary = clc.cyan
  , handler;

handler = {
	init: function (options) {
		if (options.a) this.mode = 2;
		else this.mode = options.m ? 0 : 1;
		this.passed = 0;
		this.failed = 0;
		this.errored = 0;
		this.started = new Date();
		this.writeLog = [];
		this.write = function (ignored) {
			this.writeLog.push(arguments);
			return write.apply(this, arguments);
		};
		this.progress = cthrobber(write, 200);
		return this;
	},
	atNewLine: function () {
		return !this.writeLog.length || last.call(ctrim(last.call(this.writeLog)[0])) === "\n";
	},
	break: function () {
		this.progress.restart();
		if (!this.atNewLine() && this.mode) {
			this.write("\n");
		}
	},
	pass: function (path, name) {
		++this.passed;
		this.progress.restart();
		if (this.mode === 2) {
			this.write(lpass(format(new Date()) + " ✓  " + name + "\n"));
		} else {
			this.write(
				lpass(
					this.atNewLine()
						? format(new Date()) + " ✓  " + (path && this.mode ? path + " " : "") + "."
						: "."
				)
			);
		}
	},
	fail: function (path, name, e) {
		var message;
		++this.failed;
		this.progress.restart();
		if (!this.atNewLine()) {
			this.write("\n");
		}
		message = "";
		if (e.operator) {
			if (hasOwnProperty.call(e, "expected")) {
				message += "Expected: " + inspect(e.expected, false, 1) + "\n";
			}
			if (hasOwnProperty.call(e, "actual")) {
				message += "Actual:   " + inspect(e.actual, false, 1) + "\n";
			}
			message += "Operator: " + e.operator + "\n";
		} else {
			message += (e.stack || e) + "\n";
		}
		this.write(lfail(format(new Date()) + " ✗  " + name + "\n" + indent(message)));
	},
	error: function (path, name, e) {
		var message, eStr, index;
		++this.errored;
		this.progress.restart();
		if (!this.atNewLine()) {
			this.write("\n");
		}
		name = name || path;
		message = format(new Date()) + " -  ";
		eStr = String(e.stack || e);
		if (name) {
			message += name + "\n" + indent(eStr);
		} else {
			index = eStr.indexOf("\n") + 1;
			message += index ? eStr.slice(0, index) + indent(eStr.slice(index)) : eStr;
		}
		this.write(lerror(message + "\n"));
	},
	end: function () {
		var message, all = this.passed + this.failed + this.errored;
		this.progress.stop();
		if (!this.atNewLine()) {
			this.write("\n");
		}
		this.write("\n");
		if (all) {
			this.write(
				lsummary(dpad.call(duration(this.started, new Date()).toString()) + "     ")
			);
			message = [];
			message.push(
				clc.green(this.passed + " Ok [" + ((this.passed / all) * 100).toFixed(2) + "%]")
			);
			if (this.failed) {
				message.push(clc.red(this.failed + " Failed"));
			}
			if (this.errored) {
				message.push(clc.magenta(this.errored + " Errors"));
			}
			this.write(message.join("  ") + "\n\n");
		} else {
			this.write(lsummary("No tests run\n\n"));
		}
	}
};

module.exports = function (options) { return Object.create(handler).init(options || {}); };
