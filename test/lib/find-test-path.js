"use strict";

var resolve = require("path").resolve

  , playground = resolve(__dirname, "../__playground");

module.exports = {
	"In lib": function (t, a, d) {
		t(resolve(playground, "lib/dir/module.js")).then(function (tpath) {
			a(tpath, resolve(playground, "test/lib/dir/module.js"));
		}).done(d);
	},
	"In main": function (t, a, d) {
		t(resolve(playground, "module.js")).then(function (tpath) {
			a(tpath, resolve(playground, "test/module.js"));
		}).done(d);
	}
};
