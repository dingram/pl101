if (typeof module !== 'undefined') {
	// In Node load required modules
	var assert = require('chai').assert;
	var expect = require('chai').expect;
	var scheem = require('../scheem');
	var evalScheem = scheem.evalScheem;
	var evalScheemString = scheem.evalScheemString;
	var scheemToString = scheem.stringify;
	var add_binding = scheem.add_binding;
} else {
	// In browser assume already loaded by <script> tags
	var assert = chai.assert;
	var expect = chai.expect;
}

suite('begin', function() {
	test('simply quote a number', function() {
		assert.deepEqual(
			evalScheem(['begin', ['quote', 3]]),
			3
			);
	});
	test('simply quote a double-digit number', function() {
		assert.deepEqual(
			evalScheem(['begin', ['quote', 42]]),
			42
			);
	});
	test('simple arithmetic', function() {
		assert.deepEqual(
			evalScheem(['begin', ['*', ['+', 4, 2], ['-', 10, 3]]]),
			42
			);
	});
	test('multiple expressions', function() {
		assert.deepEqual(
			evalScheem(['begin', ['+', 3, 2], ['*', ['+', 4, 2], ['-', 9, 2]]]),
			42
			);
	});
});

suite('define', function() {
	test('simple variable, atom', function() {
		var env = {};
		assert.deepEqual(
			evalScheem(['define', 'x', 2], env),
			0
			);
		assert.deepEqual(
			env.name,
			'x'
			);
		assert.deepEqual(
			env.value,
			2
			);
	});
	test('simple variable, list', function() {
		var env = {};
		assert.deepEqual(
			evalScheem(['define', 'x', ['quote', [1, 2]]], env),
			0
			);
		assert.deepEqual(
			env.name,
			'x'
			);
		assert.deepEqual(
			env.value,
			[1, 2]
			);
	});
	test('variable definition and usage', function() {
		assert.deepEqual(
			evalScheem(['begin', ['define', 'x', 2], ['*', ['+', 4, 'x'], ['-', 9, 'x']]]),
			42
			);
	});
});

suite('set!', function() {
	test('simple variable, atom', function() {
		var env = {};
		assert.deepEqual(
			evalScheem(['begin', ['define', 'x', 2], ['set!', 'x', 3]], env),
			0
			);
		assert.deepEqual(
			env.name,
			'x'
			);
		assert.deepEqual(
			env.value,
			3
			);
	});
	test('simple variable, list', function() {
		var env = {};
		assert.deepEqual(
			evalScheem(['begin', ['define', 'x', ['quote', [1, 2]]], ['set!', 'x', ['quote', [3, 4]]]], env),
			0
			);
		assert.deepEqual(
			env.name,
			'x'
			);
		assert.deepEqual(
			env.value,
			[3, 4]
			);
	});
	test('variable definition and usage', function() {
		assert.deepEqual(
			evalScheem(['begin', ['define', 'x', 0], ['set!', 'x', 2], ['*', ['+', 4, 'x'], ['-', 9, 'x']]]),
			42
			);
	});
	test('an undefined variable', function() {
		expect(function(){
			evalScheem(['begin', ['set!', 'x', 2]]);
		}).to.throw();
	});
});

suite('quote', function() {
	test('a number', function() {
		assert.deepEqual(
			evalScheem(['quote', 3]),
			3
			);
	});
	test('an atom', function() {
		assert.deepEqual(
			evalScheem(['quote', 'dog']),
			'dog'
			);
	});
	test('a list', function() {
		assert.deepEqual(
			evalScheem(['quote', [1, 2, 3]]),
			[1, 2, 3]
			);
	});
	test('zero arguments', function() {
		expect(function(){
			evalScheem(['quote']);
		}).to.throw();
	});
	test('more than one argument', function() {
		expect(function(){
			evalScheem(['quote', 3, 4]);
		}).to.throw();
	});
});

suite('cons', function() {
	test('atom onto an empty list', function() {
		assert.deepEqual(
			evalScheem(['cons', 1, ['quote', []]]),
			[1]
			);
	});
	test('atom onto a two-item list', function() {
		assert.deepEqual(
			evalScheem(['cons', 1, ['quote', [2, 3]]]),
			[1, 2, 3]
			);
	});
	test('list onto an empty list', function() {
		assert.deepEqual(
			evalScheem(['cons', ['quote', [1]], ['quote', []]]),
			[[1]]
			);
	});
	test('list onto a two-item list', function() {
		assert.deepEqual(
			evalScheem(['cons', ['quote', [1]], ['quote', [2, 3]]]),
			[[1], 2, 3]
			);
	});
});

