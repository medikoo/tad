'use strict';

var path     = require('path')
  , findRoot = require('next/lib/module/find-package-root')

  , resolve = path.resolve, sep = path.sep;

module.exports = function (tpath) {
	return findRoot(tpath)(function (root) {
		tpath = tpath.slice(root.length + 1).split(sep);
		if (tpath[0] === 'lib') {
			tpath.shift();
		}
		return resolve(root, 'test' + sep + tpath.join(sep));
	});
};
