'use strict';

module.exports = function (t, a) {
	var ondata = [], ended = false;
	t = t();
	t.on('data', function (o) {
		ondata.push(o.type, o.data);
	});
	t.on('end', function () {
		ended = true;
	});
	t.pass('foo');
	t.in('ONE');
	t.fail('bar');
	t.out();
	t.error('error');

	a.deep(t.msg, [], "Msg");
	a(t.length, 3, "Length");
	a.deep([t[0].type, t[0].data, t[0].msg.toString()],
		['pass', 'foo', ''], "#1 pass");
	a.deep([t[1].type, t[1].data, t[1].msg.toString()],
		['fail', 'bar', 'ONE'], "#2 fail");
	a.deep([t[2].type, t[2].data, t[2].msg.toString()],
		['error', 'error', ''], "#3 error");
	a(ended, false, "Not ended");
	t.end();
	a(ended, true, "Ended");
	a.deep(ondata, ['pass', 'foo', 'fail', 'bar', 'error', 'error'], "Log");
};
