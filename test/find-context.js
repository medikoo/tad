'use strict';

var pg = __dirname + '/__playground';

module.exports = {
	"Default": function (t, a, d) {
		t('ignore', pg + '/test/module.js')
		(function (context) {
			a(context, global); d();
		}, d).end();
	},
	"Custom": {
		"": function (t, a, d) {
			var path = pg + '/test/context/';
			t('ignore', path + 'module.js')
			(function (context) {
				a(context.x, require(path + '__tad').context.x); d();
			}, d).end();
		},
		"Nested": function (t, a, d) {
			var path = pg + '/test/context/context/', o = { x: {} };
			t(o, path + 'module.js')
			(function (context) {
				a(context.x, require(path + '__tad').context(o).x); d();
			}, d).end();
		},
		"Nested fallback": function (t, a, d) {
			var path = pg + '/test/context/';
			t('ignore', path + '/dir/module.js')
			(function (context) {
				a(context.x, require(path + '__tad').context.x); d();
			}, d).end();
		}
	}
};
