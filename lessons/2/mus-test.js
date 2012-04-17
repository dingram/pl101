var assert = require('../../lib/assert.js');
var mus = require('./mus-compiler.js');

var test_cases = [

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

];

for (var i in test_cases) {
  if (/[^0-9]/.test(i)) continue;
  tc = test_cases[i];
  assert.test(mus.compile(tc.mus), tc.note, tc.message);
}
