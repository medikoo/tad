'use strict';

var extend = require('es5-ext/lib/Object/extend')
  , map    = require('es5-ext/lib/Object/map')
  , Assert = require('test/assert').Assert

  , never, neverBind;

never = function (message) {
	this.fail({
		message: message,
		operator: "never"
	});
};

neverBind = function (message) {
	return never.bind(this, message);
};

module.exports = function (logger) {

	var assert = new Assert({
		pass:  logger.pass.bind(logger),
		fail:  logger.fail.bind(logger),
		error: logger.error.bind(logger)
	});

	assert = extend(assert.strictEqual.bind(assert),
		map(Assert.prototype, function (method) { return method.bind(assert); }));

	assert.not       = assert.notStrictEqual;
	assert.deep      = assert.deepEqual;
	assert.notDeep   = assert.notDeepEqual;
	assert.never     = never.bind(assert);
	assert.never.bind = neverBind.bind(assert);

	return assert;
};
