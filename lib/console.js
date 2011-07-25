'use strict';

var sequence  = require('es5-ext/lib/Function/sequence')
  , curry     = require('es5-ext/lib/Function/curry')
  , bcall     = require('es5-ext/lib/Function/bind-call')
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

  , base      = require('./base')

  , atNewLine, getName, logger, o;

atNewLine = function () {
	return !log.length || peek(ctrim(peek(log)[0])) === '\n';
};

o = {
	init: function (showAll) {
		this.showAll = showAll;
		this.passed = 0;
		this.failed = 0;
		this.errored = 0;
		this.progress = interval(200, true);
		return this;
	},
	pass: function (name, log) {
		this.progress.restart();
		if (this.showAll) {
			pass(indent(format(log.time) + ' ✓  ' + name + '\n');
		} else {
			pass(atNewLine() ? (format(o.time) + ' ✓  ' + '.') : '.');
		}
	},
	fail: function () {
		var s, o;
		this.progress.restart();
		if (!atNewLine()) {
			write('\n');
		}
		s = format(o.time) + ' ✗  ';
		if (e.operator) {
			s += getName.call(this, e.message) + '\n';
			if (e.operator !== 'throws') {
				s += 'Expected: ' + e.expected + '\n' +
					'Actual:   ' + e.actual + '\n';
			}
			s += 'Operator: ' + e.operator + '\n';
		} else {
			s += getName.call(this) + '\n' + (e.stack || e) + '\n';
		}
		fail(indent(s));
	},
	error: function () {
		this.progress.restart();
	},
	end: function () {
		this.progress.stop();
	}
};

module.exports = function (showAll) {
	return Object.create(o).init(name, showAll);
};
