'use strict';

var findRoot = require('deferred')
	.promisify(require('next/lib/find-package-root'));

module.exports = function (tpath) {
	return findRoot(tpath)
	(function (root) {
		tpath = tpath.slice(root.length + 1).split('/');
		if (tpath[0] === 'lib') {
			tpath.shift();
		}
		return root + '/test/' + tpath.join('/');
	});
};
