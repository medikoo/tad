'use strict';

var path       = require('path')

  , invoke     = require('es5-ext/lib/Function/invoke')
  , pluck      = require('es5-ext/lib/Function/pluck')
  , seq        = require('es5-ext/lib/Function/sequence')
  , merge      = require('es5-ext/lib/Object/plain/merge').call

  , setupTests = require('./setup-tests');

module.exports = function (sets) {
	sets.forEach(seq(pluck('sets'), invoke('forEach', function (set) {
		var scopes, testsPath = set.tests;
		if (set.tests === ':index') {
			set.tests = require('./utils/index-test')(path.dirname(set.target), set.name);
		} else {
			set.tests = require(set.tests);
		}

		if (set.tests.__generic) {
			scopes = require(path.dirname(testsPath) + '/__scopes');
			merge(set.tests, require('./utils/factory')(scopes, set.tests.__generic));
			delete set.tests.__generic;
		}

		set.tests = setupTests(set.tests);

	})));
	return sets;
};
