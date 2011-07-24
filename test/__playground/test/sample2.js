'use strict';

var testee = require('../lib/sample2');

exports.test = function (t, a) {
	a(t, testee, "Succesful test");
};
