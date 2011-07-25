'use strict';

var pg = __dirname + '/__playground';

module.exports = {
	"Default": function (t, a, d) {
		t('ignore', pg + '/test/sample.js')
		(function (context) {
			a(context, global); d();
		}).end();
	},
	"Custom": {
		"": function (t, a, d) {
			var path = pg + '/test/scope-test/dir/';
			t('ignore', path + 'sample.js')
			(function (context) {
				a(context, require(path + '__tad').context); d();
			}).end();
		},
		"Nested": function (t, a, d) {
			var path = pg + '/test/scope-test/dir/sub1/', o = {};
			t(o, path + 'sample.js')
			(function (context) {
				a(context, require(path + '__tad').context(o)); d();
			}).end();
		},
		"Nested fallback": function (t, a, d) {
			var path = pg + '/test/scope-test/dir/';
			t('ignore', path + '/sub2/sample.js')
			(function (context) {
				a(context, require(path + '__tad').context); d();
			}).end();
		},
		"Nested without setting": function (t, a, d) {
			var path = pg + '/test/scope-test/dir/';
			t('ignore', path + '/sub2/sub/sample.js')
			(function (context) {
				a(context, require(path + '__tad').context); d();
			}).end();
		}
	}
};
