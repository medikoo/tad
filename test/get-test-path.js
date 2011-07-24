'use strict';

var path       = require('path')
  , playground = __dirname + '/__playground'
  , file       = playground + '/lib/dir/file1.js'
  , dir        = playground + '/lib/dir/'
  , dir2       = playground + '/lib/dir'
  , subdir     = playground + '/lib/dir/subdir/';

module.exports = {
	"File": function (t, a, d) {
		t(file).then(function (tpath) {
			a.equal(tpath, playground + '/test/dir/file1.js'); d();
		}).end();
	},
	"Lib dir": function (t, a, d) {
		t(playground + '/lib').then(function (tpath) {
			a.equal(tpath, playground + '/test'); d();
		}).end();
	},
	"Directory": function (t, a, d) {
		t(dir).then(function (tpath) {
			a.equal(tpath, playground + '/test/dir'); d();
		}).end();
	},
	"Directory #2": function (t, a, d) {
		t(dir2).then(function (tpath) {
			a.equal(tpath, playground + '/test/dir'); d();
		}).end();
	},
	"Subdirectory": function (t, a, d) {
		t(subdir).then(function (tpath) {
			a.equal(tpath, playground + '/test/dir/subdir'); d();
		}).end();
	}
};
