var MusCompiler = (function(){
var durToTicks = function(d) {
	// arbitrarily decide that 250ms = 128 ticks
	return Math.floor(d / 250 * 128);
};

var _dispatch = {

	compile: {

		'note': function(s, i, o) {
			var start = s,
			end = s + i.dur;
			o.push({
				tag: 'note',
				start: start,
				dur: i.dur,
				end: end,
				pitch: i.pitch,
			});
			return end;
		},

		'rest': function(s, i, o) {
			return s + i.dur;
		},

		'tempo': function(s, i, o) {
			o.push({
				tag: 'tempo',
				time: s,
				bpm: i.tempo * i.base/4,
			});
			return s;
		},

		'instrument': function(s, i, o) {
			o.push({
				tag: 'instrument',
				time: s,
				patch: i.patch,
			});
			return s;
		},

		'seq': function(s, i, o) {
			return compile_(
				compile_(s, i.left, o),
				i.right,
				o
			);
		},

		'par': function(s, i, o) {
			return Math.max(
					compile_(s, i.left, o),
					compile_(s, i.right, o)
					);
		},

		'repeat': function(s, i, o) {
			for (var n = 0; n < i.count; ++n) {
				s = compile_(s, i.section, o);
			}
			return s;
		},

	},

};

var compile_ = function (start, musexpr, out) {
	if (!(musexpr.tag in _dispatch.compile)) {
		throw 'Unrecognised music tag "' + musexpr.tag + '"';
		return start;
	}
	return _dispatch.compile[musexpr.tag](start, musexpr, out);
};

var compile = function (musexpr) {
	var out = [];
	compile_(0, musexpr, out);
	return out;
};

return {
	compile: compile
};

})();
