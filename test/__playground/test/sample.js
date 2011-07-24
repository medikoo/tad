'use strict';

var testee = require('../lib/sample');

exports.test = function (t, a) {
	a(t, testee, "Succesful test");
};
