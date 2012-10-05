'use strict';

var call      = Function.prototype.call
  , partial   = require('es5-ext/lib/Function/prototype/partial')
  , wrap      = require('es5-ext/lib/Function/prototype/wrap')
  , last      = require('es5-ext/lib/Array/prototype/last')
  , indent    = call.bind(partial
		.call(require('es5-ext/lib/String/prototype/indent'), ' ', 17))
  , format    = call.bind(partial
		.call(require('es5-ext/lib/Date/prototype/format'), '%H:%M:%S.%L '))
  , dpad      = partial.call(require('es5-ext/lib/String/prototype/pad'),
		' ', 12)
  , duration  = require('duration')
  , interval  = require('clock/lib/interval')
  , inspect   = require('util').inspect
  , clc       = require('cli-color')
  , ctrim     = require('cli-color/lib/trim')
  , cthrobber = require('cli-color/lib/throbber')

  , slice = Array.prototype.slice
  , write = process.stdout.write.bind(process.stdout)
  , lerror = clc.magenta, lfail = clc.red, lpass = clc.green
  , lsummary = clc.cyan
  , o;

o = {
	init: function (options) {
		this.mode = options.a ? 2 : (options.m ? 0 : 1);
		this.passed = 0;
		this.failed = 0;
		this.errored = 0;
		this.started = new Date();
		this.writeLog = [];
		this.write = wrap.call(write, function (fn) {
			this.writeLog.push(slice.call(arguments, 1));
			return fn();
		});
		cthrobber(this.progress = interval(200, true));
		return this;
	},
	atNewLine: function () {
		return !this.writeLog.length ||
			last.call(ctrim(last.call(this.writeLog)[0])) === '\n';
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
			this.write(lpass(format(new Date()) + ' ✓  ' + name + '\n'));
		} else {
			this.write(lpass(this.atNewLine() ? (format(new Date()) + ' ✓  ' +
				((path && this.mode) ? path + ' ' : '') + '.') : '.'));
		}
	},
	fail: function (path, name, e) {
		var s;
		++this.failed;
		this.progress.restart();
		if (!this.atNewLine()) {
			this.write('\n');
		}
		s = '';
		if (e.operator) {
			if (e.hasOwnProperty('expected')) {
				s += 'Expected: ' + inspect(e.expected, false, 1) + '\n';
			}
			if (e.hasOwnProperty('actual')) {
				s += 'Actual:   ' + inspect(e.actual, false, 1) + '\n';
			}
			s += 'Operator: ' + e.operator + '\n';
		} else {
			s += (e.stack || e) + '\n';
		}
		this.write(lfail(format(new Date()) + ' ✗  ' + name + '\n' + indent(s)));
	},
	error: function (path, name, e) {
		var s, eStr, index;
		++this.errored;
		this.progress.restart();
		if (!this.atNewLine()) {
			this.write('\n');
		}
		name = name || path;
		s = format(new Date()) + ' -  ';
		eStr = e.stack || e;
		if (name) {
			s += name + '\n' + indent(eStr);
		} else {
			index = eStr.indexOf('\n') + 1;
			s += index ? (eStr.slice(0, index) + indent(eStr.slice(index))) : eStr;
		}
		this.write(lerror(s + '\n'));
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
			this.write(lsummary(dpad.call(duration(this.started,
				new Date()).toString()) + '     '));
			s = [];
			s.push(clc.green(this.passed + ' Ok [' +
				((this.passed / all) * 100).toFixed(2) + '%]'));
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
