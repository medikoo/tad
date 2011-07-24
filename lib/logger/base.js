'use strict';

var clone    = require('es5-ext/lib/Array/clone').call
  , curry    = require('es5-ext/lib/Function/curry')
  , trimSame = require('es5-ext/lib/String/trim-same-left')
  , interval = require('clock/lib/interval');

module.exports = exports = {
	init: function () {
		this.scope = [];
		this.passed = [];
		this.errored = [];
		this.failed = [];
		this.progress = interval(200);
		this.initialized = new Date;
		return this;
	},
	start: function (name) {
		this.started = new Date;
		if (!this.scope.length && this.context) {
			name = trimSame(name, this.context);
		}
		this.scope.push(name);
		this.progress.start();
	},
	end: function () {
		this.scope.pop();
		this.progress.stop();
	},
	in: function (name) {
		this.scope.push(name);
		this.progress.start();
	},
	out: function () {
		this.scope.pop();
		this.progress.stop();
	},
	log: function (type, data) {
		var o = { type: type, time: new Date, data: data, scope: clone(this.scope) };
		if (this.progress.running) {
			this.progress.restart();
		}
		this.push(o);
		this[type + 'ed'].push(o);
		return o;
	},
	summarize: function () {
	}
};

exports.error = curry(exports.log, 'error');
exports.pass = curry(exports.log, 'pass');
exports.fail = curry(exports.log, 'fail');
