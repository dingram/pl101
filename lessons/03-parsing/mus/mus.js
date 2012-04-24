var PEG = require('pegjs');
var assert = require('assert');
var fs = require('fs'); // for loading files
var testrunner = require('../../../lib/testrunner.js');
var util = require('util');

var data = fs.readFileSync('mus.peg', 'utf-8');
//console.log(data);

var parse;
try {
	parse = PEG.buildParser(data).parse;
} catch (e) {
	console.log(util.inspect(e, false, null));
	return;
}

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
		output: {tag:'note', pitch: 'a4', dur: 1000, len: 4} },
	{ message: 'Quarter note with length at tempo 120',
		input: "\\tempo 120 a4:4",
		output: {tag:'note', pitch: 'a4', dur: 500, len: 4} },
	{ message: 'Quarter note with length at tempo 8=120',
		input: "\\tempo 8=120 a4:4",
		output: {tag:'note', pitch: 'a4', dur: 1000, len: 4} },
	{ message: 'Two quarter notes with length (default tempo)',
		input: "a4:4 b4:4",
		output: {tag: 'seq', left:{tag:'note', pitch: 'a4', dur: 1000, len: 4}, right: {tag:'note', pitch: 'b4', dur: 1000, len: 4} } },
	{ message: 'Three quarter notes with length (default tempo)',
		input: "a4:4 b4:4 c4:2",
		output: {tag: 'seq', left:{tag:'note', pitch: 'a4', dur: 1000, len: 4}, right: {tag: 'seq', left: {tag:'note', pitch: 'b4', dur: 1000, len: 4}, right: {tag:'note', pitch: 'c4', dur: 2000, len: 2} } } },

	{ message: 'C major chord, quarter notes with length (default tempo)',
		input: "<< a4:4 b4:4 c4:4 >>",
		output: {tag: 'par', left:{tag:'note', pitch: 'a4', dur: 1000, len:4}, right: {tag: 'par', left: {tag:'note', pitch: 'b4', dur: 1000, len: 4}, right: {tag:'note', pitch: 'c4', dur: 1000, len: 4} } } },

	{ message: 'Two sequences played in parallel',
		input: "<< { a4:4 b4:4 } { c4:4 d4:4 } >>",
		output: {tag: 'par', left: {tag: 'seq', left: {tag:'note', pitch: 'a4', dur: 1000, len: 4}, right: {tag:'note', pitch: 'b4', dur: 1000, len: 4} }, right: {tag: 'seq', left: {tag:'note', pitch: 'c4', dur: 1000, len: 4}, right: {tag:'note', pitch: 'd4', dur: 1000, len: 4} } } },

	{ message: 'C major chord with minified syntax, quarter notes with duration (default tempo)',
		input: "< a4 b4 c4 >/1000",
		output: {tag: 'par', left:{tag:'note', pitch: 'a4', dur: 1000}, right: {tag: 'par', left: {tag:'note', pitch: 'b4', dur: 1000}, right: {tag:'note', pitch: 'c4', dur: 1000} } } },
	{ message: 'C major chord with minified syntax, quarter notes with length (default tempo)',
		input: "< a4 b4 c4 >:4",
		output: {tag: 'par', left:{tag:'note', pitch: 'a4', dur: 1000, len:4}, right: {tag: 'par', left: {tag:'note', pitch: 'b4', dur: 1000, len: 4}, right: {tag:'note', pitch: 'c4', dur: 1000, len: 4} } } },

	{ message: 'Two quarter notes with half-note rest + length (default tempo)',
		input: "a4:4 r:2 b4:4",
		output: { tag: 'seq',
		 left: { tag: 'note', pitch: 'a4', dur: 1000, len: 4 },
		 right:
			{ tag: 'seq',
				left: { tag: 'rest', dur: 2000, len: 2 },
				right: { tag: 'note', pitch: 'b4', dur: 1000, len: 4 } } }
	},
	{ message: 'Three quarter notes with eighth-note rests + length (default tempo)',
		input: "a4:4 r:8 b4:4 r:8 c4:4",
		output: { tag: 'seq',
		 left: { tag: 'note', pitch: 'a4', dur: 1000, len: 4 },
		 right:
			{ tag: 'seq',
				left: { tag: 'rest', dur: 500, len: 8 },
				right:
				 { tag: 'seq',
					 left: { tag: 'note', pitch: 'b4', dur: 1000, len: 4 },
					 right:
						{ tag: 'seq',
							left: { tag: 'rest', dur: 500, len: 8 },
							right: { tag: 'note', pitch: 'c4', dur: 1000, len: 4 } } } } }
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
		output: {tag: 'repeat', section:{tag:'note', pitch: 'a4', dur: 1000, len: 4}, count: 2} },
	{ message: "Repeat one note 4x",
		input: "|: a4:4 :| (4)",
		output: {tag: 'repeat', section:{tag:'note', pitch: 'a4', dur: 1000, len: 4}, count: 4} },

	{ message: "Repeat a sequence 2x (default)",
		input: "|: a4:4 b4:4 :|",
		output: {tag: 'repeat', section:{tag: 'seq', left:{tag:'note', pitch: 'a4', dur: 1000, len: 4}, right: {tag:'note', pitch: 'b4', dur: 1000, len: 4} }, count: 2} },
	{ message: "Repeat a sequence 4x",
		input: "|: a4:4 b4:4 :| (4)",
		output: {tag: 'repeat', section:{tag: 'seq', left:{tag:'note', pitch: 'a4', dur: 1000, len: 4}, right: {tag:'note', pitch: 'b4', dur: 1000, len: 4} }, count: 4} },

	{ message: "Comment style 1",
		input: "|: a4:4 /* This is a comment */ b4:4 :|",
		output: {tag: 'repeat', section:{tag: 'seq', left:{tag:'note', pitch: 'a4', dur: 1000, len: 4}, right: {tag:'note', pitch: 'b4', dur: 1000, len: 4} }, count: 2} },
	{ message: "Comment style 2",
		input: "|: a4:4 %{ This is a comment %} b4:4 :| (4)",
		output: {tag: 'repeat', section:{tag: 'seq', left:{tag:'note', pitch: 'a4', dur: 1000, len: 4}, right: {tag:'note', pitch: 'b4', dur: 1000, len: 4} }, count: 4} },
	{ message: "Comment style 3",
		input: "|: a4:4\n% This is a comment\n  b4:4 :| (4)",
		output: {tag: 'repeat', section:{tag: 'seq', left:{tag:'note', pitch: 'a4', dur: 1000, len: 4}, right: {tag:'note', pitch: 'b4', dur: 1000, len: 4} }, count: 4} },
	{ message: "Comment style 3b",
		input: "|: a4:4 % This is a comment\n b4:4 :| (4)",
		output: {tag: 'repeat', section:{tag: 'seq', left:{tag:'note', pitch: 'a4', dur: 1000, len: 4}, right: {tag:'note', pitch: 'b4', dur: 1000, len: 4} }, count: 4} },

	{ message: 'Notes missing length (after the first)',
		input: "a4:4 b4 c4",
		output: {tag: 'seq', left:{tag:'note', pitch: 'a4', dur: 1000, len: 4}, right: {tag: 'seq', left: {tag:'note', pitch: 'b4', dur: 1000, len: 4}, right: {tag:'note', pitch: 'c4', dur: 1000, len: 4} } } },
	{ message: 'Notes missing length #2',
		input: "a4:4 b4 c4:2 d4",
		output: {tag: 'seq', left:{tag:'note', pitch: 'a4', dur: 1000, len: 4}, right: {tag: 'seq', left: {tag:'note', pitch: 'b4', dur: 1000, len: 4}, right: {tag:'seq', left:{tag:'note', pitch: 'c4', dur: 2000, len: 2}, right: {tag:'note', pitch: 'd4', dur: 2000, len: 2} } } } },

	{ message: 'Notes missing octave (after the first)',
		input: "a4:4 b:4 c:4",
		output: {tag: 'seq', left:{tag:'note', pitch: 'a4', dur: 1000, len: 4}, right: {tag: 'seq', left: {tag:'note', pitch: 'b4', dur: 1000, len: 4}, right: {tag:'note', pitch: 'c4', dur: 1000, len: 4} } } },
	{ message: 'Notes missing octave #2',
		input: "a4:4 b:4 c5:2 d:2",
		output: {tag: 'seq', left:{tag:'note', pitch: 'a4', dur: 1000, len: 4}, right: {tag: 'seq', left: {tag:'note', pitch: 'b4', dur: 1000, len: 4}, right: {tag:'seq', left:{tag:'note', pitch: 'c5', dur: 2000, len: 2}, right: {tag:'note', pitch: 'd5', dur: 2000, len: 2} } } } },

	{ message: 'Notes missing octave and length (after the first)',
		input: "a4:4 b c",
		output: {tag: 'seq', left:{tag:'note', pitch: 'a4', dur: 1000, len: 4}, right: {tag: 'seq', left: {tag:'note', pitch: 'b4', dur: 1000, len: 4}, right: {tag:'note', pitch: 'c4', dur: 1000, len: 4} } } },
	{ message: 'Notes missing octave and length #2',
		input: "a4:4 b c5:2 d",
		output: {tag: 'seq', left:{tag:'note', pitch: 'a4', dur: 1000, len: 4}, right: {tag: 'seq', left: {tag:'note', pitch: 'b4', dur: 1000, len: 4}, right: {tag:'seq', left:{tag:'note', pitch: 'c5', dur: 2000, len: 2}, right: {tag:'note', pitch: 'd5', dur: 2000, len: 2} } } } },

	{ message: 'Advanced commands',
		input: "\\tempo 4=163 \\clef treble \\time 3/4 \\key c e5:4. f:8 e d c:4. d:8 c b4 a:4 b c5 g4:2 e5:4 f:4. e:8 d:4 a g b4 c5:4. c:8 c:4 c:2.",
		output: {tag:'seq',left:{tag:'clef',type:'treble'},right:{tag:'seq',left:{tag:'timesig',beats:3,base:4},right:{tag:'seq',left:{tag:'keysig',pitch:'c0',minor:false},right:{tag:'seq',left:{tag:'note',pitch:'e5',dur:245.39877300613497,len:6},right:{tag:'seq',left:{tag:'note',pitch:'f5',dur:184.04907975460122,len:8},right:{tag:'seq',left:{tag:'note',pitch:'e5',dur:184.04907975460122,len:8},right:{tag:'seq',left:{tag:'note',pitch:'d5',dur:184.04907975460122,len:8},right:{tag:'seq',left:{tag:'note',pitch:'c5',dur:245.39877300613497,len:6},right:{tag:'seq',left:{tag:'note',pitch:'d5',dur:184.04907975460122,len:8},right:{tag:'seq',left:{tag:'note',pitch:'c5',dur:184.04907975460122,len:8},right:{tag:'seq',left:{tag:'note',pitch:'b4',dur:184.04907975460122,len:8},right:{tag:'seq',left:{tag:'note',pitch:'a4',dur:368.09815950920245,len:4},right:{tag:'seq',left:{tag:'note',pitch:'b4',dur:368.09815950920245,len:4},right:{tag:'seq',left:{tag:'note',pitch:'c5',dur:368.09815950920245,len:4},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:736.1963190184049,len:2},right:{tag:'seq',left:{tag:'note',pitch:'e5',dur:368.09815950920245,len:4},right:{tag:'seq',left:{tag:'note',pitch:'f5',dur:245.39877300613497,len:6},right:{tag:'seq',left:{tag:'note',pitch:'e5',dur:184.04907975460122,len:8},right:{tag:'seq',left:{tag:'note',pitch:'d5',dur:368.09815950920245,len:4},right:{tag:'seq',left:{tag:'note',pitch:'a5',dur:368.09815950920245,len:4},right:{tag:'seq',left:{tag:'note',pitch:'g5',dur:368.09815950920245,len:4},right:{tag:'seq',left:{tag:'note',pitch:'b4',dur:368.09815950920245,len:4},right:{tag:'seq',left:{tag:'note',pitch:'c5',dur:245.39877300613497,len:6},right:{tag:'seq',left:{tag:'note',pitch:'c5',dur:184.04907975460122,len:8},right:{tag:'seq',left:{tag:'note',pitch:'c5',dur:368.09815950920245,len:4},right:{tag:'note',pitch:'c5',dur:490.79754601226995,len:3}}}}}}}}}}}}}}}}}}}}}}}}}}
	},

	{ message: "Twinkle Twinkle Little Star",
		input: "c4:4 c4:4 g4:4 g4:4 a4:4 a4:4 g4:2\nf4:4 f4:4 e4:4 e4:4 d4:4 d4:4 c4:2\n|: g4:4 g4:4 f4:4 f4:4 e4:4 e4:4 d4:2 :|\nc4:4 c4:4 g4:4 g4:4 a4:4 a4:4 g4:2\nf4:4 f4:4 e4:4 e4:4 d4:4 d4:4 c4:2",
		output:{tag:'seq',left:{tag:'note',pitch:'c4',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'c4',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'a4',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'a4',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:2000,len:2},right:{tag:'seq',left:{tag:'note',pitch:'f4',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'f4',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'e4',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'e4',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'d4',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'d4',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'c4',dur:2000,len:2},right:{tag:'seq',left:{tag:'repeat',section:{tag:'seq',left:{tag:'note',pitch:'g4',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'f4',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'f4',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'e4',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'e4',dur:1000,len:4},right:{tag:'note',pitch:'d4',dur:2000,len:2}}}}}}},count:2},right:{tag:'seq',left:{tag:'note',pitch:'c4',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'c4',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'a4',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'a4',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:2000,len:2},right:{tag:'seq',left:{tag:'note',pitch:'f4',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'f4',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'e4',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'e4',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'d4',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'d4',dur:1000,len:4},right:{tag:'note',pitch:'c4',dur:2000,len:2}}}}}}}}}}}}}}}}}}}}}}}}}}}}}
	},

	{ message: "Jingle Bells",
		input: "<<\n{ |: b4:8 b4:8 b4:4 :|\nb4:8 d5:8 g4:8. a4:16 b4:4 r:4\nc5:8 c5:8 c5:8. c5:16 c5:8 b4:8 b4:8 b4:16 b4:16\nb4:8 a4:8 a4:8 g4:8 a4:8 r:4 }\n\n{ |: g4:8 g4:8 g4:4 :|\ng4:8 g5:8 d4:8. d4:16 g4:4 r:4\ne4:8 e4:8 e4:8. e4:16 e4:8 d4:8 d4:8 G4:16 G4:16\ng4:8 g4:8 g4:8 g4:8 f#4:8 r:4 }\n\n{ |: d4:8 d4:8 d4:4 :|\nd4:8 b3:8 b3:8. c4:16 d4:4 r:4\ng3:8 g3:8 g3:8. g3:16 g3:8 g3:8 g3:8 d4:16 d4:16\nc#4:8 c#4:8 c#4:8 c#4:8 d4:8 r:4 }\n\n{ |: g3:8 g3:8 g3:4 :|\ng3:8 g3:8 g3:8. g3:16 g3:4 r:4\nc3:8 c3:8 c3:8. c3:16 g2:8 g2:8 g2:8 g3:16 g3:16\ne3:8 e3:8 a3:8 a3:8 d3:8 r:4 }\n>>",
		output: {tag:'par',left:{tag:'seq',left:{tag:'repeat',section:{tag:'seq',left:{tag:'note',pitch:'b4',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'b4',dur:500,len:8},right:{tag:'note',pitch:'b4',dur:1000,len:4}}},count:2},right:{tag:'seq',left:{tag:'note',pitch:'b4',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'d5',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:333.3333333333333,len:12},right:{tag:'seq',left:{tag:'note',pitch:'a4',dur:250,len:16},right:{tag:'seq',left:{tag:'note',pitch:'b4',dur:1000,len:4},right:{tag:'seq',left:{tag:'rest',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'c5',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'c5',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'c5',dur:333.3333333333333,len:12},right:{tag:'seq',left:{tag:'note',pitch:'c5',dur:250,len:16},right:{tag:'seq',left:{tag:'note',pitch:'c5',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'b4',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'b4',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'b4',dur:250,len:16},right:{tag:'seq',left:{tag:'note',pitch:'b4',dur:250,len:16},right:{tag:'seq',left:{tag:'note',pitch:'b4',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'a4',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'a4',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'a4',dur:500,len:8},right:{tag:'rest',dur:1000,len:4}}}}}}}}}}}}}}}}}}}}}},right:{tag:'par',left:{tag:'seq',left:{tag:'repeat',section:{tag:'seq',left:{tag:'note',pitch:'g4',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:500,len:8},right:{tag:'note',pitch:'g4',dur:1000,len:4}}},count:2},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'g5',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'d4',dur:333.3333333333333,len:12},right:{tag:'seq',left:{tag:'note',pitch:'d4',dur:250,len:16},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:1000,len:4},right:{tag:'seq',left:{tag:'rest',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'e4',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'e4',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'e4',dur:333.3333333333333,len:12},right:{tag:'seq',left:{tag:'note',pitch:'e4',dur:250,len:16},right:{tag:'seq',left:{tag:'note',pitch:'e4',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'d4',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'d4',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'G4',dur:250,len:16},right:{tag:'seq',left:{tag:'note',pitch:'G4',dur:250,len:16},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'g4',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'f#4',dur:500,len:8},right:{tag:'rest',dur:1000,len:4}}}}}}}}}}}}}}}}}}}}}},right:{tag:'par',left:{tag:'seq',left:{tag:'repeat',section:{tag:'seq',left:{tag:'note',pitch:'d4',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'d4',dur:500,len:8},right:{tag:'note',pitch:'d4',dur:1000,len:4}}},count:2},right:{tag:'seq',left:{tag:'note',pitch:'d4',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'b3',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'b3',dur:333.3333333333333,len:12},right:{tag:'seq',left:{tag:'note',pitch:'c4',dur:250,len:16},right:{tag:'seq',left:{tag:'note',pitch:'d4',dur:1000,len:4},right:{tag:'seq',left:{tag:'rest',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'g3',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'g3',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'g3',dur:333.3333333333333,len:12},right:{tag:'seq',left:{tag:'note',pitch:'g3',dur:250,len:16},right:{tag:'seq',left:{tag:'note',pitch:'g3',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'g3',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'g3',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'d4',dur:250,len:16},right:{tag:'seq',left:{tag:'note',pitch:'d4',dur:250,len:16},right:{tag:'seq',left:{tag:'note',pitch:'c#4',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'c#4',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'c#4',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'c#4',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'d4',dur:500,len:8},right:{tag:'rest',dur:1000,len:4}}}}}}}}}}}}}}}}}}}}}},right:{tag:'seq',left:{tag:'repeat',section:{tag:'seq',left:{tag:'note',pitch:'g3',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'g3',dur:500,len:8},right:{tag:'note',pitch:'g3',dur:1000,len:4}}},count:2},right:{tag:'seq',left:{tag:'note',pitch:'g3',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'g3',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'g3',dur:333.3333333333333,len:12},right:{tag:'seq',left:{tag:'note',pitch:'g3',dur:250,len:16},right:{tag:'seq',left:{tag:'note',pitch:'g3',dur:1000,len:4},right:{tag:'seq',left:{tag:'rest',dur:1000,len:4},right:{tag:'seq',left:{tag:'note',pitch:'c3',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'c3',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'c3',dur:333.3333333333333,len:12},right:{tag:'seq',left:{tag:'note',pitch:'c3',dur:250,len:16},right:{tag:'seq',left:{tag:'note',pitch:'g2',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'g2',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'g2',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'g3',dur:250,len:16},right:{tag:'seq',left:{tag:'note',pitch:'g3',dur:250,len:16},right:{tag:'seq',left:{tag:'note',pitch:'e3',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'e3',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'a3',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'a3',dur:500,len:8},right:{tag:'seq',left:{tag:'note',pitch:'d3',dur:500,len:8},right:{tag:'rest',dur:1000,len:4}}}}}}}}}}}}}}}}}}}}}}}}}
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
