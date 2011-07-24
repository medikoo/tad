'use strict';

var ba2p           = require('deferred/lib/async-to-promise').bind
  , getPackageRoot = ba2p(require('next/lib/get-package-root'))
  , trim           = require('next/lib/path/trim');

module.exports = function (tpath) {
	tpath = trim(tpath);
	return getPackageRoot(tpath).then(function (root) {
		tpath = tpath.slice(root.length + 1).split('/');
		if (tpath[0] === 'lib') {
			tpath.shift();
		}
		return root + '/test' + (tpath.length ? '/' + tpath.join('/') : '');
	});
};
