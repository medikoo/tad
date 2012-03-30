'use strict';

var defineProperty = Object.defineProperty
  , copy           = require('es5-ext/lib/Array/prototype/copy')
  , partial        = require('es5-ext/lib/Function/prototype/partial')
  , dcr            = require('es5-ext/lib/Object/descriptor')
  , merge          = require('es5-ext/lib/Object/merge-properties')
  , ee             = require('event-emitter');

var o = ee(exports = {
	init: function () {
		this.msg = defineProperty([], 'copy', dcr.v(copy));
		this.passed = [];
		this.errored = [];
		this.failed = [];
		this.started = new Date();
		return this;
	},
	in: function (msg) {
		this.msg.push(msg);
	},
	out: function () {
		this.msg.pop();
	},
	log: function (type, data) {
		var o = { type: type, time: new Date(), data: data, msg: this.msg.copy() };
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
	return merge([], o).init();
};
