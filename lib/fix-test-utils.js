// Temporary fix for https://github.com/Gozala/test-commonjs/pull/8

"use strict";

var utils = require("test/utils");

var instanceOf;

try {
	if (utils.instanceOf) utils.instanceOf(Object.create(null), Date);
} catch (e) {
	instanceOf = utils.instanceOf = function (value, Type) {
		var valueConstructor
		  , isConstructorNameSame
		  , isConstructorSourceSame
		  , isInstanceOf = value instanceof Type;

		if (!isInstanceOf && value) {
			valueConstructor = value.constructor;
			isConstructorNameSame = valueConstructor && valueConstructor.name === Type.name;
			isConstructorSourceSame = String(valueConstructor) === String(Type);
			isInstanceOf =
				(isConstructorNameSame && isConstructorSourceSame) ||
				instanceOf(Object.getPrototypeOf(value), Type);
		}
		return isInstanceOf;
	};

	utils.isDate = function (value) { return utils.isObject(value) && instanceOf(value, Date); };

	utils.isRegExp = function (value) { return instanceOf(value, RegExp); };
}
