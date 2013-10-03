'use strict';

var isFunction = require('es5-ext/function/is-function')
  , assign     = require('es5-ext/object/assign')
  , map        = require('es5-ext/object/map')
  , isRegExp   = require('es5-ext/reg-exp/is-reg-exp')
  , Assert     = require('test/assert').Assert

  , never, neverBind, throws;

require('./_fix-test-utils');

never = function (message) {
	this.fail({
		message: message,
		operator: "never"
	});
};

neverBind = function (message) { return never.bind(this, message); };

throws = function (block, err, message) {
	var threw = false, exception = null, failure;

	// If third argument is not provided and second argument is a string it
	// means that optional `Error` argument was not passed, so we shift
	// arguments.
	if (message == null) {
		message = err;
		err = null;
	}

	// Executing given `block`.
	try {
		block();
	} catch (e) {
		threw = true;
		exception = e;
	}

	// If exception was thrown and `Error` argument was not passed assert is
	// passed.
	if (threw && ((err == null) ||
		// If Error is thrown exception
		(err === exception) ||
		// If passed `Error` is RegExp using it's test method to
		// assert thrown exception message.
		(isRegExp(err) && err.test(exception.message)) ||
		// If passed `Error` is a constructor function testing if
		// thrown exception is an instance of it.
		(isFunction(err) && (exception instanceof err)) ||
		(err === exception.code))) {
		this.pass(message);

	// Otherwise we report assertion failure.
	} else {
		failure = {
			message: message,
			operator: "throws"
		};

		if (exception) failure.actual = exception;
		if (err) failure.expected = err;

		this.fail(failure);
	}
};

module.exports = function (logger) {

	var assert = new Assert({
		pass:  logger.pass.bind(logger),
		fail:  logger.fail.bind(logger),
		error: logger.error.bind(logger)
	});

	assert = assign(assert.strictEqual.bind(assert),
		map(Assert.prototype, function (method) { return method.bind(assert); }));

	assert.not        = assert.notStrictEqual;
	assert.deep       = assert.deepEqual;
	assert.notDeep    = assert.notDeepEqual;
	assert.never      = never.bind(assert);
	assert.never.bind = neverBind.bind(assert);
	assert.throws     = throws.bind(assert);

	return assert;
};
