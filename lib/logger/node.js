'use strict';

var sequence  = require('es5-ext/lib/Function/sequence')
  , curry     = require('es5-ext/lib/Function/curry')
  , bcall     = require('es5-ext/lib/Function/bind-call')
  , flog      = require('es5-ext/lib/Function/log')
  , peek      = require('es5-ext/lib/List/peek').call
  , extend    = require('es5-ext/lib/Object/extend').call
  , mergeDeep = require('es5-ext/lib/Object/merge-deep').call
  , indent    = bcall(curry(require('es5-ext/lib/String/indent').call(' '),
		17, true))
  , format    = require('es5-ext/lib/Date/format')('%H:%M:%S.%L ').call
  , duration  = require('es5-ext/lib/Date/duration').call
  , dpad      = require('es5-ext/lib/String/pad').call(' ', 12).call

  , log       = []
  , write     = flog(process.stdout.write.bind(process.stdout), log)

  , clc       = require('cli-color')
  , ctrim     = require('cli-color/lib/trim')
  , cthrobber = require('cli-color/lib/throbber')
  , error     = sequence(clc.magenta, write)
  , fail      = sequence(clc.red, write)
  , pass      = sequence(clc.green, write)
  , summary   = sequence(clc.cyan, write)

  , base      = require('./base')

  , atNewLine, getName, logger;

getName = function (msg) {
	return this.scope.concat(msg).filter(Boolean).join(": ") || '.';
};

atNewLine = function () {
	return !log.length || peek(ctrim(peek(log)[0])) === '\n';
};

logger = extend(base, {
	init: function (_super, showAll) {
		_super(this);
		this.showAll = showAll;
		cthrobber(this.progress);
		return this;
	},
	summarize: function () {
		var s;
		if (!atNewLine()) {
			write('\n');
		}
		write('\n');
		if (!this.length) {
			summary('No tests run\n\n');
		} else {
			summary(dpad(duration(this.initialized, new Date).toString())
				+ '     ');
			s = [];
			s.push(clc.green(this.passed.length + ' Ok [' +
				Math.round((this.passed.length/this.length)*100) + '%]'));
			if (this.failed.length) {
				s.push(clc.red(this.failed.length + ' Failed'));
			}
			if (this.errored.length) {
				s.push(clc.magenta(this.errored.length + ' Errors'));
			}
			write(s.join('  ') + '\n\n');
		}
	},
	error: function (_super, e) {
		var o = _super(this, e);
		if (!atNewLine()) {
			write('\n');
		}
		error(indent(format(o.time) + ' -  ' + (e.stack || e)) + '\n');
	},
	pass: function (_super, msg) {
		var o = _super(this, msg);
		if (this.showAll) {
			pass(indent(format(o.time) + ' ✓  ' + getName.call(this, msg)) + '\n');
		} else {
			pass(atNewLine() ? (format(o.time) + ' ✓  ' + '.') : '.');
		}
	},
	fail: function (_super, e) {
		var s, o;
		o = _super(this, e);
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
	}
});

module.exports = function (showAll) {
	return mergeDeep([], logger).init(showAll);
};
