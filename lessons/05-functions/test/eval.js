if (typeof module !== 'undefined') {
	// In Node load required modules
	var assert = require('chai').assert;
	var expect = require('chai').expect;
	var scheem = require('../scheem');
	var evalScheem = scheem.evalScheem;
	var evalScheemString = scheem.evalScheemString;
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
	/*
	test('complex 1-arg plusone', function() {
		assert.deepEqual(
			evalScheem(['begin', ['define', 'plusone', ['lambda', ['x'], ['+', 1, 'x']]], ['*', ['plusone', 2], ['plusone', ['plusone', 1]]]]),
			4
			);
	});
	*/
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
	/*
	test('deeply nested 2-arg plus', function() {
		assert.deepEqual(
			evalScheem(['begin', ['define', 'plus', ['lambda', ['x', 'y'], ['+', 'y', 'x']]], ['plus', ['plus', 1, 2], ['plus', ['plus', 2, 1], ['plus', 2, 2]]]]),
			10
			);
	});
	*/
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
