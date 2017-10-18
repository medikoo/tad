"use strict";

var pg = require("path").resolve(__dirname, "../__playground");

module.exports = {
	Default: function (t, a, d) {
		t("ignore", pg + "/test/module.js")(function (context) {
			a(context, global);
		}).done(d);
	},
	Custom: {
		"": function (t, a, d) {
			var path = pg + "/test/context/";
			t("ignore", path + "module.js")(function (context) {
				a(context.x, require(path + "__tad").context.x);
			}).done(d);
		},
		"Nested": function (t, a, d) {
			var path = pg + "/test/context/context/", o = { x: {} };
			t(o, path + "module.js")(function (context) {
				a(context.x, require(path + "__tad").context(o).x);
			}).done(d);
		},
		"Nested fallback": function (t, a, d) {
			var path = pg + "/test/context/";
			t("ignore", path + "/dir/module.js")(function (context) {
				a(context.x, require(path + "__tad").context.x);
			}).done(d);
		}
	}
};
