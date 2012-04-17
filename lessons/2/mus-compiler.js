var endTime = function (t, musexpr) {
  if (musexpr.tag === 'note') {
    return t + musexpr.dur;
  } else if (musexpr.tag === 'seq') {
    return endTime(
        endTime(t, musexpr.left),
        musexpr.right
        );
  } else if (musexpr.tag === 'par') {
    return Math.max(
        endTime(t, musexpr.left),
        endTime(t, musexpr.right)
        );
  }
};

var compile_ = function (start, musexpr) {
  if (musexpr.tag === 'note') {
    return [ {
      tag: 'note',
        pitch: musexpr.pitch,
        start: start,
        dur: musexpr.dur
    } ];
  } else if (musexpr.tag === 'seq') {
    return compile_(
        start,
        musexpr.left
        ).concat(compile_(
            endTime(start, musexpr.left),
            musexpr.right
            ));
  } else {
    return compile_(
        start,
        musexpr.left
        ).concat(compile_(
            start,
            musexpr.right
            ));
  }
};

var compile = function (musexpr) {
  return compile_(0, musexpr);
};

module.exports = {compile: compile};