suite('car', function() {
	test('of a multi-item list (atom)', function() {
		assert.deepEqual(
			evalScheem(['car', ['quote', [1, 2, 3]]]),
			1
			);
	});
	test('of a multi-item list (list)', function() {
		assert.deepEqual(
			evalScheem(['car', ['quote', [[1,2], 3, 4]]]),
			[1, 2]
			);
	});
	test('of a single-item list', function() {
		assert.deepEqual(
			evalScheem(['car', ['quote', [1]]]),
			1
			);
	});
	test('of an empty list', function() {
		assert.deepEqual(
			evalScheem(['car', ['quote', []]]),
			undefined
			);
	});
});

suite('cdr', function() {
	test('of a multi-item list (atom)', function() {
		assert.deepEqual(
			evalScheem(['cdr', ['quote', [1, 2, 3]]]),
			[2, 3]
			);
	});
	test('of a multi-item list (list)', function() {
		assert.deepEqual(
			evalScheem(['cdr', ['quote', [[1,2], [3,4], [5,6]]]]),
			[[3,4], [5,6]]
			);
	});
	test('of a single-item list', function() {
		assert.deepEqual(
			evalScheem(['cdr', ['quote', [1]]]),
			[]
			);
	});
	test('of an empty list', function() {
		assert.deepEqual(
			evalScheem(['cdr', ['quote', []]]),
			[]
			);
	});
});

suite('addition', function() {
	test('of two items (both positive)', function() {
		assert.deepEqual(
			evalScheem(['+', 1, 2]),
			3
			);
	});
	test('of two items (inc negative)', function() {
		assert.deepEqual(
			evalScheem(['+', -1, 2]),
			1
			);
	});
	test('of two items (both negative)', function() {
		assert.deepEqual(
			evalScheem(['+', -1, -2]),
			-3
			);
	});
	test('of many items', function() {
		assert.deepEqual(
			evalScheem(['+', 1, 2, -3, 4, 5, -6, 7, 8, -9, 10]),
			19
			);
	});
});

suite('subtraction', function() {
	test('of two items (both positive)', function() {
		assert.deepEqual(
			evalScheem(['-', 1, 2]),
			-1
			);
	});
	test('of two items (inc negative)', function() {
		assert.deepEqual(
			evalScheem(['-', -1, 2]),
			-3
			);
	});
	test('of two items (both negative)', function() {
		assert.deepEqual(
			evalScheem(['-', -1, -2]),
			1
			);
	});
});

suite('multiplication', function() {
	test('of two items (both positive)', function() {
		assert.deepEqual(
			evalScheem(['*', 2, 4]),
			8
			);
	});
	test('of two items (inc negative)', function() {
		assert.deepEqual(
			evalScheem(['*', -1, 2]),
			-2
			);
	});
	test('of two items (both negative)', function() {
		assert.deepEqual(
			evalScheem(['*', -2, -4]),
			8
			);
	});
	test('of many items', function() {
		assert.deepEqual(
			evalScheem(['*', 1, 2, -3, 4, 5, -6, 7, 8, -9, 10]),
			-3628800
			);
	});
});

suite('division', function() {
	test('of two items (both positive)', function() {
		assert.deepEqual(
			evalScheem(['/', 1, 2]),
			0.5
			);
	});
	test('of two items (inc negative)', function() {
		assert.deepEqual(
			evalScheem(['/', -1, 2]),
			-0.5
			);
	});
	test('of two items (both negative)', function() {
		assert.deepEqual(
			evalScheem(['/', -1, -2]),
			0.5
			);
	});
});

suite('equality', function() {
	test('of two equal items (both integer atoms)', function() {
		assert.deepEqual(
			evalScheem(['=', 1, 1]),
			'#t'
			);
	});
	test('of two inequal items (both integer atoms)', function() {
		assert.deepEqual(
			evalScheem(['=', 2, 1]),
			'#f'
			);
	});
	test('of two equal items (both 2-item integer lists)', function() {
		assert.deepEqual(
			evalScheem(['=', ['quote', [1, 2]], ['quote', [1, 2]]]),
			'#t'
			);
	});
	test('of two inequal items (both 2-item integer lists)', function() {
		assert.deepEqual(
			evalScheem(['=', ['quote', [1, 2]], ['quote', [2, 1]]]),
			'#f'
			);
	});
});

suite('less-than', function() {
	test('of two items (both integer atoms)', function() {
		assert.deepEqual(
			evalScheem(['<', 1, 2]),
			'#t'
			);
	});
	test('of two more items (both integer atoms)', function() {
		assert.deepEqual(
			evalScheem(['<', 2, 1]),
			'#f'
			);
	});
	test('of two items (both 2-item integer lists)', function() {
		assert.deepEqual(
			evalScheem(['<', ['quote', [1, 2]], ['quote', [2, 3]]]),
			'#t'
			);
	});
	test('of two more items (both 2-item integer lists)', function() {
		assert.deepEqual(
			evalScheem(['<', ['quote', [1, 2]], ['quote', [2, 1]]]),
			'#f'
			);
	});
});

