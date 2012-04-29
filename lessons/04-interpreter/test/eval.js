if (typeof module !== 'undefined') {
	// In Node load required modules
	var assert = require('chai').assert;
	var evalScheem = require('../scheem').evalScheem;
} else {
	// In browser assume already loaded by <script> tags
	var assert = chai.assert;
}

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
