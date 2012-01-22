'use strict';

var findRoot  = require('deferred').promisify(require('next/lib/find-package-root'))
  , normalize = require('next/lib/path/normalize')
  , separator = require('next/lib/path/separator');

module.exports = function (tpath) {
	return findRoot(tpath)
	(function (root) {
		tpath = tpath.slice(root.length + 1).split(separator);
		if (tpath[0] === 'lib') {
			tpath.shift();
		}
		return normalize(root + '/test/' + tpath.join('/'));
	});
};