suite('boolean?', function() {
	test('#t', function() {
		assert.deepEqual(
			evalScheem(['boolean?', '#t']),
			'#t'
			);
	});
	test('#f', function() {
		assert.deepEqual(
			evalScheem(['boolean?', '#f']),
			'#t'
			);
	});
	test('0', function() {
		assert.deepEqual(
			evalScheem(['boolean?', 0]),
			'#f'
			);
	});
	test('1', function() {
		assert.deepEqual(
			evalScheem(['boolean?', 1]),
			'#f'
			);
	});
	test('x', function() {
		assert.deepEqual(
			evalScheem(['boolean?', ['quote', 'x']]),
			'#f'
			);
	});
	test('\'()', function() {
		assert.deepEqual(
			evalScheem(['boolean?', ['quote', []]]),
			'#f'
			);
	});
	test('\'(#t #f 1 x)', function() {
		assert.deepEqual(
			evalScheem(['boolean?', ['quote', ['#t', '#f', 1, 'x', []]]]),
			'#f'
			);
	});
});

suite('number?', function() {
	test('#t', function() {
		assert.deepEqual(
			evalScheem(['number?', '#t']),
			'#f'
			);
	});
	test('#f', function() {
		assert.deepEqual(
			evalScheem(['number?', '#f']),
			'#f'
			);
	});
	test('0', function() {
		assert.deepEqual(
			evalScheem(['number?', 0]),
			'#t'
			);
	});
	test('1', function() {
		assert.deepEqual(
			evalScheem(['number?', 1]),
			'#t'
			);
	});
	test('x', function() {
		assert.deepEqual(
			evalScheem(['number?', ['quote', 'x']]),
			'#f'
			);
	});
	test('\'()', function() {
		assert.deepEqual(
			evalScheem(['number?', ['quote', []]]),
			'#f'
			);
	});
	test('\'(#t #f 1 x)', function() {
		assert.deepEqual(
			evalScheem(['number?', ['quote', ['#t', '#f', 1, 'x', []]]]),
			'#f'
			);
	});
});

suite('symbol?', function() {
	test('#t', function() {
		assert.deepEqual(
			evalScheem(['symbol?', '#t']),
			'#f'
			);
	});
	test('#f', function() {
		assert.deepEqual(
			evalScheem(['symbol?', '#f']),
			'#f'
			);
	});
	test('0', function() {
		assert.deepEqual(
			evalScheem(['symbol?', 0]),
			'#f'
			);
	});
	test('1', function() {
		assert.deepEqual(
			evalScheem(['symbol?', 1]),
			'#f'
			);
	});
	test('x', function() {
		assert.deepEqual(
			evalScheem(['symbol?', ['quote', 'x']]),
			'#t'
			);
	});
	test('\'()', function() {
		assert.deepEqual(
			evalScheem(['symbol?', ['quote', []]]),
			'#f'
			);
	});
	test('\'(#t #f 1 x)', function() {
		assert.deepEqual(
			evalScheem(['symbol?', ['quote', ['#t', '#f', 1, 'x', []]]]),
			'#f'
			);
	});
});

suite('list?', function() {
	test('#t', function() {
		assert.deepEqual(
			evalScheem(['list?', '#t']),
			'#f'
			);
	});
	test('#f', function() {
		assert.deepEqual(
			evalScheem(['list?', '#f']),
			'#f'
			);
	});
	test('0', function() {
		assert.deepEqual(
			evalScheem(['list?', 0]),
			'#f'
			);
	});
	test('1', function() {
		assert.deepEqual(
			evalScheem(['list?', 1]),
			'#f'
			);
	});
	test('x', function() {
		assert.deepEqual(
			evalScheem(['list?', ['quote', 'x']]),
			'#f'
			);
	});
	test('\'()', function() {
		assert.deepEqual(
			evalScheem(['list?', ['quote', []]]),
			'#t'
			);
	});
	test('\'(#t #f 1 x)', function() {
		assert.deepEqual(
			evalScheem(['list?', ['quote', ['#t', '#f', 1, 'x', []]]]),
			'#t'
			);
	});
});

suite('and', function() {
	test('f f = f', function() {
		assert.deepEqual(
			evalScheem(['and', '#f', '#f']),
			'#f'
			);
	});
	test('f t = f', function() {
		assert.deepEqual(
			evalScheem(['and', '#f', '#t']),
			'#f'
			);
	});
	test('t f = f', function() {
		assert.deepEqual(
			evalScheem(['and', '#t', '#f']),
			'#f'
			);
	});
	test('t t = t', function() {
		assert.deepEqual(
			evalScheem(['and', '#t', '#t']),
			'#t'
			);
	});
	test('of two items', function() {
		assert.deepEqual(
			evalScheem(['and', ['=', 1, 1], ['=', 2, 2]]),
			'#t'
			);
	});
});

