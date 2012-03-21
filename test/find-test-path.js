'use strict';

var path       = require('path')
  , normalize  = require('next/lib/path/normalize')
  , playground = __dirname + '/__playground'
  , file       = playground + '/lib/dir/file1.js'
  , dir        = playground + '/lib/dir/'
  , dir2       = playground + '/lib/dir'
  , subdir     = playground + '/lib/dir/subdir/';

module.exports = {
	"In lib": function (t, a, d) {
		t(normalize(playground + '/lib/dir/module.js')).then(function (tpath) {
			a(tpath, normalize(playground + '/test/dir/module.js'));
		}).end(d);
	},
	"In main": function (t, a, d) {
		t(normalize(playground + '/module.js')).then(function (tpath) {
			a(tpath, normalize(playground + '/test/module.js'));
		}).end(d);
	}
};
