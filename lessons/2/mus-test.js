var assert = require('../../lib/assert.js');
var mus = require('./mus-compiler.js');

var test_cases = [

  {
    message: "Simple one-note test",
    mus: { tag: 'note', pitch: 'a4', dur: 250 },
    note: [ { tag: 'note', pitch: 'a4', start: 0, dur: 250 } ]
  },

  {
    message: "Simple two-note test",
    mus: {
      tag: 'seq',
      left: { tag: 'note', pitch: 'a4', dur: 250 },
      right: { tag: 'note', pitch: 'b4', dur: 250 }
    },
    note: [
      { tag: 'note', pitch: 'a4', start: 0, dur: 250 },
      { tag: 'note', pitch: 'b4', start: 250, dur: 250 }
    ]
  },

  {
    message: "Simple four-note test",
    mus: {
      tag: 'seq',
      left: {
        tag: 'seq',
        left: { tag: 'note', pitch: 'a4', dur: 250 },
        right: { tag: 'note', pitch: 'b4', dur: 250 }
      },
      right: {
        tag: 'seq',
        left: { tag: 'note', pitch: 'c4', dur: 500 },
        right: { tag: 'note', pitch: 'd4', dur: 500 }
      }
    },
    note: [
      { tag: 'note', pitch: 'a4', start: 0, dur: 250 },
      { tag: 'note', pitch: 'b4', start: 250, dur: 250 },
      { tag: 'note', pitch: 'c4', start: 500, dur: 500 },
      { tag: 'note', pitch: 'd4', start: 1000, dur: 500 }
    ]
  },

  {
    message: "C major chord",
    mus: {
      tag: 'par',
      left: { tag: 'note', pitch: 'c4', dur: 250 },
      right: {
        tag: 'par',
        left: { tag: 'note', pitch: 'e4', dur: 250 },
        right: { tag: 'note', pitch: 'g4', dur: 250 }
      }
    },
    note: [
      { tag: 'note', pitch: 'c4', start: 0, dur: 250 },
      { tag: 'note', pitch: 'e4', start: 0, dur: 250 },
      { tag: 'note', pitch: 'g4', start: 0, dur: 250 }
    ]
  },

  {
    message: "C major chord (MIDI)",
    mus: {
      tag: 'par',
      left: { tag: 'note', pitch: 'c4', dur: 250 },
      right: {
        tag: 'par',
        left: { tag: 'note', pitch: 'e4', dur: 250 },
        right: { tag: 'note', pitch: 'g4', dur: 250 }
      }
    },
    note_midi: [
      { tag: 'note', pitch: 60, start: 0, dur: 250 },
      { tag: 'note', pitch: 64, start: 0, dur: 250 },
      { tag: 'note', pitch: 67, start: 0, dur: 250 }
    ]
  },

  {
    message: "Simple two-note test with rest",
    mus: {
      tag: 'seq',
      left: { tag: 'note', pitch: 'a4', dur: 250 },
      right: {
        tag: 'seq',
        left: { tag: 'rest', dur: 100 },                 // also accepts "duration" for compatability
        right: { tag: 'note', pitch: 'b4', dur: 250 }
      }
    },
    note: [
      { tag: 'note', pitch: 'a4', start: 0, dur: 250 },
      { tag: 'note', pitch: 'b4', start: 350, dur: 250 }
    ]
  },

  {
    message: "Simple four-note test with rests",
    mus: {
      tag: 'seq',
      left: {
        tag: 'seq',
        left: { tag: 'note', pitch: 'a4', dur: 250 },
        right: { tag: 'note', pitch: 'b4', dur: 250 }
      },
      right: {
        tag: 'seq',
        left: { tag: 'rest', dur: 500 },
        right: {
          tag: 'seq',
          left: {
            tag: 'seq',
            left: { tag: 'note', pitch: 'c4', dur: 500 },
            right: { tag: 'rest', dur: 500 },
          },
          right: { tag: 'note', pitch: 'd4', dur: 500 }
        }
      }
    },
    note: [
      { tag: 'note', pitch: 'a4', start: 0, dur: 250 },
      { tag: 'note', pitch: 'b4', start: 250, dur: 250 },
      { tag: 'note', pitch: 'c4', start: 1000, dur: 500 },
      { tag: 'note', pitch: 'd4', start: 2000, dur: 500 }
    ]
  },

];

for (var i in test_cases) {
  if (/[^0-9]/.test(i)) continue;
  tc = test_cases[i];
  try {
    if ('note' in tc) {
      assert.test(mus.compile(tc.mus), tc.note, tc.message);
    } else if ('note_midi' in tc) {
      assert.test(mus.midi_pitches(mus.compile(tc.mus)), tc.note_midi, tc.message);
    }
  } catch (e) {
    console.log("\033[1;31mFAIL\033[m: " + tc.message);
    console.log("  "+e);
  }
}
