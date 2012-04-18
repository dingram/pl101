var assert = require('assert');
var testrunner = require('../../lib/testrunner.js');
var mus = require('./mus-compiler.js');

var test_cases = [

  {
    message: "One-note sequence generator",
    seq_src: 'a4:250',
    seq: { tag: 'note', pitch: 'a4', dur: 250 }
  },

  {
    message: "Two-note sequence generator",
    seq_src: 'a4:250 b4:250',
    seq: {
      tag: 'seq',
      left: { tag: 'note', pitch: 'a4', dur: 250 },
      right: { tag: 'note', pitch: 'b4', dur: 250 }
    }
  },

  {
    message: "Three-note sequence generator",
    seq_src: 'a4:250 b4:250 c4:500',
    seq: {
      tag: 'seq',
      left: {
        tag: 'seq',
        left: { tag: 'note', pitch: 'a4', dur: 250 },
        right: { tag: 'note', pitch: 'b4', dur: 250 }
      },
      right: { tag: 'note', pitch: 'c4', dur: 500 },
    }
  },

  {
    message: "Four-note sequence generator",
    seq_src: 'a4:250 b4:250 c4:500 d4:500',
    seq: {
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
    }
  },

  {
    message: "Four-note generated sequence with rests",
    seq_src: 'a4:250 b4:250 r:500 c4:500 r:500 d4:500',
    seq: {
      tag: 'seq',
      left: {
        tag: 'seq',
        left: {
          tag: 'seq',
          left: { tag: 'note', pitch: 'a4', dur: 250 },
          right: { tag: 'note', pitch: 'b4', dur: 250 }
        },
        right: { tag: 'rest', dur: 500 },
      },
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

  {
    message: "Simple one-note test",
    mus: mus.seqgen('a4:250'),
    note: [ { tag: 'note', pitch: 'a4', start: 0, dur: 250 } ]
  },

  {
    message: "Simple two-note test",
    mus: mus.seqgen('a4:250 b4:250'),
    note: [
      { tag: 'note', pitch: 'a4', start: 0, dur: 250 },
      { tag: 'note', pitch: 'b4', start: 250, dur: 250 }
    ]
  },

  {
    message: "Simple four-note test",
    mus: mus.seqgen('a4:250 b4:250 c4:500 d4:500'),
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
    mus: mus.seqgen('a4:250 r:100 b4:250'),
    note: [
      { tag: 'note', pitch: 'a4', start: 0, dur: 250 },
      { tag: 'note', pitch: 'b4', start: 350, dur: 250 }
    ]
  },

  {
    message: "Simple four-note test with rests",
    mus: mus.seqgen('a4:250 b4:250 r:500 c4:500 r:500 d4:500'),
    note: [
      { tag: 'note', pitch: 'a4', start: 0, dur: 250 },
      { tag: 'note', pitch: 'b4', start: 250, dur: 250 },
      { tag: 'note', pitch: 'c4', start: 1000, dur: 500 },
      { tag: 'note', pitch: 'd4', start: 2000, dur: 500 }
    ]
  },

  {
    message: "Repeat one note 4x",
    mus: {
      tag: 'repeat',
      section: mus.seqgen('c4:250'),
      count: 4
    },
    note: [
      { tag: 'note', pitch: 'c4', start: 0, dur: 250 },
      { tag: 'note', pitch: 'c4', start: 250, dur: 250 },
      { tag: 'note', pitch: 'c4', start: 500, dur: 250 },
      { tag: 'note', pitch: 'c4', start: 750, dur: 250 }
    ]
  },

  {
    message: "Repeat four-note pattern with rests 2x",
    mus: {
      tag: 'repeat',
      section: mus.seqgen('a4:250 b4:250 r:500 c4:500 r:500 d4:500'),
      count: 2
    },
    note: [
      { tag: 'note', pitch: 'a4', start: 0, dur: 250 },
      { tag: 'note', pitch: 'b4', start: 250, dur: 250 },
      { tag: 'note', pitch: 'c4', start: 1000, dur: 500 },
      { tag: 'note', pitch: 'd4', start: 2000, dur: 500 },
      { tag: 'note', pitch: 'a4', start: 2500, dur: 250 },
      { tag: 'note', pitch: 'b4', start: 2750, dur: 250 },
      { tag: 'note', pitch: 'c4', start: 3500, dur: 500 },
      { tag: 'note', pitch: 'd4', start: 4500, dur: 500 }
    ]
  },

];

testrunner.run(test_cases, function(tc){
  if ('note' in tc) {
    assert.deepEqual(mus.compile(tc.mus), tc.note, tc.message);
  } else if ('note_midi' in tc) {
    assert.deepEqual(mus.midi_pitches(mus.compile(tc.mus)), tc.note_midi, tc.message);
  } else if ('seq_src' in tc) {
    assert.deepEqual(mus.seqgen(tc.seq_src), tc.seq, tc.message);
  }
});
