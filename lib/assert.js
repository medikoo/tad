'use strict';

var concat = require('es5-ext/lib/List/concat').call
  , merge = require('es5-ext/lib/Object/plain/merge').call

  , o;

['deepEqual', 'equal', 'ifError', 'notDeepEqual', 'notEqual', 'notStrictEqual',
	'ok', 'strictEqual', 'throws'].forEach(function (key) {
		this[key] = function () {
			this.assert[key].apply(this.assert, concat(arguments, this.name));
		};
	}, o = {});

module.exports = function (assert, name) {
	return merge(Object.create(o), {
		assert: assert,
		name: name
	});
};
