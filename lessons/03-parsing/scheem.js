var PEG = require('pegjs');
var assert = require('assert');
var fs = require('fs'); // for loading files
var testrunner = require('../../lib/testrunner.js');

var data = fs.readFileSync('scheem.peg', 'utf-8');
//console.log(data);
var parse = PEG.buildParser(data).parse;

var test_cases = [
	{ message: 'Empty string',
		input: '',
		expect_fail: true },
	{ message: 'Single atom',
		input: '(a b c)',
		output: ['a', 'b', 'c'] },
	{ message: 'One-element list',
		input: '(a)',
		output: ['a'] },
	{ message: 'Two-element list',
		input: '(a b)',
		output: ['a', 'b'] },
	{ message: 'Three-element list',
		input: '(a b c)',
		output: ['a', 'b', 'c'] },
	{ message: 'Nested list',
		input: '(a (b c))',
		output: ['a', ['b', 'c']] },
	{ message: 'Double-nested list',
		input: '(a (b (c d) e))',
		output: ['a', ['b', ['c', 'd'], 'e']] },
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
