var assert = require('assert');
var testrunner = require('../../../lib/testrunner.js');
var mus_util = require('./mus-util.js');


var test_cases = [

	{ message: 'Single note with integer duration',
		opts: {dur_absolute: true},
		str: "a4/250",
		mus: {tag:'note', pitch: 'a4', dur: 250} },
	{ message: 'Single note with floating-point duration',
		str: "a4/250.5",
		mus: {tag:'note', pitch: 'a4', dur: 250.5} },

	{ message: 'Quarter note with length (default tempo, 4=60)',
		str: "a4:4",
		mus: {tag:'note', pitch: 'a4', dur: 1000} },
	{ message: 'Quarter note with length at tempo 120',
		opts: {tempo: 120, minify_tempo: true},
		str: "tempo 120 a4:4",
		mus: {tag:'note', pitch: 'a4', dur: 500} },
	{ message: 'Quarter note with length at tempo 8=120',
		opts: {tempo_base: 8, tempo: 120},
		str: "tempo 8 = 120 a4:4",
		mus: {tag:'note', pitch: 'a4', dur: 1000} },
	{ message: 'Two quarter notes with length (default tempo)',
		str: "a4:4 b4:4",
		mus: {tag: 'seq', left:{tag:'note', pitch: 'a4', dur: 1000}, right: {tag:'note', pitch: 'b4', dur: 1000} } },
	{ message: 'Three quarter notes with length (default tempo)',
		str: "a4:4 b4:4 c4:2",
		mus: {tag: 'seq', left:{tag:'note', pitch: 'a4', dur: 1000}, right: {tag: 'seq', left: {tag:'note', pitch: 'b4', dur: 1000 }, right: {tag:'note', pitch: 'c4', dur: 2000} } } },

	{ message: 'C major chord, quarter notes with length (default tempo)',
		str: "<< a4:4 b4:4 c4:4 >>",
		mus: {tag: 'par', left:{tag:'note', pitch: 'a4', dur: 1000}, right: {tag: 'par', left: {tag:'note', pitch: 'b4', dur: 1000 }, right: {tag:'note', pitch: 'c4', dur: 1000} } } },

	{ message: 'Two sequences played in parallel',
		str: "<< { a4:4 b4:4 } { c4:4 d4:4 } >>",
		mus: {tag: 'par', left: {tag: 'seq', left: {tag:'note', pitch: 'a4', dur: 1000 }, right: {tag:'note', pitch: 'b4', dur: 1000} }, right: {tag: 'seq', left: {tag:'note', pitch: 'c4', dur: 1000 }, right: {tag:'note', pitch: 'd4', dur: 1000} } } },

	{ message: 'Two quarter notes with half-note rest + length (default tempo)',
		str: "a4:4 r:2 b4:4",
		mus: { tag: 'seq',
     left: { tag: 'note', pitch: 'a4', dur: 1000 },
     right:
      { tag: 'seq',
        left: { tag: 'rest', dur: 2000 },
        right: { tag: 'note', pitch: 'b4', dur: 1000 } } }
	},
	{ message: 'Three quarter notes with eighth-note rests + length (default tempo)',
		str: "a4:4 r:8 b4:4 r:8 c4:4",
		mus: { tag: 'seq',
     left: { tag: 'note', pitch: 'a4', dur: 1000 },
     right:
      { tag: 'seq',
        left: { tag: 'rest', dur: 500 },
        right:
         { tag: 'seq',
           left: { tag: 'note', pitch: 'b4', dur: 1000 },
           right:
            { tag: 'seq',
              left: { tag: 'rest', dur: 500 },
              right: { tag: 'note', pitch: 'c4', dur: 1000 } } } } }
	},

	{ message: 'Two quarter notes with half-note rest + duration',
		opts: {dur_absolute: true},
		str: "a4/1000 r/2000 b4/1000",
		mus: { tag: 'seq',
     left: { tag: 'note', pitch: 'a4', dur: 1000 },
     right:
      { tag: 'seq',
        left: { tag: 'rest', dur: 2000 },
        right: { tag: 'note', pitch: 'b4', dur: 1000 } } }
	},
	{ message: 'Three quarter notes with eighth-note rests + duration',
		opts: {dur_absolute: true},
		str: "a4/1000 r/500 b4/1000 r/500 c4/1000",
		mus: { tag: 'seq',
     left: { tag: 'note', pitch: 'a4', dur: 1000 },
     right:
      { tag: 'seq',
        left: { tag: 'rest', dur: 500 },
        right:
         { tag: 'seq',
           left: { tag: 'note', pitch: 'b4', dur: 1000 },
           right:
            { tag: 'seq',
              left: { tag: 'rest', dur: 500 },
              right: { tag: 'note', pitch: 'c4', dur: 1000 } } } } }
	},

	{ message: "Repeat one note 2x (default)",
		str: "|: a4:4 :|",
		mus: {tag: 'repeat', section:{tag:'note', pitch: 'a4', dur: 1000}, count: 2} },
	{ message: "Repeat one note 4x",
		str: "|: a4:4 :| (4)",
		mus: {tag: 'repeat', section:{tag:'note', pitch: 'a4', dur: 1000}, count: 4} },

	{ message: "Repeat a sequence 2x (default)",
		str: "|: a4:4 b4:4 :|",
		mus: {tag: 'repeat', section:{tag: 'seq', left:{tag:'note', pitch: 'a4', dur: 1000}, right: {tag:'note', pitch: 'b4', dur: 1000} }, count: 2} },
	{ message: "Repeat a sequence 4x",
		str: "|: a4:4 b4:4 :| (4)",
		mus: {tag: 'repeat', section:{tag: 'seq', left:{tag:'note', pitch: 'a4', dur: 1000}, right: {tag:'note', pitch: 'b4', dur: 1000} }, count: 4} },

	{ message: 'Notes missing length (after the first)',
		opts: {minify_len: true},
		str: "a4:4 b4 c4",
		mus: {tag: 'seq', left:{tag:'note', pitch: 'a4', dur: 1000}, right: {tag: 'seq', left: {tag:'note', pitch: 'b4', dur: 1000 }, right: {tag:'note', pitch: 'c4', dur: 1000} } } },
	{ message: 'Notes missing length #2',
		opts: {minify_len: true},
		str: "a4:4 b4 c4:2 d4",
		mus: {tag: 'seq', left:{tag:'note', pitch: 'a4', dur: 1000}, right: {tag: 'seq', left: {tag:'note', pitch: 'b4', dur: 1000 }, right: {tag:'seq', left:{tag:'note', pitch: 'c4', dur: 2000}, right: {tag:'note', pitch: 'd4', dur: 2000 } } } } },

	{ message: 'Notes missing octave (after the first)',
		opts: {minify_oct: true},
		str: "a4:4 b:4 c:4",
		mus: {tag: 'seq', left:{tag:'note', pitch: 'a4', dur: 1000}, right: {tag: 'seq', left: {tag:'note', pitch: 'b4', dur: 1000 }, right: {tag:'note', pitch: 'c4', dur: 1000} } } },
	{ message: 'Notes missing octave #2',
		opts: {minify_oct: true},
		str: "a4:4 b:4 c5:2 d:2",
		mus: {tag: 'seq', left:{tag:'note', pitch: 'a4', dur: 1000}, right: {tag: 'seq', left: {tag:'note', pitch: 'b4', dur: 1000 }, right: {tag:'seq', left:{tag:'note', pitch: 'c5', dur: 2000}, right: {tag:'note', pitch: 'd5', dur: 2000 } } } } },

	{ message: 'Notes missing octave and length (after the first)',
		opts: {minify: true},
		str: "a4:4 b c",
		mus: {tag: 'seq', left:{tag:'note', pitch: 'a4', dur: 1000}, right: {tag: 'seq', left: {tag:'note', pitch: 'b4', dur: 1000 }, right: {tag:'note', pitch: 'c4', dur: 1000} } } },
	{ message: 'Notes missing octave and length #2',
		opts: {minify: true},
		str: "a4:4 b c5:2 d",
		mus: {tag: 'seq', left:{tag:'note', pitch: 'a4', dur: 1000}, right: {tag: 'seq', left: {tag:'note', pitch: 'b4', dur: 1000 }, right: {tag:'seq', left:{tag:'note', pitch: 'c5', dur: 2000}, right: {tag:'note', pitch: 'd5', dur: 2000 } } } } },

];

testrunner.run(test_cases, function(tc){
	if ('str' in tc) {
		assert.deepEqual(mus_util.stringify(tc.mus, tc.opts), tc.str);
	} else if ('expect_fail' in tc && tc.expect_fail) {
		try {
			mus_util.stringify(tc.mus, tc.opts);
		} catch (e) {
			// we wanted it to fail!
			return true;
		}
		// fail test
		return false;
	}
});
