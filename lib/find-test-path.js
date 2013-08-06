'use strict';

var path         = require('path')
  , findRoot     = require('next/lib/module/find-package-root')
  , requireFirst = require('next/lib/module/require-silent')(
	require('next/lib/module/require-first-in-tree')
)

  , resolve = path.resolve, sep = path.sep;

module.exports = function (tpath) {
	return findRoot(tpath)(function (root) {
		var e, conf;
		tpath = tpath.slice(root.length + 1).split(sep);
		if (tpath[0] === 'lib') {
			tpath.shift();
		} else if (tpath[0] === 'test') {
			e = new Error("Input seems to be a test file");
			e.type = 'testfile';
			throw e;
		}
		tpath = resolve(root, 'test' + sep + tpath.join(sep));
		conf = requireFirst('__tad', tpath, root);
		if (conf && conf.ignore) return null;
		return tpath;
	});
};
