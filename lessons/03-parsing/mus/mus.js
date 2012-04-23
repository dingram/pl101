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
	{ message: 'Two sequences played together',
		input: "<< { a4:4 b4:4 } { c4:4 d4:4 } >>",
		output: {tag: 'par', left: {tag: 'seq', left: {tag:'note', pitch: 'a4', dur: 1000 }, right: {tag:'note', pitch: 'b4', dur: 1000} }, right: {tag: 'seq', left: {tag:'note', pitch: 'c4', dur: 1000 }, right: {tag:'note', pitch: 'd4', dur: 1000} } } },
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
