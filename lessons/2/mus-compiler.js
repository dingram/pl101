var _dispatch = {
  endTime: {
    'note': function(t,e) { return t + e.dur; },
    'seq':  function(t,e) { return endTime(endTime(t, e.left), e.right); },
    'par':  function(t,e) { return Math.max(endTime(t, e.left), endTime(t, e.right)); },
    'rest': function(t,e) { return t + e.dur; },
    // note: I use 0 in the call here, to work out how long the section lasts in isolation
    'repeat': function(t,e) { return t + e.count * endTime(0, e.section); },
  },

  compile: {

    'note': function(s, i, o) {
      o.push({
        tag: 'note',
          pitch: i.pitch,
          start: s,
          dur:   i.dur
      });
      return s + i.dur;
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

    'rest': function(s, i, o) {
      return s + (('dur' in i) ? i.dur : i.duration);
    },

    'repeat': function(s, i, o) {
      for (var n = 0; n < i.count; ++n) {
        s = compile_(s, i.section, o);
      }
    },

  },

};

var endTime = function (start, musexpr) {
  if (!(musexpr.tag in _dispatch.endTime)) {
    throw 'Unrecognised music tag "' + musexpr.tag + '"';
    return start;
  }
  return _dispatch.endTime[musexpr.tag](start, musexpr);
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

var midi_letter_pitches = { a:21, b:23, c:12, d:14, e:16, f:17, g:19 };
var pitch_to_midi_ = function(p) {
  var note = p.substr(0, 1), octave = parseInt(p.substr(1), 10);
  return (12 * octave) + midi_letter_pitches[note];
};

/* NOTE: For efficiency, this modifies the input */
var midi_pitches = function (noteexpr) {
  for (var i in noteexpr) {
    if (/[^0-9]/.test(i)) continue;
    noteexpr[i].pitch = pitch_to_midi_(noteexpr[i].pitch);
  }
  return noteexpr;
};


/**
 * Generate a sequence of notes from more convenient input
 */
var seqgen = function(input) {
  var elts = input.split(/[ \t\n\r]+/);
  var seq = create_empty_seq(elts.length);
  seq = fill_seq(seq, elts);
  return seq;
};

var create_empty_seq = function(len) {
  if (len <= 1) {
    return {};
  } else {
    // bias to heavy left -- swap ceil/floor for heavy right
    return { tag: 'seq', left: create_empty_seq(Math.ceil(len/2)), right: create_empty_seq(Math.floor(len/2)) };
  }
};

var genstr_to_note = function(str) {
  var t = str.split(':');
  if (t[0] === 'r') {
    return { tag: 'rest', dur: parseInt(t[1], 10) };
  } else {
    return { tag: 'note', pitch: t[0], dur: parseInt(t[1], 10) };
  }
};

var fill_seq = function(seq, notes) {
  if (seq === null || !('tag' in seq)) {
    seq = genstr_to_note(notes.shift());
  } else {
    seq.left = fill_seq(seq.left, notes);
    seq.right = fill_seq(seq.right, notes);
  }
  return seq;
};

module.exports = {compile: compile, midi_pitches: midi_pitches, seqgen: seqgen};
