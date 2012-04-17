var endTime_dispatch = {
  'note': function(t,e) { return t + e.dur; },
  'seq':  function(t,e) { return endTime(endTime(t, e.left), e.right); },
  'par':  function(t,e) { return Math.max(endTime(t, e.left), endTime(t, e.right)); },
};

var endTime = function (start, musexpr) {
  if (!(musexpr.tag in endTime_dispatch)) {
    throw 'Unrecognised music tag "' + musexpr.tag + '"';
    return start;
  }
  return endTime_dispatch[musexpr.tag](start, musexpr);
};

var compile_dispatch = {
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
    s = compile_(s, i.left, o);
    s = compile_(s, i.right, o);
    return s;
  },

  'par': function(s, i, o) {
    s = Math.max(
      compile_(s, i.left, o),
      compile_(s, i.right, o)
    );
    return s;
  },
};

var compile_ = function (start, musexpr, out) {
  if (!(musexpr.tag in compile_dispatch)) {
    throw 'Unrecognised music tag "' + musexpr.tag + '"';
    return start;
  }
  return compile_dispatch[musexpr.tag](start, musexpr, out);
};

var compile = function (musexpr) {
  var out = [];
  compile_(0, musexpr, out);
  return out;
};

module.exports = {compile: compile};
