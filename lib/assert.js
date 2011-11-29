'use strict';

var Assert = require('test/assert').Assert
  , bindMethods = require('es5-ext/lib/Object/prototype/bind-methods')
  , merge  = require('es5-ext/lib/Object/plain/merge').call

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

	assert = bindMethods.call(assert.strictEqual.bind(assert),
		assert, Assert.prototype);

	assert.not       = assert.notStrictEqual;
	assert.deep      = assert.deepEqual;
	assert.notDeep   = assert.notDeepEqual;
	assert.never     = never.bind(assert);
	assert.never.bind = neverBind.bind(assert);

	return assert;
};
