'use strict';

var ba2p     = require('deferred/lib/async-to-promise').bind
  , findRoot = ba2p(require('next/lib/find-package-root'));

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
