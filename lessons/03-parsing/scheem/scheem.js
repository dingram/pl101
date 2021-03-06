var PEG = require('pegjs');
var assert = require('assert');
var fs = require('fs'); // for loading files
var testrunner = require('../../../lib/testrunner.js');

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
	{ message: 'Multiple whitespace',
		input: '(a  (b  (c  d)  e))',
		output: ['a', ['b', ['c', 'd'], 'e']] },
	{ message: 'Whitespace around brackets #1',
		input: '( a (b (c d) e))',
		output: ['a', ['b', ['c', 'd'], 'e']] },
	{ message: 'Whitespace around brackets #2',
		input: '(a (b (c d) e ))',
		output: ['a', ['b', ['c', 'd'], 'e']] },
	{ message: 'Whitespace around brackets #3',
		input: '(a (b ( c d ) e))',
		output: ['a', ['b', ['c', 'd'], 'e']] },
	{ message: 'Whitespace around brackets #4',
		input: "( \t a ( b ( c d ) e ))",
		output: ['a', ['b', ['c', 'd'], 'e']] },
	{ message: 'Whitespace, including newlines',
		input: "( \t a\n  (b\n     (c d)\n  e)\n)",
		output: ['a', ['b', ['c', 'd'], 'e']] },
	{ message: 'Quote support (atom)',
		input: "'x",
		output: ['quote', 'x'] },
	{ message: 'Quote support (list)',
		input: "'(x y z)",
		output: ['quote', ['x', 'y', 'z']] },
	{ message: 'Quote support (nested list)',
		input: "'(x (y) z)",
		output: ['quote', ['x', ['y'], 'z']] },
	{ message: 'Quote support (inside a list)',
		input: "(x '(y) z)",
		output: ['x', ['quote', ['y']], 'z'] },
	{ message: 'Quote support (inside a list)',
		input: "(x '(y) z)",
		output: ['x', ['quote', ['y']], 'z'] },
	{ message: 'Comment support',
		input: ";; This is a comment\n(x '(y) z)",
		output: ['x', ['quote', ['y']], 'z'] },
	{ message: 'Comment support (within an expression)',
		input: ";; This is a comment\n(x \n;; as is this\n  '(y)\n  z)",
		output: ['x', ['quote', ['y']], 'z'] },
	{ message: 'Comment support (at the end of a line)',
		input: ";; This is a comment\n(x ;; as is this\n  '(y)\n  z)",
		output: ['x', ['quote', ['y']], 'z'] },
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
