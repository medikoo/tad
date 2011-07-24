'use strict';

var merge  = require('es5-ext/lib/Object/merge').call
  , logger = require('../../lib/logger/base');

module.exports = function () {
	return merge([], logger).init();
};
