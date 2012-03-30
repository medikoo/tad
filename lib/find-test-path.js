'use strict';

var resolve = require('path').resolve
  , findRoot  = require('deferred')
	.promisify(require('next/lib/find-package-root'))
  , separator = require('next/lib/path/separator');

module.exports = function (tpath) {
	return findRoot(tpath)(function (root) {
		tpath = tpath.slice(root.length + 1).split(separator);
		if (tpath[0] === 'lib') {
			tpath.shift();
		}
		return resolve(root, 'test' + separator + tpath.join(separator));
	});
};
