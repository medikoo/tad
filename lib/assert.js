'use strict';

var Assert = require('test/assert').Assert
  , bindMethods = require('es5-ext/lib/Object/bind-methods').call
  , merge  = require('es5-ext/lib/Object/plain/merge').call

  , never, passNever;

never = function (message) {
	this.fail({
		message: message,
		operator: "never"
	});
};

passNever = function (message) {
	return never.bind(this, message);
};

module.exports = function (logger) {

	var assert = new Assert({
		pass:  logger.pass.bind(logger),
		fail:  logger.fail.bind(logger),
		error: logger.error.bind(logger)
	});

	assert = bindMethods(assert.strictEqual.bind(assert),
		assert, Assert.prototype);

	assert.not       = assert.notStrictEqual;
	assert.deep      = assert.deepEqual;
	assert.notDeep   = assert.notDeepEqual;
	assert.never     = never.bind(assert);
	assert.passNever = passNever.bind(assert);

	return assert;
};
