'use strict';

var defineProperty = Object.defineProperty
  , copy           = require('es5-ext/lib/Array/prototype/copy')
  , curry          = require('es5-ext/lib/Function/prototype/curry')
  , v              = require('es5-ext/lib/Object/descriptors/v')
  , merge          = require('es5-ext/lib/Object/merge').call
  , ee             = require('event-emitter');

var o = ee(exports = {
	init: function () {
		this.msg = defineProperty([], 'copy', v(copy));
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
		var o = { type: type, time: new Date, data: data, msg: this.msg.copy() };
		this.push(o);
		this[type + 'ed'].push(o);
		this.emit('data', o);
	},
	end: function () {
		this.emit('end');
	}
});

o.log.curry = curry;
o.error = o.log.curry('error');
o.pass = o.log.curry('pass');
o.fail = o.log.curry('fail');

module.exports = function () {
	return merge([], o).init();
};
