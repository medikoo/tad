'use strict';

var flatten    = require('es5-ext/lib/List/flatten').call
  , findTests  = require('../lib/get-test-path')

  , playground = __dirname + '/__playground';

module.exports = {
	"File": function (t, a, d) {
		var file = playground + '/lib/dir/file1.js';
		findTests(file).then(function (tpath) {
			return t(file, tpath).then(function (result) {
				a.deepEqual(flatten(result), [file, tpath + '/file1.js']); d();
			});
		}).end();
	},
	"Non JS File": function (t, a, d) {
		var file = playground + '/lib/dir/file3.txt';
		findTests(file).then(function (tpath) {
			return t(file, tpath).then(function (result) {
				a.deepEqual(result, []); d();
			});
		}).end();
	},
	"Dir": function (t, a, d) {
		var dir = playground + '/lib/dir/';
		findTests(dir).then(function (tpath) {
			return t(dir, tpath).then(function (result) {
				a.deepEqual(flatten(result), [
					playground + '/lib/dir/file1.js', playground + '/test/dir/file1.js',
					playground + '/lib/dir/file2.js', playground + '/test/dir/file2.js',
					playground + '/lib/dir/subdir/subfile1.js',
					playground + '/test/dir/subdir/subfile1.js'
				]); d();
			});
		}).end();
	}
};