if (typeof module !== 'undefined') {
	// In Node load required modules
	var assert = require('chai').assert;
	var expect = require('chai').expect;
	var evalScheem = require('../scheem').evalScheem;
} else {
	// In browser assume already loaded by <script> tags
	var assert = chai.assert;
	var expect = chai.expect;
}

suite('begin', function() {
	test('simply quote a number', function() {
		assert.deepEqual(
			evalScheem(['begin', ['quote', 3]], {}),
			3
			);
	});
	test('simple arithmetic', function() {
		assert.deepEqual(
			evalScheem(['begin', ['*', ['+', 4, 2], ['-', 10, 3]]], {}),
			42
			);
	});
	test('multiple expressions', function() {
		assert.deepEqual(
			evalScheem(['begin', ['+', 3, 2], ['*', ['+', 4, 2], ['-', 9, 2]]], {}),
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
			env,
			{x: 2}
			);
	});
	test('simple variable, list', function() {
		var env = {};
		assert.deepEqual(
			evalScheem(['define', 'x', ['quote', [1, 2]]], env),
			0
			);
		assert.deepEqual(
			env,
			{x: [1, 2]}
			);
	});
	test('variable definition and usage', function() {
		assert.deepEqual(
			evalScheem(['begin', ['define', 'x', 2], ['*', ['+', 4, 'x'], ['-', 9, 'x']]], {}),
			42
			);
	});
	test('an already-defined variable', function() {
		expect(function(){
			evalScheem(['begin', ['define', 'x', 2], ['define', 'x', 42]], {});
		}).to.throw();
	});
});

suite('quote', function() {
	test('a number', function() {
		assert.deepEqual(
			evalScheem(['quote', 3], {}),
			3
			);
	});
	test('an atom', function() {
		assert.deepEqual(
			evalScheem(['quote', 'dog'], {}),
			'dog'
			);
	});
	test('a list', function() {
		assert.deepEqual(
			evalScheem(['quote', [1, 2, 3]], {}),
			[1, 2, 3]
			);
	});
	test('zero arguments', function() {
		expect(function(){
			evalScheem(['quote'], {});
		}).to.throw();
	});
	test('more than one argument', function() {
		expect(function(){
			evalScheem(['quote', 3, 4], {});
		}).to.throw();
	});
});

suite('cons', function() {
	test('atom onto an empty list', function() {
		assert.deepEqual(
			evalScheem(['cons', 1, ['quote', []]], {}),
			[1]
			);
	});
	test('atom onto a two-item list', function() {
		assert.deepEqual(
			evalScheem(['cons', 1, ['quote', [2, 3]]], {}),
			[1, 2, 3]
			);
	});
	test('list onto an empty list', function() {
		assert.deepEqual(
			evalScheem(['cons', ['quote', [1]], ['quote', []]], {}),
			[[1]]
			);
	});
	test('list onto a two-item list', function() {
		assert.deepEqual(
			evalScheem(['cons', ['quote', [1]], ['quote', [2, 3]]], {}),
			[[1], 2, 3]
			);
	});
});

suite('car', function() {
	test('of a multi-item list (atom)', function() {
		assert.deepEqual(
			evalScheem(['car', ['quote', [1, 2, 3]]], {}),
			1
			);
	});
	test('of a multi-item list (list)', function() {
		assert.deepEqual(
			evalScheem(['car', ['quote', [[1,2], 3, 4]]], {}),
			[1, 2]
			);
	});
	test('of a single-item list', function() {
		assert.deepEqual(
			evalScheem(['car', ['quote', [1]]], {}),
			1
			);
	});
	test('of an empty list', function() {
		assert.deepEqual(
			evalScheem(['car', ['quote', []]], {}),
			undefined
			);
	});
});

suite('cdr', function() {
	test('of a multi-item list (atom)', function() {
		assert.deepEqual(
			evalScheem(['cdr', ['quote', [1, 2, 3]]], {}),
			[2, 3]
			);
	});
	test('of a multi-item list (list)', function() {
		assert.deepEqual(
			evalScheem(['cdr', ['quote', [[1,2], [3,4], [5,6]]]], {}),
			[[3,4], [5,6]]
			);
	});
	test('of a single-item list', function() {
		assert.deepEqual(
			evalScheem(['cdr', ['quote', [1]]], {}),
			[]
			);
	});
	test('of an empty list', function() {
		assert.deepEqual(
			evalScheem(['cdr', ['quote', []]], {}),
			[]
			);
	});
});

suite('addition', function() {
	test('of two items (both positive)', function() {
		assert.deepEqual(
			evalScheem(['+', 1, 2], {}),
			3
			);
	});
	test('of two items (inc negative)', function() {
		assert.deepEqual(
			evalScheem(['+', -1, 2], {}),
			1
			);
	});
	test('of two items (both negative)', function() {
		assert.deepEqual(
			evalScheem(['+', -1, -2], {}),
			-3
			);
	});
	test('of many items', function() {
		assert.deepEqual(
			evalScheem(['+', 1, 2, -3, 4, 5, -6, 7, 8, -9, 10], {}),
			19
			);
	});
});

suite('subtraction', function() {
	test('of two items (both positive)', function() {
		assert.deepEqual(
			evalScheem(['-', 1, 2], {}),
			-1
			);
	});
	test('of two items (inc negative)', function() {
		assert.deepEqual(
			evalScheem(['-', -1, 2], {}),
			-3
			);
	});
	test('of two items (both negative)', function() {
		assert.deepEqual(
			evalScheem(['-', -1, -2], {}),
			1
			);
	});
});

suite('multiplication', function() {
	test('of two items (both positive)', function() {
		assert.deepEqual(
			evalScheem(['*', 2, 4], {}),
			8
			);
	});
	test('of two items (inc negative)', function() {
		assert.deepEqual(
			evalScheem(['*', -1, 2], {}),
			-2
			);
	});
	test('of two items (both negative)', function() {
		assert.deepEqual(
			evalScheem(['*', -2, -4], {}),
			8
			);
	});
	test('of many items', function() {
		assert.deepEqual(
			evalScheem(['*', 1, 2, -3, 4, 5, -6, 7, 8, -9, 10], {}),
			-3628800
			);
	});
});

suite('division', function() {
	test('of two items (both positive)', function() {
		assert.deepEqual(
			evalScheem(['/', 1, 2], {}),
			0.5
			);
	});
	test('of two items (inc negative)', function() {
		assert.deepEqual(
			evalScheem(['/', -1, 2], {}),
			-0.5
			);
	});
	test('of two items (both negative)', function() {
		assert.deepEqual(
			evalScheem(['/', -1, -2], {}),
			0.5
			);
	});
});
