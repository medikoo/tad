'use strict';

var clone    = require('es5-ext/lib/Array/clone').call
  , curry    = require('es5-ext/lib/Function/curry');

module.exports = ee(exports = {
	init: function () {
		this.msg = [];
		this.passed = [];
		this.errored = [];
		this.failed = [];
		this.started = new Date;
		return this;
	},
	in: function (msg) {
		this.msg.push(msg);
	},
	out: function () {
		this.msg.pop();
	},
	log: function (type, data) {
		var o = { type: type, time: new Date, data: data, msg: clone(this.msg) };
		this.push(o);
		this[type + 'ed'].push(o);
		this.emit('test', o);
	}
});

exports.error = curry(exports.log, 'error');
exports.pass = curry(exports.log, 'pass');
exports.fail = curry(exports.log, 'fail');
