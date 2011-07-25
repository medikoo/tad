'use strict';

var Assert = require('test/assert').Assert
  , bindMethods = require('es5-ext/lib/Object/bind-methods').call
  , merge  = require('es5-ext/lib/Object/plain/merge').call;

module.exports = function (logger) {

	var assert = new Assert({
		pass:  logger.pass.bind(logger),
		fail:  logger.fail.bind(logger),
		error: logger.error.bind(logger)
	});

	assert = bindMethods(assert.strictEqual.bind(assert),
		assert, Assert.prototype);

	assert.not     = assert.notStrictEqual;
	assert.deep    = assert.deepEqual;
	assert.notDeep = assert.notDeepEqual;

	return assert;
};
