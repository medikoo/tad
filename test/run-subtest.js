'use strict';

var id = require('es5-ext/lib/Function/i')
  , logger = require('./__playground/logger')()
  , assert = require('../lib/assert2');

module.exports = function (t, a, d) {
	var inProgress = false;
	var test = t(id, {
		"Regular": function (x, y) {
			var o = {};
			a.ok(!inProgress, '1Progress');
			inProgress = true;
			a.equal(x, id, '1Testee');
			y(x(o), o, 'foo');
			a.deepEqual([logger[0].type, logger[0].data], ['pass', 'foo'], '1Logger');
			a.deepEqual(logger.scope, ['Regular'], '1Name');
			inProgress = false;
		},
		"Async": function (x, y, z) {
			var o = {};
			a.ok(!inProgress, '2Progress');
			inProgress = true;
			a.equal(x, id, '2Testee');
			y(x(o), o, 'bar');
			a.deepEqual([logger[1].type, logger[1].data], ['pass', 'bar'], '2Logger');
			a.deepEqual(logger.scope, ['Async'], '2Name');
			process.nextTick(function () {
				inProgress = false;
				z();
			});
		},
		"Async with pass": function (x, y, z) {
			a.ok(!inProgress, '3Progress');
			inProgress = true;
			process.nextTick(function () {
				z({
					"inner test": function (x, y) {
						a.deepEqual(logger.scope, ['Async with pass', 'inner test'], '3Name');
						inProgress = false;
					}
				});
			});
		},
		"Sync with pass": function (x, y) {
			a.ok(!inProgress, '4Progress');
			inProgress = true;
			a.deepEqual(logger.scope, ['Sync with pass'], '4Name');
			return {
				"inner other": function (x, y) {
					a.deepEqual(logger.scope, ['Sync with pass', 'inner other'], '4Name');
					inProgress = false;
				}
			};
		},
		"Nested": {
			"in nested": function (x, y) {
				a.ok(!inProgress, '5Progress');
				inProgress = true;
				a.deepEqual(logger.scope, ['Nested', 'in nested'], '5Name');
				inProgress = false;
			}
		}
	}, assert(logger), logger).then(function () {
		d();
	});
};
