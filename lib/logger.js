'use strict';

var clone    = require('es5-ext/lib/Array/clone').call
  , curry    = require('es5-ext/lib/Function/curry').call
  , merge    = require('es5-ext/lib/Object/merge').call
  , ee    = require('event-emitter');

var o = ee(exports = {
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
		this.emit('data', o);
	},
	end: function () {
		this.emit('end');
	}
});

o.error = curry(o.log, 'error');
o.pass = curry(o.log, 'pass');
o.fail = curry(o.log, 'fail');

module.exports = function () {
	return merge([], o).init();
};
