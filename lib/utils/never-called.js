'use strict';

var bindBind = require('es5-ext/lib/Function/bind-bind');

module.exports = bindBind(function (message) {
	this.ifError(new Error(
		"This should never be called" + (message ? ": " + message : "")));
});