suite('or', function() {
	test('f f = f', function() {
		assert.deepEqual(
			evalScheem(['or', '#f', '#f']),
			'#f'
			);
	});
	test('f t = t', function() {
		assert.deepEqual(
			evalScheem(['or', '#f', '#t']),
			'#t'
			);
	});
	test('t f = t', function() {
		assert.deepEqual(
			evalScheem(['or', '#t', '#f']),
			'#t'
			);
	});
	test('t t = t', function() {
		assert.deepEqual(
			evalScheem(['or', '#t', '#t']),
			'#t'
			);
	});
	test('of two items', function() {
		assert.deepEqual(
			evalScheem(['or', ['=', 2, 1], ['=', 2, 2]]),
			'#t'
			);
	});
});

suite('not', function() {
	test('f = t', function() {
		assert.deepEqual(
			evalScheem(['not', '#f']),
			'#t'
			);
	});
	test('f t = t', function() {
		assert.deepEqual(
			evalScheem(['not', '#t']),
			'#f'
			);
	});
	test('of a true item', function() {
		assert.deepEqual(
			evalScheem(['not', ['=', 2, 2]]),
			'#f'
			);
	});
	test('of a false item', function() {
		assert.deepEqual(
			evalScheem(['not', ['=', 2, 1]]),
			'#t'
			);
	});
});

suite('if', function() {
	test('true then atom a', function() {
		assert.deepEqual(
			evalScheem(['if', '#t', 1, 2]),
			1
			);
	});
	test('false then atom b', function() {
		assert.deepEqual(
			evalScheem(['if', '#f', 1, 2]),
			2
			);
	});
	test('true then result a', function() {
		assert.deepEqual(
			evalScheem(['if', '#t', ['+', 1, 2], ['-', 2, 1]]),
			3
			);
	});
	test('false then result b', function() {
		assert.deepEqual(
			evalScheem(['if', '#f', ['+', 1, 2], ['-', 2, 1]]),
			1
			);
	});
	test('true expr then result a', function() {
		assert.deepEqual(
			evalScheem(['if', ['<', 1, 2], ['+', 1, 2], ['-', 2, 1]]),
			3
			);
	});
	test('false expr then result b', function() {
		assert.deepEqual(
			evalScheem(['if', ['<', 2, 1], ['+', 1, 2], ['-', 2, 1]]),
			1
			);
	});
	test('zero arguments fail', function() {
		expect(function(){
			evalScheem(['if']);
		}).to.throw();
	});
	test('one argument fail', function() {
		expect(function(){
			evalScheem(['if', '#t']);
		}).to.throw();
	});
	test('four arguments fail', function() {
		expect(function(){
			evalScheem(['if', '#t', 1, 2, 3]);
		}).to.throw();
	});
	test('non-bool argument fail', function() {
		expect(function(){
			evalScheem(['if', 1, 2, 3]);
		}).to.throw();
	});
});

suite('cond', function() {
	test('zero arguments fail', function() {
		expect(function(){
			evalScheem(['cond']);
		}).to.throw();
	});
	test('true then atom a', function() {
		assert.deepEqual(
			evalScheem(['cond', ['#t', 1], ['else', 2]]),
			1
			);
	});
	test('false then atom b', function() {
		assert.deepEqual(
			evalScheem(['cond', ['#f', 1], ['else', 2]]),
			2
			);
	});
	test('true then result a', function() {
		assert.deepEqual(
			evalScheem(['cond', ['#t', ['+', 1, 2]], ['else', ['-', 2, 1]]]),
			3
			);
	});
	test('false then result b', function() {
		assert.deepEqual(
			evalScheem(['cond', ['#f', ['+', 1, 2]], ['else', ['-', 2, 1]]]),
			1
			);
	});
	test('true expr then result a', function() {
		assert.deepEqual(
			evalScheem(['cond', [['<', 1, 2], ['+', 1, 2]], ['else', ['-', 2, 1]]]),
			3
			);
	});
	test('false expr then result b', function() {
		assert.deepEqual(
			evalScheem(['cond', [['<', 2, 1], ['+', 1, 2]], ['else', ['-', 2, 1]]]),
			1
			);
	});
	test('result 3', function() {
		assert.deepEqual(
			evalScheem(['cond', [['<', 2, 1], ['+', 1, 2]], [['<', 3, 2], ['+', 2, 4]], [['=', 1, 1], ['-', 2, 1]]]),
			1
			);
	});
	test('result 3 [else]', function() {
		assert.deepEqual(
			evalScheem(['cond', [['<', 2, 1], ['+', 1, 2]], [['<', 3, 2], ['+', 2, 4]], ['else', ['-', 2, 1]]]),
			1
			);
	});
	test('else failure (not last)', function() {
		expect(function(){
			evalScheem(['cond', [['<', 2, 1], ['+', 1, 2]], ['else', ['-', 2, 1]], [['<', 3, 2], ['+', 2, 4]]]);
		}).to.throw();
	});
});

