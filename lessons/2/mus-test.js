var assert = require('../../lib/assert.js');
var mus = require('./mus-compiler.js');

var test_case_1_mus = { tag: 'seq',
  left:
  { tag: 'seq',
    left: { tag: 'note', pitch: 'a4', dur: 250 },
    right: { tag: 'note', pitch: 'b4', dur: 250 } },
  right:
  { tag: 'seq',
    left: { tag: 'note', pitch: 'c4', dur: 500 },
    right: { tag: 'note', pitch: 'd4', dur: 500 } } };

var test_case_1_note = [
  { tag: 'note', pitch: 'a4', start: 0, dur: 250 },
  { tag: 'note', pitch: 'b4', start: 250, dur: 250 },
  { tag: 'note', pitch: 'c4', start: 500, dur: 500 },
  { tag: 'note', pitch: 'd4', start: 1000, dur: 500 }
];

assert.test(mus.compile(test_case_1_mus), test_case_1_note, 'Simple test');
