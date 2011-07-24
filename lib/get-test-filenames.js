'use strict';

var invoke   = require('es5-ext/lib/Function/invoke')
  , ba2p     = require('deferred/lib/async-to-promise').bind
  , getFiles = ba2p(require('next/lib/fs/readdir-files-deep'))
  , trim     = require('next/lib/path/trim')
  , stat     = ba2p(require('fs').stat);

module.exports = function (cpath, tpath) {
	cpath = trim(cpath);
	tpath = trim(tpath);
	return stat(cpath).then(function (stats) {
		if (stats.isFile()) {
			return (cpath.slice(-3) === '.js') ? [[cpath, tpath]] : [];
		} else if (stats.isDirectory()) {
			return getFiles(cpath)
				.then(invoke('filter', function (file) {
					return file.slice(-3) === '.js';
				}))
				.then(invoke('map', function (file) {
					return [cpath + '/' + file, tpath + '/' + file];
				}));
		} else {
			throw new Error("Given path doesn't point path or directory");
		}
	});
};
