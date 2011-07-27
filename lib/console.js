'use strict';

var sequence  = require('es5-ext/lib/Function/sequence')
  , curry     = require('es5-ext/lib/Function/curry')
  , bcall     = require('es5-ext/lib/Function/bind-call')
  , flog      = require('es5-ext/lib/Function/log')
  , peek      = require('es5-ext/lib/List/peek').call
  , indent    = bcall(curry(require('es5-ext/lib/String/indent').call(' '),
		17, true))
  , format    = require('es5-ext/lib/Date/format')('%H:%M:%S.%L ').call
  , duration  = require('es5-ext/lib/Date/duration').call
  , dpad      = require('es5-ext/lib/String/pad').call(' ', 12).call
  , interval  = require('clock/lib/interval')

  , log       = []
  , write     = flog(process.stdout.write.bind(process.stdout), log)

  , clc       = require('cli-color')
  , ctrim     = require('cli-color/lib/trim')
  , cthrobber = require('cli-color/lib/throbber')
  , lerror     = sequence(clc.magenta, write)
  , lfail      = sequence(clc.red, write)
  , lpass      = sequence(clc.green, write)
  , lsummary   = sequence(clc.cyan, write)

  , atNewLine, o;

atNewLine = function () {
	return !log.length || peek(ctrim(peek(log)[0])) === '\n';
};

o = {
	init: function (showAll) {
		this.showAll = showAll;
		this.passed = 0;
		this.failed = 0;
		this.errored = 0;
		this.started = new Date;
		cthrobber(this.progress = interval(200, true));
		return this;
	},
	break: function () {
		this.progress.restart();
		if (!atNewLine()) {
			write('\n');
		}
	},
	pass: function (path, name) {
		++this.passed;
		this.progress.restart();
		if (this.showAll) {
			lpass(indent(format(new Date) + ' ✓  ' + name + '\n'));
		} else {
			lpass(atNewLine() ? (format(new Date) + ' ✓  ' + (path ? path + ' ' : '')
				+ '.') : '.');
		}
	},
	fail: function (path, name, e) {
		var s, o;
		++this.failed;
		this.progress.restart();
		if (!atNewLine()) {
			write('\n');
		}
		s = format(new Date) + ' ✗  ' + name + '\n';
		if (e.operator) {
			if (e.operator !== 'throws') {
				s += 'Expected: ' + e.expected + '\n' +
					'Actual:   ' + e.actual + '\n';
			}
			s += 'Operator: ' + e.operator + '\n';
		} else {
			s += (e.stack || e) + '\n';
		}
		lfail(indent(s));
	},
	error: function (path, name, e) {
		++this.errored;
		this.progress.restart();
		if (!atNewLine()) {
			write('\n');
		}
		name = name ? name : path;
		lerror(indent(format(new Date) + ' -  ' + (name ? name + '\n' : '')
			+ (e.stack || e)) + '\n');
	},
	end: function () {
		var s, all = this.passed + this.failed + this.errored;
		this.progress.stop();
		if (!atNewLine()) {
			write('\n');
		}
		write('\n');
		if (!all) {
			lsummary('No tests run\n\n');
		} else {
			lsummary(dpad(duration(this.started, new Date).toString())
				+ '     ');
			s = [];
			s.push(clc.green(this.passed + ' Ok [' +
				Math.round((this.passed/all)*100) + '%]'));
			if (this.failed) {
				s.push(clc.red(this.failed + ' Failed'));
			}
			if (this.errored) {
				s.push(clc.magenta(this.errored + ' Errors'));
			}
			write(s.join('  ') + '\n\n');
		}
	}
};

module.exports = function (showAll) {
	return Object.create(o).init(showAll);
};
