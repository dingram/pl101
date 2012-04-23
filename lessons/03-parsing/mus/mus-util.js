var durFromLen = function (len, tempo, base) {
	base = base || 4;
	return (60000 * base) / (len * tempo);
}

var lenFromDur = function (dur, tempo, base) {
	base = base || 4;
	var l = (60000 * base) / (dur * tempo);
	if (l in {1:1, 2:2, 4:4, 8:8, 16:16, 32:32, 64:64, 128:128}) {
		return l;
	}
	return null;
}

var splitPitch = function (pitch) {
	if (pitch === 'r') return [pitch];
  return [].concat(/([a-g](?:#+|b+)?)([0-9]+)$/i.exec(pitch)).slice(1);
}

var _note_stringify_helper = function(p, m, o, x) {
	var ps = splitPitch(p);
	var n = ps[0];
	if (ps[1] && (!o.minify_oct || ps[1] != o.octave)) {
		o.octave = ps[1];
		n += ps[1];
	}
	if (!o.minify_len || m.dur != o.dur) {
		o.dur = m.dur;
		var l = o.dur_absolute ? null : lenFromDur(m.dur, o.tempo, o.tempo_base);
		if (l === null) {
			n += '/' + m.dur;
		} else {
			n += ':' + l;
		}
	}
	x.push(n);
};

var _dispatch = {

  stringify: {

    'note': function(m, o, x) {
			return _note_stringify_helper(m.pitch, m, o, x);
		},

    'rest': function(m, o, x) {
			return _note_stringify_helper('r', m, o, x);
    },

    'seq': function(m, o, x) {
			if (o.in_par) x.push('{');
      stringify_(m.left, o, x);
      stringify_(m.right, o, x);
			if (o.in_par) x.push('}');
    },

    'par': function(m, o, x) {
			if (!o.in_par) x.push('<<');
			var tmp_par = o.in_par;
			o.in_par = true;
      stringify_(m.left, o, x);
      stringify_(m.right, o, x);
			o.in_par = tmp_par;
			if (!o.in_par) x.push('>>');
    },

    'repeat': function(m, o, x) {
			x.push('|:');
      stringify_(m.section, o, x);
			x.push(':|');
			if (m.count != 2) {
				x.push('('+m.count+')');
			}
    },

	},

};


var stringify_ = function(mus, opts, out) {
  if (!(mus.tag in _dispatch.stringify)) {
    throw 'Unrecognised music tag "' + mus.tag + '"';
    return start;
  }
  return _dispatch.stringify[mus.tag](mus, opts, out);
}

var stringify = function(mus, opts) {
	opts = opts || {};
	var sane_opts = {
		minify_len:   ('minify' in opts) && opts.minify ? true : (('minify_len' in opts) ? opts.minify_len : false),
		minify_oct:   ('minify' in opts) && opts.minify ? true : (('minify_oct' in opts) ? opts.minify_oct : false),
		minify_tempo: ('minify' in opts) && opts.minify ? true : (('minify_tempo' in opts) ? opts.minify_tempo : false),
		dur_absolute: opts.dur_absolute || false,
		tempo:        opts.tempo || 60,
		tempo_base:   opts.tempo_base || 4,
	}

	var output = [];
	if (sane_opts.tempo != 60 || sane_opts.tempo_base != 4) {
		if ((sane_opts.minify || sane_opts.minify_tempo) && sane_opts.tempo_base == 4) {
			output.push('tempo '+sane_opts.tempo);
		} else {
			output.push('tempo '+sane_opts.tempo_base+' = '+sane_opts.tempo);
		}
	}
	stringify_(mus, sane_opts, output);

	return output.join(' ');
}

module.exports = {stringify: stringify};
