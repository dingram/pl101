var PEG = require('pegjs');
var Midi = require('jsmidgen');
var fs = require('fs'); // for loading files
var util = require('util');


if (process.argv.length != 4) {
	process.stderr.write("Len: "+process.argv.length);
	process.stderr.write("Usage: mus2midi inputfile.mus outputfile.mid\n");
	process.exit(1);
}
var musin = process.argv[2];
var midiout = process.argv[3];

var parserdata = fs.readFileSync('mus.peg', 'utf-8');

var parse;
try {
	parse = PEG.buildParser(parserdata, {trackLineAndColumn: true}).parse;
} catch (e) {
	console.log(util.inspect(e, false, null));
	process.exit(1);
}

var durToTicks = function(d) {
	// arbitrarily decide that 250ms = 128 ticks
	return Math.floor(d / 250 * 128);
};

var _dispatch = {

	compile: {

		'note': function(s, i, o) {
			var start = s,
			end = s + (i.len ? Math.floor(512 / i.len) : durToTicks(i.dur));
			o.push({
				tag: 'noteOn',
				time: start,
				pitch: i.pitch,
			});
			o.push({
				tag: 'noteOff',
				time:  end,
				pitch: i.pitch,
			});
			return end;
		},

		'rest': function(s, i, o) {
			return s + (i.len ? Math.floor(512 / i.len) : durToTicks(('dur' in i) ? i.dur : i.duration));
		},

		'tempo': function(s, i, o) {
			o.push({
				tag: 'tempo',
				time: s,
				bpm: i.tempo * i.base/4,
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

var data = fs.readFileSync(musin, 'utf-8');
var mus = parse(data);
var note = compile(mus);

// sort NOTE output in increasing order of time
note.sort(function($a, $b) {
	var d = $a.time - $b.time;
	if (d != 0) return d;
	if ($a.tag === 'noteOff' && $b.tag === 'noteOn') return -1;
	if ($b.tag === 'noteOff' && $a.tag === 'noteOn') return 1;
	return 0;
});

// convert absolute times to relative
var prevTime = 0;
for (var i=0,l=note.length; i<l; ++i) {
	note[i].interval = note[i].time - prevTime;
	prevTime = note[i].time;
}
//console.log(note);

var midi = new Midi.File();
var track = midi.addTrack();
for (var i=0,l=note.length; i<l; ++i) {
	if (note[i].tag === 'tempo') {
		track.tempo(note[i].bpm, note[i].interval);
	} else {
		track[note[i].tag](0, note[i].pitch, note[i].interval);
	}
}

fs.writeFileSync(midiout, midi.toBytes(), 'binary');
