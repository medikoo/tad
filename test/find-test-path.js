'use strict';

var path       = require('path')
  , playground = __dirname + '/__playground'
  , file       = playground + '/lib/dir/file1.js'
  , dir        = playground + '/lib/dir/'
  , dir2       = playground + '/lib/dir'
  , subdir     = playground + '/lib/dir/subdir/';

module.exports = {
	"In lib": function (t, a, d) {
		t(playground + '/lib/dir/file1.js').then(function (tpath) {
			a(tpath, playground + '/test/dir/file1.js'); d();
		}, d).end();
	},
	"In main": function (t, a, d) {
		t(playground + '/logger.js').then(function (tpath) {
			a(tpath, playground + '/test/logger.js'); d();
		}, d).end();
	}
};
