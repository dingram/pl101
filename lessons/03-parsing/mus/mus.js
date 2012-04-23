var PEG = require('pegjs');
var assert = require('assert');
var fs = require('fs'); // for loading files
var testrunner = require('../../../lib/testrunner.js');

var data = fs.readFileSync('mus.peg', 'utf-8');
//console.log(data);
var parse = PEG.buildParser(data).parse;

var test_cases = [

	{ message: 'Empty string',
		input: '',
		expect_fail: true },

	{ message: 'Single note with integer duration',
		input: "a4/250",
		output: {tag:'note', pitch: 'a4', dur: 250} },
	{ message: 'Single note with floating-point duration',
		input: "a4/250.5",
		output: {tag:'note', pitch: 'a4', dur: 250} },

	{ message: 'Quarter note with length (default tempo, 4=60)',
		input: "a4:4",
		output: {tag:'note', pitch: 'a4', dur: 1000} },
	{ message: 'Quarter note with length at tempo 120',
		input: "tempo 120 a4:4",
		output: {tag:'note', pitch: 'a4', dur: 500} },
	{ message: 'Quarter note with length at tempo 8=120',
		input: "tempo 8=120 a4:4",
		output: {tag:'note', pitch: 'a4', dur: 1000} },
	{ message: 'Two quarter notes with length (default tempo)',
		input: "a4:4 b4:4",
		output: {tag: 'seq', left:{tag:'note', pitch: 'a4', dur: 1000}, right: {tag:'note', pitch: 'b4', dur: 1000} } },
	{ message: 'Three quarter notes with length (default tempo)',
		input: "a4:4 b4:4 c4:2",
		output: {tag: 'seq', left:{tag:'note', pitch: 'a4', dur: 1000}, right: {tag: 'seq', left: {tag:'note', pitch: 'b4', dur: 1000 }, right: {tag:'note', pitch: 'c4', dur: 2000} } } },

	{ message: 'C major chord, quarter notes with length (default tempo)',
		input: "<< a4:4 b4:4 c4:4 >>",
		output: {tag: 'par', left:{tag:'note', pitch: 'a4', dur: 1000}, right: {tag: 'par', left: {tag:'note', pitch: 'b4', dur: 1000 }, right: {tag:'note', pitch: 'c4', dur: 1000} } } },

	{ message: 'Two sequences played in parallel',
		input: "<< { a4:4 b4:4 } { c4:4 d4:4 } >>",
		output: {tag: 'par', left: {tag: 'seq', left: {tag:'note', pitch: 'a4', dur: 1000 }, right: {tag:'note', pitch: 'b4', dur: 1000} }, right: {tag: 'seq', left: {tag:'note', pitch: 'c4', dur: 1000 }, right: {tag:'note', pitch: 'd4', dur: 1000} } } },

	{ message: 'C major chord with minified syntax, quarter notes with duration (default tempo)',
		input: "< a4 b4 c4 >/1000",
		output: {tag: 'par', left:{tag:'note', pitch: 'a4', dur: 1000}, right: {tag: 'par', left: {tag:'note', pitch: 'b4', dur: 1000 }, right: {tag:'note', pitch: 'c4', dur: 1000} } } },
	{ message: 'C major chord with minified syntax, quarter notes with length (default tempo)',
		input: "< a4 b4 c4 >:4",
		output: {tag: 'par', left:{tag:'note', pitch: 'a4', dur: 1000}, right: {tag: 'par', left: {tag:'note', pitch: 'b4', dur: 1000 }, right: {tag:'note', pitch: 'c4', dur: 1000} } } },

	{ message: 'Two quarter notes with half-note rest + length (default tempo)',
		input: "a4:4 r:2 b4:4",
		output: { tag: 'seq',
     left: { tag: 'note', pitch: 'a4', dur: 1000 },
     right:
      { tag: 'seq',
        left: { tag: 'rest', dur: 2000 },
        right: { tag: 'note', pitch: 'b4', dur: 1000 } } }
	},
	{ message: 'Three quarter notes with eighth-note rests + length (default tempo)',
		input: "a4:4 r:8 b4:4 r:8 c4:4",
		output: { tag: 'seq',
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
		input: "a4/1000 r/2000 b4/1000",
		output: { tag: 'seq',
     left: { tag: 'note', pitch: 'a4', dur: 1000 },
     right:
      { tag: 'seq',
        left: { tag: 'rest', dur: 2000 },
        right: { tag: 'note', pitch: 'b4', dur: 1000 } } }
	},
	{ message: 'Three quarter notes with eighth-note rests + duration',
		input: "a4/1000 r/500 b4/1000 r/500 c4/1000",
		output: { tag: 'seq',
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
		input: "|: a4:4 :|",
		output: {tag: 'repeat', section:{tag:'note', pitch: 'a4', dur: 1000}, count: 2} },
	{ message: "Repeat one note 4x",
		input: "|: a4:4 :| (4)",
		output: {tag: 'repeat', section:{tag:'note', pitch: 'a4', dur: 1000}, count: 4} },

	{ message: "Repeat a sequence 2x (default)",
		input: "|: a4:4 b4:4 :|",
		output: {tag: 'repeat', section:{tag: 'seq', left:{tag:'note', pitch: 'a4', dur: 1000}, right: {tag:'note', pitch: 'b4', dur: 1000} }, count: 2} },
	{ message: "Repeat a sequence 4x",
		input: "|: a4:4 b4:4 :| (4)",
		output: {tag: 'repeat', section:{tag: 'seq', left:{tag:'note', pitch: 'a4', dur: 1000}, right: {tag:'note', pitch: 'b4', dur: 1000} }, count: 4} },

	{ message: "Twinkle Twinkle Little Star",
		input: "c4:4 c4:4 g4:4 g4:4 a4:4 a4:4 g4:2\nf4:4 f4:4 e4:4 e4:4 d4:4 d4:4 c4:2\n|: g4:4 g4:4 f4:4 f4:4 e4:4 e4:4 d4:2 :|\nc4:4 c4:4 g4:4 g4:4 a4:4 a4:4 g4:2\nf4:4 f4:4 e4:4 e4:4 d4:4 d4:4 c4:2",
		output: {tag:'seq',left:{tag:'note',pitch:'c4',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'c4',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'a4',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'a4',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:2000},right:{tag:'seq',left:{tag:'note',pitch:'f4',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'f4',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'e4',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'e4',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'d4',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'d4',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'c4',dur:2000},right:{tag:'seq',left:{tag:'repeat',section:{tag:'seq',left:{tag:'note',pitch:'g4',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'f4',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'f4',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'e4',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'e4',dur:1000},right:{tag:'note',pitch:'d4',dur:2000}}}}}}},count:2},right:{tag:'seq',left:{tag:'note',pitch:'c4',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'c4',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'a4',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'a4',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:2000},right:{tag:'seq',left:{tag:'note',pitch:'f4',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'f4',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'e4',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'e4',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'d4',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'d4',dur:1000},right:{tag:'note',pitch:'c4',dur:2000}}}}}}}}}}}}}}}}}}}}}}}}}}}}}
	},

	{ message: "Jingle Bells",
		input: "<<\n{ |: b4:8 b4:8 b4:4 :|\nb4:8 d5:8 g4:8. a4:16 b4:4 r:4\nc5:8 c5:8 c5:8. c5:16 c5:8 b4:8 b4:8 b4:16 b4:16\nb4:8 a4:8 a4:8 g4:8 a4:8 r4 }\n\n{ |: g4:8 g4:8 g4:4 :|\ng4:8 g5:8 d4:8. d4:16 g4:4 r:4\ne4:8 e4:8 e4:8. e4:16 e4:8 d4:8 d4:8 G4:16 G4:16\ng4:8 g4:8 g4:8 g4:8 f#4:8 r4 }\n\n{ |: d4:8 d4:8 d4:4 :|\nd4:8 b3:8 b3:8. c4:16 d4:4 r:4\ng3:8 g3:8 g3:8. g3:16 g3:8 g3:8 g3:8 d4:16 d4:16\nc#4:8 c#4:8 c#4:8 c#4:8 d4:8 r4 }\n\n{ |: g3:8 g3:8 g3:4 :|\ng3:8 g3:8 g3:8. g3:16 g3:4 r:4\nc3:8 c3:8 c3:8. c3:16 g2:8 g2:8 g2:8 g3:16 g3:16\ne3:8 e3:8 a3:8 a3:8 d3:8 r4 }\n>>",
		output: {tag:'par',left:{tag:'seq',left:{tag:'repeat',section:{tag:'seq',left:{tag:'note',pitch:'b4',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'b4',dur:500},right:{tag:'note',pitch:'b4',dur:1000}}},count:2},right:{tag:'seq',left:{tag:'note',pitch:'b4',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'d5',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:333.3333333333333},right:{tag:'seq',left:{tag:'note',pitch:'a4',dur:250},right:{tag:'seq',left:{tag:'note',pitch:'b4',dur:1000},right:{tag:'seq',left:{tag:'rest',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'c5',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'c5',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'c5',dur:333.3333333333333},right:{tag:'seq',left:{tag:'note',pitch:'c5',dur:250},right:{tag:'seq',left:{tag:'note',pitch:'c5',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'b4',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'b4',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'b4',dur:250},right:{tag:'seq',left:{tag:'note',pitch:'b4',dur:250},right:{tag:'seq',left:{tag:'note',pitch:'b4',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'a4',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'a4',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'a4',dur:500},right:{tag:'rest',dur:1000}}}}}}}}}}}}}}}}}}}}}},right:{tag:'par',left:{tag:'seq',left:{tag:'repeat',section:{tag:'seq',left:{tag:'note',pitch:'g4',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:500},right:{tag:'note',pitch:'g4',dur:1000}}},count:2},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'g5',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'d4',dur:333.3333333333333},right:{tag:'seq',left:{tag:'note',pitch:'d4',dur:250},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:1000},right:{tag:'seq',left:{tag:'rest',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'e4',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'e4',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'e4',dur:333.3333333333333},right:{tag:'seq',left:{tag:'note',pitch:'e4',dur:250},right:{tag:'seq',left:{tag:'note',pitch:'e4',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'d4',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'d4',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'G4',dur:250},right:{tag:'seq',left:{tag:'note',pitch:'G4',dur:250},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'f#4',dur:500},right:{tag:'rest',dur:1000}}}}}}}}}}}}}}}}}}}}}},right:{tag:'par',left:{tag:'seq',left:{tag:'repeat',section:{tag:'seq',left:{tag:'note',pitch:'d4',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'d4',dur:500},right:{tag:'note',pitch:'d4',dur:1000}}},count:2},right:{tag:'seq',left:{tag:'note',pitch:'d4',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'b3',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'b3',dur:333.3333333333333},right:{tag:'seq',left:{tag:'note',pitch:'c4',dur:250},right:{tag:'seq',left:{tag:'note',pitch:'d4',dur:1000},right:{tag:'seq',left:{tag:'rest',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'g3',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'g3',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'g3',dur:333.3333333333333},right:{tag:'seq',left:{tag:'note',pitch:'g3',dur:250},right:{tag:'seq',left:{tag:'note',pitch:'g3',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'g3',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'g3',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'d4',dur:250},right:{tag:'seq',left:{tag:'note',pitch:'d4',dur:250},right:{tag:'seq',left:{tag:'note',pitch:'c#4',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'c#4',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'c#4',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'c#4',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'d4',dur:500},right:{tag:'rest',dur:1000}}}}}}}}}}}}}}}}}}}}}},right:{tag:'seq',left:{tag:'repeat',section:{tag:'seq',left:{tag:'note',pitch:'g3',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'g3',dur:500},right:{tag:'note',pitch:'g3',dur:1000}}},count:2},right:{tag:'seq',left:{tag:'note',pitch:'g3',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'g3',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'g3',dur:333.3333333333333},right:{tag:'seq',left:{tag:'note',pitch:'g3',dur:250},right:{tag:'seq',left:{tag:'note',pitch:'g3',dur:1000},right:{tag:'seq',left:{tag:'rest',dur:1000},right:{tag:'seq',left:{tag:'note',pitch:'c3',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'c3',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'c3',dur:333.3333333333333},right:{tag:'seq',left:{tag:'note',pitch:'c3',dur:250},right:{tag:'seq',left:{tag:'note',pitch:'g2',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'g2',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'g2',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'g3',dur:250},right:{tag:'seq',left:{tag:'note',pitch:'g3',dur:250},right:{tag:'seq',left:{tag:'note',pitch:'e3',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'e3',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'a3',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'a3',dur:500},right:{tag:'seq',left:{tag:'note',pitch:'d3',dur:500},right:{tag:'rest',dur:1000}}}}}}}}}}}}}}}}}}}}}}}}}
	},

];

testrunner.run(test_cases, function(tc){
	if ('output' in tc) {
		assert.deepEqual(parse(tc.input), tc.output);
	} else if ('expect_fail' in tc && tc.expect_fail) {
		try {
			parse(tc.input);
		} catch (e) {
			// we wanted it to fail!
			return true;
		}
		// fail test
		return false;
	}
});
