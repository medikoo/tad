'use strict';

var sequence  = require('es5-ext/lib/Function/sequence')
  , curry     = require('es5-ext/lib/Function/curry').call
  , callBind  = require('es5-ext/lib/Function/call-bind')
  , flog      = require('es5-ext/lib/Function/log').call
  , peek      = require('es5-ext/lib/List/peek').call
  , indent    = callBind(curry(require('es5-ext/lib/String/indent').call(' '),
		17, true))
  , format    = require('es5-ext/lib/Date/format')('%H:%M:%S.%L ').call
  , duration  = require('es5-ext/lib/Date/duration').call
  , dpad      = require('es5-ext/lib/String/pad').call(' ', 12).call
  , interval  = require('clock/lib/interval')

  , write     = process.stdout.write.bind(process.stdout)

  , clc       = require('cli-color')
  , ctrim     = require('cli-color/lib/trim')
  , cthrobber = require('cli-color/lib/throbber')
  , lerror    = clc.magenta
  , lfail     = clc.red
  , lpass     = clc.green
  , lsummary  = clc.cyan

  , o;

o = {
	init: function (options) {
		this.mode = options.a ? 2 : (options.m ? 0 : 1);
		this.passed = 0;
		this.failed = 0;
		this.errored = 0;
		this.started = new Date;
		this.writeLog = [];
		this.write = flog(write, this.writeLog);
		cthrobber(this.progress = interval(200, true));
		return this;
	},
	atNewLine: function () {
		return !this.writeLog.length ||
			peek(ctrim(peek(this.writeLog)[0])) === '\n';
	},
	break: function () {
		this.progress.restart();
		if (!this.atNewLine() && this.mode) {
			this.write('\n');
		}
	},
	pass: function (path, name) {
		++this.passed;
		this.progress.restart();
		if (this.mode === 2) {
			this.write(lpass(indent(format(new Date) + ' ✓  ' + name + '\n')));
		} else {
			this.write(lpass(this.atNewLine() ? (format(new Date) + ' ✓  '
				+ ((path && this.mode) ? path + ' ' : '') + '.') : '.'));
		}
	},
	fail: function (path, name, e) {
		var s, o;
		++this.failed;
		this.progress.restart();
		if (!this.atNewLine()) {
			this.write('\n');
		}
		s = format(new Date) + ' ✗  ' + name + '\n';
		if (e.operator) {
			if (e.hasOwnProperty('expected')) {
				s += 'Expected: ' + e.expected + '\n';
			}
			if (e.hasOwnProperty('actual')) {
				s += 'Actual:   ' + e.actual + '\n';
			}
			s += 'Operator: ' + e.operator + '\n';
		} else {
			s += (e.stack || e) + '\n';
		}
		this.write(lfail(indent(s)));
	},
	error: function (path, name, e) {
		++this.errored;
		this.progress.restart();
		if (!this.atNewLine()) {
			this.write('\n');
		}
		name = name ? name : path;
		this.write(lerror(indent(format(new Date) + ' -  '
			+ (name ? name + '\n' : '') + (e.stack || e)) + '\n'));
	},
	end: function () {
		var s, all = this.passed + this.failed + this.errored;
		this.progress.stop();
		if (!this.atNewLine()) {
			this.write('\n');
		}
		this.write('\n');
		if (!all) {
			this.write(lsummary('No tests run\n\n'));
		} else {
			this.write(lsummary(dpad(duration(this.started, new Date).toString())
				+ '     '));
			s = [];
			s.push(clc.green(this.passed + ' Ok [' +
				((this.passed/all)*100).toFixed(2) + '%]'));
			if (this.failed) {
				s.push(clc.red(this.failed + ' Failed'));
			}
			if (this.errored) {
				s.push(clc.magenta(this.errored + ' Errors'));
			}
			this.write(s.join('  ') + '\n\n');
		}
	}
};

module.exports = function (options) {
	return Object.create(o).init(options || {});
};
