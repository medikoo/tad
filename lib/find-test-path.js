'use strict';

var ba2p           = require('deferred/lib/async-to-promise').bind
  , getPackageRoot = ba2p(require('next/lib/get-package-root'));

module.exports = function (tpath) {
	return getPackageRoot(tpath)
	(function (root) {
		tpath = tpath.slice(root.length + 1).split('/');
		if (tpath[0] === 'lib') {
			tpath.shift();
		}
		return root + '/test' + tpath.join('/');
	});
};
