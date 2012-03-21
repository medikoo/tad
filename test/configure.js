'use strict';

var findTestPath = require('../lib/find-test-path')
  , pg = __dirname + '/__playground/lib/';

module.exports = function (t, a, d) {
	var l, data, paths = [pg + 'module.js', '/wrong/path', pg + 'dir'];
	l = t(paths);
	data = [];
	l('data', function () {
		data.push(arguments);
	});
	l('end', function () {
		d({
			"File": function (t, a, d) {
				var o = data[0];
				a(o[0], paths[0], "Path");
				a(o[1], paths[0], "File");
				a(o[3], global, "Context");
				findTestPath(o[1])(function (p) {
					a(p, o[2], "Test path");
				}).end(d);
			},
			"Wrong path": function () {
				var o = data[1];
				a(o[0], paths[1], "Path");
				a.ok(o[1] instanceof Error, "Error");
			},
			"Directory": function () {
				a(data.length, 6, "Files length");
				return {
					"File #1": function (t, a, d) {
						var o = data[2];
						// console.log(o);
						a(o[0], paths[2], "Path");
						a(o[3], global, "Context");
						findTestPath(o[1])(function (p) {
							a(p, o[2], "Test path");
						}).end(d);
					},
					"File #2": function (t, a, d) {
						var o = data[5];
						a(o[0], paths[2], "Path");
						a(o[3], global, "Context");
						findTestPath(o[1])(function (p) {
							a(p, o[2], "Test path");
						}).end(d);
					}
				};
			}
		});
	});
};
