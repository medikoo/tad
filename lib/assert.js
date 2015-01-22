'use strict';

var isFunction = require('es5-ext/function/is-function')
  , assign     = require('es5-ext/object/assign')
  , eq         = require('es5-ext/object/eq')
  , map        = require('es5-ext/object/map')
  , isRegExp   = require('es5-ext/reg-exp/is-reg-exp')
  , Assert     = require('test/assert').Assert

  , never, neverBind, throws, resolveMessage, wrapAssert
  , lineRe = /(\d+:\d+)\)$/
  , isErrorCode = RegExp.prototype.test.bind(/^[A-Z_]+$/);

require('./fix-test-utils');

never = function (message) {
	message = resolveMessage(message);
	this.fail({
		message: message,
		operator: "never"
	});
};

neverBind = function (message) { return never.bind(this, message); };

resolveMessage = function (message) {
	var stack, line, match;
	if (message != null) return message;
	stack = (new Error()).stack;
	if (!stack) return '';
	line = stack.split('\n')[3];
	if (!line) return '';
	match = line.match(lineRe);
	if (!match) return '';
	return '@' + match[1];
};

throws = function (block, err, message) {
	var threw = false, exception = null, failure;

	// If third argument is not provided and second argument is a string it
	// means that optional `Error` argument was not passed, so we shift
	// arguments.
	if (message === undefined) {
		if (!isFunction(err) && !isErrorCode(err)) {
			message = err;
			err = null;
		}
	}

	message = resolveMessage(message);

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

wrapAssert = function (assert, context) {
	return function (actual, expected, message) {
		return assert.call(context, actual, expected, resolveMessage(message));
	};
};

module.exports = function (logger) {
	var assert, getHeading;

	assert = new Assert({
		pass:  logger.pass.bind(logger),
		fail:  logger.fail.bind(logger),
		error: logger.error.bind(logger)
	});

	assert = assign(function (actual, expected, message) {
		message = resolveMessage(message);
		if (eq(actual, expected)) {
			this.pass(message);
			return;
		}
		this.fail({
			actual: actual,
			expected: expected,
			message: message,
			operator: "==="
		});
	}.bind(assert), map(Assert.prototype,
		function (method) { return method.bind(assert); }));

	assert.strictEqual = assert;
	assert.not = assert.notStrictEqual = function (actual, expected, message) {
		message = resolveMessage(message);
		if (!eq(actual, expected)) {
			this.pass(message);
			return;
		}
		this.fail({
			actual: actual,
			expected: expected,
			message: message,
			operator: "!=="
		});
	};
	assert.deep = assert.deepEqual = wrapAssert(assert.deepEqual, assert);
	assert.notDeep = assert.notDeepEqual = wrapAssert(assert.notDeepEqual, assert);
	assert.never = never.bind(assert);
	assert.never.bind = neverBind.bind(assert);
	assert.throws = throws.bind(assert);

	getHeading = function (level) {
		return function (msg) {
			var index = level - 1 + logger.closure;
			if (!logger.msg.hasOwnProperty(index)) logger.msg[index] = undefined;
			logger.msg.splice(index, Infinity, msg);
		};
	};

	assert.h1 = getHeading(1);
	assert.h2 = getHeading(2);
	assert.h3 = getHeading(3);
	assert.h4 = getHeading(4);
	assert.h5 = getHeading(5);
	assert.h6 = getHeading(6);

	return assert;
};
