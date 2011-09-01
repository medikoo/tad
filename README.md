# TAD - JavaScript test suite

Goal of this framework is to allow writing tests with minimal hassle.
TAD will locate your test file, and provide tested module for your test functions.

Example console output:
<img src="http://medyk.org/tad.png" border="0" width="718" height="370" />

* [Installation](#installation)
* [Usage](#usage)
	* [File managment](#usage-file-management)
	* [Test files](#usage-test-files)
	* [Test functions](#usage-test-functions)
	* [Assertions](#usage-assertions)
	* [Running tests](#usage-running-tests)
* [TODO](#todo)

<a name="installation" />
## Installation

	$ npm install tad

<a name="usage" />
## Usage

<a name="usage-file-management" />
### File management

Keep your code in _lib_ folder and tests in _test_ folder.
For each file in in _lib_ folder have corresponding test file in _test_ folder.

<a name="usage-test-files" />
### Test files

Tests should be written as set of functions, it can be just one function:

	module.exports = function (t, a, d) {
		// tests
	};

or many thematically grouped functions:

	exports["Test this"] = function (t, a, d) {
		// tests
	};
	exports["Test that"] = function (t, a, d) {
		// tests
	};

<a name="usage-test-functions" />
### Test functions

Arguments passed to test functions are:

* __t__ - Tested module
* __a__ - Assert object
* __d__ - _Done_ function, it's for tests that need to be run asynchronously.
You may pass additional block of tests to this
function and they'll be run right after. _d_ argument makes no sense for
synchrounous tests, declare such tests without it.

All arguments are optional, and by the way function is declared suite detect
which arguments should be passed to test function. Examples:

* Asynchronous test:

		exports["Some tests"] = funtcion (t, a, d) {
			// tests
			setTimeout(function () {
				// tests
				d();
			}, 100);
		};

* Synchronous test:

		exports["Some tests"] = function (t, a) {
			// tests
		};

Tests can be nested, and declared various ways (synchronous/asynchronous)

	module.exports["Test all"] = function (t, a) {
		// Preparation code

		// ... tests ...

		return {
			"Test this": function () {
				// We already have module and assert object
				// ... tests ...
			},
			"Test that async way": function (d) {
				// This one is asynchronous
				// ... tests ....

				seTimeout(function () {
					// ... tests ...
					d({
						"Some extra tests": function () {
							// ... tests ...
						}
					})
				}, 100);
			}
		};
	};

<a name="usage-assertions" />
### Assertions

TAD uses assert object from [UncommonJS tests runner](https://github.com/Gozala/test-commonjs/),
It's API is nearly same as of _assert_ that can be found in Node. Full spec is available at 
https://github.com/kriskowal/uncommonjs/blob/master/tests/specification.md .

TAD adds some extra sugar to UncommonJS Assert object:

* `a === a.equalStrict`, so you can write your assertions as:

		a(shouldBeTrue, true, "It's true");
		// it has same effect as:
		a.equalStrict(shouldBeTrue, true, "It's true");

* `a.not` is an alias for `a.notStrictEqual`
* `a.deep` is an alias for `a.deepEqual`
* `a.notDeep` is an alias for `a.notDeepEqual`
* `assert.never` with that you can check function paths that should never be called.

<a name="usage-running-tests" />
### Running tests

Test your file with provided binary:

	$ bin/tad lib/test-file

or test all files in path:

	$ bin/tad lib

<a name="todo" />
## TODO

* Full custom context support
* Code coverage
* TAP support
* jslint, jshint as side validation option
* Port tests to browsers