suite('length', function(){
	test('zero', function(){
		assert.deepEqual(
			evalScheem(['length', ['quote', []]]),
			0
			);
	});
	test('one [a]', function(){
		assert.deepEqual(
			evalScheem(['length', ['quote', [1]]]),
			1
			);
	});
	test('one [b]', function(){
		assert.deepEqual(
			evalScheem(['length', ['quote', [[1]]]]),
			1
			);
	});
	test('two [a]', function(){
		assert.deepEqual(
			evalScheem(['length', ['quote', [1, 2]]]),
			2
			);
	});
	test('two [b]', function(){
		assert.deepEqual(
			evalScheem(['length', ['quote', [[1, 2], [3, 4]]]]),
			2
			);
	});
	test('two [c]', function(){
		assert.deepEqual(
			evalScheem(['length', ['quote', [[1, 2], 3]]]),
			2
			);
	});
});

suite('reverse', function(){
	test('zero', function(){
		assert.deepEqual(
			evalScheem(['reverse', ['quote', []]]),
			[]
			);
	});
	test('one [a]', function(){
		assert.deepEqual(
			evalScheem(['reverse', ['quote', [1]]]),
			[1]
			);
	});
	test('one [b]', function(){
		assert.deepEqual(
			evalScheem(['reverse', ['quote', [[1]]]]),
			[[1]]
			);
	});
	test('two [a]', function(){
		assert.deepEqual(
			evalScheem(['reverse', ['quote', [1, 2]]]),
			[2, 1]
			);
	});
	test('two [b]', function(){
		assert.deepEqual(
			evalScheem(['reverse', ['quote', [[1, 2], [3, 4]]]]),
			[[3, 4], [1, 2]]
			);
	});
	test('two [c]', function(){
		assert.deepEqual(
			evalScheem(['reverse', ['quote', [[1, 2], 3]]]),
			[3, [1, 2]]
			);
	});
});

suite('list-ref', function(){
	test('zeroth of many', function(){
		assert.deepEqual(
			evalScheem(['list-ref', ['quote', [1, 2, 3, 4]], 0]),
			1
			);
	});
	test('oneth of many', function(){
		assert.deepEqual(
			evalScheem(['list-ref', ['quote', [1, 2, 3, 4]], 1]),
			2
			);
	});
	test('twoth of many', function(){
		assert.deepEqual(
			evalScheem(['list-ref', ['quote', [1, 2, 3, 4]], 2]),
			3
			);
	});
});

suite('map', function(){
	test('add one across a zero-element list', function(){
		assert.deepEqual(
			evalScheem(['map', ['lambda', ['x'], ['+', 'x', 1]], ['quote', []]]),
			[]
			);
	});
	test('add one across a one-element list', function(){
		assert.deepEqual(
			evalScheem(['map', ['lambda', ['x'], ['+', 'x', 1]], ['quote', [1]]]),
			[2]
			);
	});
	test('add one across a many-element list', function(){
		assert.deepEqual(
			evalScheem(['map', ['lambda', ['x'], ['+', 'x', 1]], ['quote', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]]]),
			[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
			);
	});
	test('two-argument add across a single many-element list (error)', function(){
		expect(function(){
			evalScheem(['map', ['lambda', ['x', 'y'], ['+', 'x', 'y']], ['quote', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]]]);
		}).to.throw();
	});
	test('two-argument add across two many-element lists', function(){
		assert.deepEqual(
			evalScheem(['map', ['lambda', ['x', 'y'], ['+', 'x', 'y']], ['quote', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]], ['quote', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]]]),
			[0, 2, 4, 6, 8, 10, 12, 14, 16, 18]
			);
	});
	test('return pair across a many-element list', function(){
		assert.deepEqual(
			evalScheem(['map', ['lambda', ['x'], ['cons', 'x', 'x']], ['quote', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]]]),
			[[0,0], [1,1], [2,2], [3,3], [4,4], [5,5], [6,6], [7,7], [8,8], [9,9]]
			);
	});
});

