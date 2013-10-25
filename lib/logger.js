'use strict';

var aFrom   = require('es5-ext/array/from')
  , partial = require('es5-ext/function/#/partial')
  , mixin   = require('es5-ext/object/mixin')
  , ee      = require('event-emitter')

  , o;

o = ee(exports = {
	init: function () {
		this.msg = [];
		this.closure = 0;
		this.passed = [];
		this.errored = [];
		this.failed = [];
		this.started = new Date();
		return this;
	},
	in: function (msg, closure) {
		this.msg.push(msg);
		if (closure) ++this.closure;
	},
	out: function (closure) {
		this.msg.pop();
		if (closure) --this.closure;
	},
	log: function (type, data) {
		var o = { type: type, time: new Date(), data: data, msg: aFrom(this.msg) };
		this.push(o);
		this[type + 'ed'].push(o);
		this.emit('data', o);
	},
	end: function () {
		this.emit('end');
	}
});

o.log.partial = partial;
o.error = o.log.partial('error');
o.pass = o.log.partial('pass');
o.fail = o.log.partial('fail');

module.exports = function () {
	return mixin([], o).init();
};
