"use strict";

var aFrom   = require("es5-ext/array/from")
  , partial = require("es5-ext/function/#/partial")
  , mixin   = require("es5-ext/object/mixin")
  , ee      = require("event-emitter");

var logger;

logger = ee(
	exports = {
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
			var result = { type: type, time: new Date(), data: data, msg: aFrom(this.msg) };
			this.push(result);
			this[type + "ed"].push(result);
			this.emit("data", result);
		},
		end: function () {
			this.emit("end");
		}
	}
);

logger.log.partial = partial;
logger.error = logger.log.partial("error");
logger.pass = logger.log.partial("pass");
logger.fail = logger.log.partial("fail");

module.exports = function () {
	return mixin([], logger).init();
};
