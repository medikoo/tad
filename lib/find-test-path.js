'use strict';

var resolve  = require('path').resolve
  , findRoot =
	require('deferred').promisify(require('next/lib/find-package-root'))
  , sep      = require('next/lib/path/sep');

module.exports = function (tpath) {
	return findRoot(tpath)(function (root) {
		tpath = tpath.slice(root.length + 1).split(sep);
		if (tpath[0] === 'lib') {
			tpath.shift();
		}
		return resolve(root, 'test' + sep + tpath.join(sep));
	});
};
