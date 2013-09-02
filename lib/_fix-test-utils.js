// Temporary fix for https://github.com/Gozala/test-commonjs/pull/8

'use strict';

var utils = require('test/utils')

  , instanceOf;

instanceOf = utils.instanceOf = function (value, Type) {
	var constructor, isConstructorNameSame, isConstructorSourceSame
	  , isInstanceOf = value instanceof Type;

	// If `instanceof` returned `false` we do ducktype check since `Type` may be
	// from a different sandbox. If a constructor of the `value` or a constructor
	// of the value"s prototype has same name and source we assume that it"s an
	// instance of the Type.
	if (!isInstanceOf && value) {
		constructor = value.constructor;
		isConstructorNameSame = constructor && (constructor.name === Type.name);
		isConstructorSourceSame = String(constructor) === String(Type);
		isInstanceOf = (isConstructorNameSame && isConstructorSourceSame) ||
			instanceOf(Object.getPrototypeOf(value), Type);
	}
	return isInstanceOf;
};

utils.isDate = function (value) {
	return utils.isObject(value) && instanceOf(value, Date);
};

utils.isRegExp = function (value) { return instanceOf(value, RegExp); };