suite('foldl', function(){
	test('add zero across a zero-element list', function(){
		assert.deepEqual(
			evalScheem(['foldl', '+', 0, ['quote', []]]),
			0
			);
	});
	test('add zero across a one-element list', function(){
		assert.deepEqual(
			evalScheem(['foldl', '+', 0, ['quote', [1]]]),
			1
			);
	});
	test('add zero across a many-element list', function(){
		assert.deepEqual(
			evalScheem(['foldl', '+', 0, ['quote', [1, 2, 3, 4]]]),
			10
			);
	});
	test('complex lambda across two many-element lists', function(){
		assert.deepEqual(
			evalScheem(['foldl', ['lambda', ['a', 'b', 'result'], ['*', 'result', ['-', 'a', 'b']]], 1, ['quote', [1, 2, 3]], ['quote', [4, 5, 6]]]),
			-27
			);
	});
	test('cons (reverse a list)', function(){
		assert.deepEqual(
			evalScheem(['foldl', 'cons', ['quote', []], ['quote', [1, 2, 3, 4]]]),
			[4, 3, 2, 1]
			);
	});
});

suite('foldr', function(){
	test('add zero across a zero-element list', function(){
		assert.deepEqual(
			evalScheem(['foldr', '+', 0, ['quote', []]]),
			0
			);
	});
	test('add zero across a one-element list', function(){
		assert.deepEqual(
			evalScheem(['foldr', '+', 0, ['quote', [1]]]),
			1
			);
	});
	test('add zero across a many-element list', function(){
		assert.deepEqual(
			evalScheem(['foldr', '+', 0, ['quote', [1, 2, 3, 4]]]),
			10
			);
	});
	test('cons (copy a list)', function(){
		assert.deepEqual(
			evalScheem(['foldr', 'cons', ['quote', []], ['quote', [1, 2, 3, 4]]]),
			[1, 2, 3, 4]
			);
	});
});

suite('filter', function(){
	test('filter an empty list', function(){
		assert.deepEqual(
			evalScheem(['filter', ['lambda', ['x'], ['=', 'x', 1]], ['quote', []]]),
			[]
			);
	});
	test('filter one item from a one-item list', function(){
		assert.deepEqual(
			evalScheem(['filter', ['lambda', ['x'], ['=', 'x', 1]], ['quote', [1]]]),
			[1]
			);
	});
	test('filter a multi-item list', function(){
		assert.deepEqual(
			evalScheem(['filter', ['lambda', ['x'], ['>=', 'x', 0]], ['quote', [1, -2, 3, 4, -5]]]),
			[1, 3, 4]
			);
	});
	test('filter a multi-item list', function(){
		assert.deepEqual(
			evalScheem(['filter', ['lambda', ['x'], ['not', ['>=', 'x', 0]]], ['quote', [1, -2, 3, 4, -5]]]),
			[-2, -5]
			);
	});
});

suite('evalString', function(){
	test('int', function() {
		assert.deepEqual(
			evalScheemString('3'),
			3
			);
	});
	test('double-digit int', function() {
		assert.deepEqual(
			evalScheemString('42'),
			42
			);
	});
	test('negative int', function() {
		assert.deepEqual(
			evalScheemString('-3'),
			-3
			);
	});
	test('double-digit negative int', function() {
		assert.deepEqual(
			evalScheemString('-42'),
			-42
			);
	});
	test('explicitly positive int', function() {
		assert.deepEqual(
			evalScheemString('+3'),
			3
			);
	});
	test('double-digit explicitly positive int', function() {
		assert.deepEqual(
			evalScheemString('+42'),
			42
			);
	});
	test('quoted list', function() {
		assert.deepEqual(
			evalScheemString("'(1 2)"),
			[1, 2]
			);
	});
	test('simple addition', function() {
		assert.deepEqual(
			evalScheemString("(+ 1 2)"),
			3
			);
	});
	test('simple nested arithmetic', function() {
		assert.deepEqual(
			evalScheemString("(+ 2 (* 3 4))"),
			14
			);
	});
});

suite('scheemToString', function(){
	test('int', function() {
		assert.deepEqual(
			scheemToString(3),
			'3'
			);
	});
	test('variable', function() {
		assert.deepEqual(
			scheemToString('x'),
			'x'
			);
	});
	test('quoted variable', function() {
		assert.deepEqual(
			scheemToString(['quote', 'x']),
			'\'x'
			);
	});
	test('quoted empty list', function() {
		assert.deepEqual(
			scheemToString(['quote', []]),
			'\'()'
			);
	});
	test('quoted single-item list', function() {
		assert.deepEqual(
			scheemToString(['quote', [1]]),
			'\'(1)'
			);
	});
	test('quoted multi-item list', function() {
		assert.deepEqual(
			scheemToString(['quote', [1, 'x']]),
			'\'(1 x)'
			);
	});
	test('function call', function() {
		assert.deepEqual(
			scheemToString(['length', ['quote', [1, 'x']]]),
			'(length \'(1 x))'
			);
	});
	test('complex structure', function() {
		assert.deepEqual(
			scheemToString(['if', ['<', ['length', ['quote', [1, 'x']]], 3], 42, ['quote', 'some-text']]),
			'(if (< (length \'(1 x)) 3) 42 \'some-text)'
			);
	});
});

