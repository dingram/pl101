var midi = require('../../../lib/midi.js');
var fs = require('fs'); // for loading files

if (process.argv.length != 4) {
	process.stderr.write("Len: "+process.argv.length);
	process.stderr.write("Usage: mus2midi inputfile outputfile\n");
	process.exit(1);
}
var musin = process.argv[2];
var midiout = process.argv[3];

var noteEvents = [
	// set instrument
	new midi.MidiEvent({
			time:    0,
			type:    0xC,
			channel: 0,
			param1:  0x51
	}),
];

[
	'C4', // c4
	'D4', // d
	'E4', // e
	'F4', // f
	'G4', // g
	'A4', // a
	'B4', // b
	'C5', // c5
].forEach(function(note) {
    Array.prototype.push.apply(noteEvents, midi.MidiEvent.createNote(note));
});

// Create a track that contains the events to play the notes above
var track = new midi.MidiTrack({ tempo: 240, events: noteEvents });

var song  = midi.MidiWriter({ tracks: [track] });

fs.writeFileSync(midiout, song.hex, 'binary');
