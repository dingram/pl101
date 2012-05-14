if (typeof module !== 'undefined') {
	// In Node load required modules
	var assert = require('chai').assert;
	var expect = require('chai').expect;
	var tortoise = require('../tortoise');
} else {
	// In browser assume already loaded by <script> tags
	var assert = chai.assert;
	var expect = chai.expect;
}


suite('expression evaluation (integers)', function() {
	test('addition', function() {
		assert.deepEqual(
			tortoise.eval('3 + 8;'),
			11
		);
		assert.deepEqual(
			tortoise.eval('3 + -8;'),
			-5
		);
		assert.deepEqual(
			tortoise.eval('-3 + 8;'),
			5
		);
		assert.deepEqual(
			tortoise.eval('-3 + -8;'),
			-11
		);
	});
	test('subtraction', function() {
		assert.deepEqual(
			tortoise.eval('3 - 8;'),
			-5
		);
		assert.deepEqual(
			tortoise.eval('3 - -8;'),
			11
		);
		assert.deepEqual(
			tortoise.eval('-3 - 8;'),
			-11
		);
		assert.deepEqual(
			tortoise.eval('-3 - -8;'),
			5
		);
	});
	test('multiplication', function() {
		assert.deepEqual(
			tortoise.eval('3 * 8;'),
			24
		);
		assert.deepEqual(
			tortoise.eval('3 * -8;'),
			-24
		);
		assert.deepEqual(
			tortoise.eval('-3 * 8;'),
			-24
		);
		assert.deepEqual(
			tortoise.eval('-3 * -8;'),
			24
		);
	});
	test('division', function() {
		assert.deepEqual(
			tortoise.eval('8 / 4;'),
			2
		);
		assert.deepEqual(
			tortoise.eval('8 / -4;'),
			-2
		);
		assert.deepEqual(
			tortoise.eval('-8 / 4;'),
			-2
		);
		assert.deepEqual(
			tortoise.eval('-8 / -4;'),
			2
		);
	});
});

suite('expression evaluation (integers and variables)', function() {
	test('addition', function() {
		assert.deepEqual(
			tortoise.eval('3 + x;', {bindings:{x:8}}),
			11
		);
		/*
		assert.deepEqual(
			tortoise.eval('3 + -x;', {bindings:{x:8}}),
			-5
		);
		*/
		assert.deepEqual(
			tortoise.eval('-3 + x;', {bindings:{x:8}}),
			5
		);
		/*
		assert.deepEqual(
			tortoise.eval('-3 + -x;', {bindings:{x:8}}),
			-11
		);
		*/
	});
	test('subtraction', function() {
		assert.deepEqual(
			tortoise.eval('x - 8;', {bindings:{x:3}}),
			-5
		);
		assert.deepEqual(
			tortoise.eval('x - -8;', {bindings:{x:3}}),
			11
		);
		/*
		assert.deepEqual(
			tortoise.eval('-x - 8;', {bindings:{x:3}}),
			-11
		);
		assert.deepEqual(
			tortoise.eval('-x - -8;', {bindings:{x:3}}),
			5
		);
		*/
	});
	test('multiplication', function() {
		assert.deepEqual(
			tortoise.eval('3 * x;', {bindings:{x:8}}),
			24
		);
		assert.deepEqual(
			tortoise.eval('x * -8;', {bindings:{x:3}}),
			-24
		);
		assert.deepEqual(
			tortoise.eval('-3 * x;', {bindings:{x:8}}),
			-24
		);
		/*
		assert.deepEqual(
			tortoise.eval('-3 * -8;'),
			24
		);
		*/
	});
	test('division', function() {
		assert.deepEqual(
			tortoise.eval('x / 4;', {bindings:{x:8}}),
			2
		);
		assert.deepEqual(
			tortoise.eval('x / -4;', {bindings:{x:8}}),
			-2
		);
		assert.deepEqual(
			tortoise.eval('-8 / x;', {bindings:{x:4}}),
			-2
		);
		/*
		assert.deepEqual(
			tortoise.eval('-8 / -4;'),
			2
		);
		*/
	});
});

suite('variable definition', function() {
	test('declaration', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('var x;', env),
			0
		);
		assert.deepEqual(
			env,
			{ bindings: { x: 0 }, _outer: null }
		);
	});
	test('dual declaration', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('var x; var y;', env),
			0
		);
		assert.deepEqual(
			env,
			{ bindings: { x: 0, y: 0 }, _outer: null }
		);
	});
});

suite('variable assignment', function() {
	test('simple', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('var x; x := 1;', env),
			1
		);
		assert.deepEqual(
			env,
			{ bindings: { x: 1 }, _outer: null }
		);
	});
	test('simple expression', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('var x; x := 1 + 2;', env),
			3
		);
		assert.deepEqual(
			env,
			{ bindings: { x: 3 }, _outer: null }
		);
	});
});

suite('if', function() {
	test('simple', function() {
		assert.deepEqual(
			tortoise.eval('if (1) { 5; }'),
			5
		);
		assert.deepEqual(
			tortoise.eval('if (0) { 1; }'),
			0
		);
	});
	test('simple expression', function() {
		assert.deepEqual(
			tortoise.eval('if (1 == 1) { 5; }'),
			5
		);
		assert.deepEqual(
			tortoise.eval('if (0 > 17) { 1; }'),
			0
		);
	});
});

suite('repeat', function() {
	test('simple', function() {
		assert.deepEqual(
			tortoise.eval('var x; repeat (5) { x := x + 1; } x;'),
			5
		);
	});
	test('expression', function() {
		assert.deepEqual(
			tortoise.eval('var x; repeat (2 * 2 + 1) { x := x + 1; } x;'),
			5
		);
	});
	test('expression + complex body', function() {
		assert.deepEqual(
			tortoise.eval('var x; var y; repeat (2 * 2 + 1) { x := x + 1; y := y + 2; } x + y;'),
			15
		);
	});
});