suite('function application:', function(){
	test('undefined function', function() {
		expect(function(){
			evalScheem(['undefined-function-name', 1]);
		}).to.throw();
	});
	test('identity of atom', function() {
		assert.deepEqual(
			evalScheem(['identity', 1]),
			1
			);
	});
});

suite('lambda-one', function(){
	test('function definition throws no error and sets up arginfo', function() {
		var fn = evalScheem(['lambda-one', ['x'], ['+', 1, 'x']]);
		assert.deepEqual(
			fn.argsMax,
			1
			);
		assert.deepEqual(
			fn.argsMin,
			1
			);
		assert.ok(
			!fn.builtin
			);
	});
	test('simple plusone', function() {
		assert.deepEqual(
			evalScheem(['begin', ['define', 'plusone', ['lambda-one', 'x', ['+', 1, 'x']]], ['plusone', 1]]),
			2
			);
	});
	test('nested plusone', function() {
		assert.deepEqual(
			evalScheem(['begin', ['define', 'plusone', ['lambda-one', 'x', ['+', 1, 'x']]], ['plusone', ['plusone', 1]]]),
			3
			);
	});
});

suite('lambda', function(){
	test('function definition throws no error and sets up arginfo', function() {
		var fn = evalScheem(['lambda', ['x'], ['+', 1, 'x']]);
		assert.deepEqual(
			fn.argsMax,
			1
			);
		assert.deepEqual(
			fn.argsMin,
			1
			);
		assert.ok(
			!fn.builtin
			);
	});
	test('simple 1-arg plusone', function() {
		assert.deepEqual(
			evalScheem(['begin', ['define', 'plusone', ['lambda', ['x'], ['+', 1, 'x']]], ['plusone', 1]]),
			2
			);
	});
	test('nested 1-arg plusone', function() {
		assert.deepEqual(
			evalScheem(['begin', ['define', 'plusone', ['lambda', ['x'], ['+', 1, 'x']]], ['plusone', ['plusone', 1]]]),
			3
			);
	});
	test('deeply nested 1-arg plusone', function() {
		assert.deepEqual(
			evalScheem(['begin', ['define', 'plusone', ['lambda', ['x'], ['+', 1, 'x']]], ['plusone', ['plusone', ['plusone', 1]]]]),
			4
			);
	});
	test('complex 1-arg plusone', function() {
		assert.deepEqual(
			evalScheem(['begin', ['define', 'plusone', ['lambda', ['x'], ['+', 1, 'x']]], ['*', ['plusone', 2], ['plusone', ['plusone', 1]]]]),
			9
			);
	});
	test('simple 2-arg plus', function() {
		assert.deepEqual(
			evalScheem(['begin', ['define', 'plus', ['lambda', ['x', 'y'], ['+', 'y', 'x']]], ['plus', 1, 2]]),
			3
			);
	});
	test('simple 2-arg plus fails with 0 args', function() {
		expect(function(){
			evalScheem(['begin', ['define', 'plus', ['lambda', ['x', 'y'], ['+', 'y', 'x']]], ['plus']]);
		}).to.throw();
	});
	test('simple 2-arg plus fails with 1 arg', function() {
		expect(function(){
			evalScheem(['begin', ['define', 'plus', ['lambda', ['x', 'y'], ['+', 'y', 'x']]], ['plus', 1]]);
		}).to.throw();
	});
	test('simple 2-arg plus fails with 3 args', function() {
		expect(function(){
			evalScheem(['begin', ['define', 'plus', ['lambda', ['x', 'y'], ['+', 'y', 'x']]], ['plus', 1, 2, 3]]);
		}).to.throw();
	});
	test('nested 2-arg plus', function() {
		assert.deepEqual(
			evalScheem(['begin', ['define', 'plus', ['lambda', ['x', 'y'], ['+', 'y', 'x']]], ['plus', ['plus', 1, 2], ['plus', 3, 4]]]),
			10
			);
	});
	test('deeply nested 2-arg plus', function() {
		assert.deepEqual(
			evalScheem(['begin', ['define', 'plus', ['lambda', ['x', 'y'], ['+', 'y', 'x']]], ['plus', ['plus', 1, 2], ['plus', ['plus', 2, 1], ['plus', 2, 2]]]]),
			10
			);
	});
});

