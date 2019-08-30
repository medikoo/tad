"use strict";

var identity     = require("es5-ext/function/identity")
  , createLogger = require("../../lib/logger")
  , createAssert = require("../../lib/assert");

module.exports = function (t, a, d) {
	var inProgress = false, logger = createLogger(), assert = createAssert(logger), aa = a;

	t(
		identity,
		{
			"Regular": function (x, y) {
				var o = {};
				a.ok(!inProgress, "Regular: Progress");
				a(x, identity, "Regular: Testee");
				y(x(o), o, "foo");
				a.deep([logger[0].type, logger[0].data], ["pass", "foo"], "Regular: Logger");
				a.deep(logger.msg, ["Regular"], "Regular: Name");
			},
			"Async": function (x, y, z) {
				var o = {};
				a.ok(!inProgress, "Async: Progress");
				inProgress = true;
				a(x, identity, "Async: Testee");
				y(x(o), o, "bar");
				a.deep([logger[1].type, logger[1].data], ["pass", "bar"], "Async: Logger");
				a.deep(logger.msg, ["Async"], "Async: Name");
				process.nextTick(function () {
					inProgress = false;
					z();
				});
			},
			"Async nested": function (x, y, z) {
				a.ok(!inProgress, "Async nested: Progress");
				inProgress = true;
				process.nextTick(function () {
					z({
						"inner test": function (a) {
							aa.deep(
								logger.msg, ["Async nested", "inner test"], "Async nested: Name"
							);
							aa(a, assert, "Assert by single arg");
							inProgress = false;
						}
					});
				});
			},
			"Sync nested": function () {
				a.ok(!inProgress, "Sync nested: Progress");
				inProgress = true;
				a.deep(logger.msg, ["Sync nested"], "Sync nested: Name");
				return {
					"inner other": function (t) {
						a.deep(
							logger.msg, ["Sync nested", "inner other"], "Sync nested: inner: Name"
						);
						a(t, identity, "Testee by single arg");
						inProgress = false;
					}
				};
			},
			"Nested": {
				"in nested": function () {
					a.ok(!inProgress, "Nested: Progress");
					inProgress = true;
					a.deep(logger.msg, ["Nested", "in nested"], "Nested: Name");
					inProgress = false;
				}
			},
			"Check args": function (a, d) {
				aa.ok(!inProgress, "Args: Progress");
				inProgress = true;
				aa(a, assert, "Assert as first arg when two args");
				d(function (d) {
					var e, l = logger.length;
					aa.deep(logger.msg, ["Check args", ""], "Tests as function");
					inProgress = false;
					d((e = new Error("Foo")));
					aa(logger[l].data, e, "Async error");
				});
			}
		},
		assert,
		logger
	);

	logger.on("end", function () {
		var l, seen = false;
		l = t(identity, function (t, a) { a.ok(true, "Ok"); });
		l.on("data", function () { seen = true; });
		l.on("end", function () {
			a.ok(seen, "Tests are run in nextTick");
			d();
		});
	});
};