/*
suite('alert', function(){
	test('test', function() {
		evalScheem(['begin', ['alert', ['quote', 'test']], ['alert', ['quote', 'another test']]]);
		evalScheem(
			['begin',
				['define', 'plus',
					['lambda', ['x', 'y'],
						['begin',
							['alert', ['quote', 'x:']],
							['alert', 'x'],
							['alert', ['quote', 'y:']],
							['alert', 'y'],
							['alert', ['quote', 'result:']],
							['alert', ['+', 'y', 'x']]
						]
					]
				],

				['plus',
					['begin', ['alert', ['quote', '(']], ['plus', 1, 2]],
					['begin', ['alert', ['quote', '((']],
						['plus',
							['begin', ['alert', ['quote', '(((']], ['plus', 2, 1]],
							['begin', ['alert', ['quote', '((((']], ['plus', 2, 2]]
						]
					]
				]

			]);
	});
});
*/

suite('factorial', function(){
	var factorial_func = '(begin (define factorial (lambda (x) (if (<= x 1) 1 (* x (factorial (- x 1))))))    (factorial in) )';
	test('0', function(){
		var env = {};
		add_binding(env, 'in', 0);
		assert.deepEqual(
			evalScheemString(factorial_func, env),
			1
		);
	});
	test('1', function(){
		var env = {};
		add_binding(env, 'in', 1);
		assert.deepEqual(
			evalScheemString(factorial_func, env),
			1
		);
	});
	test('2', function(){
		var env = {};
		add_binding(env, 'in', 2);
		assert.deepEqual(
			evalScheemString(factorial_func, env),
			2
		);
	});
	test('3', function(){
		var env = {};
		add_binding(env, 'in', 3);
		assert.deepEqual(
			evalScheemString(factorial_func, env),
			6
		);
	});
	test('4', function(){
		var env = {};
		add_binding(env, 'in', 4);
		assert.deepEqual(
			evalScheemString(factorial_func, env),
			24
		);
	});
});

suite('fibonacci', function(){
	var fibonacci_func = '(begin (define fibonacci (lambda (x) (if (<= x 1) 1 (+ (fibonacci (- x 1)) (fibonacci (- x 2))))))    (fibonacci in) )';
	test('0', function(){
		var env = {};
		add_binding(env, 'in', 0);
		assert.deepEqual(
			evalScheemString(fibonacci_func, env),
			1
		);
	});
	test('1', function(){
		var env = {};
		add_binding(env, 'in', 1);
		assert.deepEqual(
			evalScheemString(fibonacci_func, env),
			1
		);
	});
	test('2', function(){
		var env = {};
		add_binding(env, 'in', 2);
		assert.deepEqual(
			evalScheemString(fibonacci_func, env),
			2
		);
	});
	test('3', function(){
		var env = {};
		add_binding(env, 'in', 3);
		assert.deepEqual(
			evalScheemString(fibonacci_func, env),
			3
		);
	});
	test('4', function(){
		var env = {};
		add_binding(env, 'in', 4);
		assert.deepEqual(
			evalScheemString(fibonacci_func, env),
			5
		);
	});
	test('5', function(){
		var env = {};
		add_binding(env, 'in', 5);
		assert.deepEqual(
			evalScheemString(fibonacci_func, env),
			8
		);
	});
});

suite('reversing a list:', function(){
	test('builtin', function(){
		assert.deepEqual(
			evalScheemString("(reverse '(1 2 3 4))"),
			[4, 3, 2, 1]
		);
	});
	test('foldl and cons', function(){
		assert.deepEqual(
			evalScheemString("(foldl cons '() '(1 2 3 4))"),
			[4, 3, 2, 1]
		);
	});
});

suite('member of a list', function(){
	var member_func = '(begin (define member? (lambda (n h) (if (= 0 (length h)) #f (if (= n (car h)) #t (member? n (cdr h)) ) ) ))    (member? needle haystack) )';
	test('0 [a]', function(){
		var env = {};
		add_binding(env, 'needle', 0);
		add_binding(env, 'haystack', []);
		assert.deepEqual(
			evalScheemString(member_func, env),
			'#f'
		);
	});
	test('0 [b]', function(){
		var env = {};
		add_binding(env, 'needle', 0);
		add_binding(env, 'haystack', [1, 2, 3, 4]);
		assert.deepEqual(
			evalScheemString(member_func, env),
			'#f'
		);
	});
	test('1', function(){
		var env = {};
		add_binding(env, 'needle', 1);
		add_binding(env, 'haystack', [1, 2, 3, 4]);
		assert.deepEqual(
			evalScheemString(member_func, env),
			'#t'
		);
	});
	test('3', function(){
		var env = {};
		add_binding(env, 'needle', 3);
		add_binding(env, 'haystack', [1, 2, 3, 4]);
		assert.deepEqual(
			evalScheemString(member_func, env),
			'#t'
		);
	});
	test('5', function(){
		var env = {};
		add_binding(env, 'needle', 5);
		add_binding(env, 'haystack', [1, 2, 3, 4]);
		assert.deepEqual(
			evalScheemString(member_func, env),
			'#f'
		);
	});
});
