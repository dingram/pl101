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

suite('numbers', function() {
	test('positive integer', function() {
		assert.deepEqual(
			tortoise.parse('3;'),
			[ 3 ]
		);
		assert.deepEqual(
			tortoise.parse('42;'),
			[ 42 ]
		);
	});
	test('negative integer', function() {
		assert.deepEqual(
			tortoise.parse('-9;'),
			[ -9 ]
		);
		assert.deepEqual(
			tortoise.parse('-15;'),
			[ -15 ]
		);
	});
	test('positive float', function() {
		assert.deepEqual(
			tortoise.parse('3.14;'),
			[ 3.14 ]
		);
		assert.deepEqual(
			tortoise.parse('42.42;'),
			[ 42.42 ]
		);
	});
	test('negative float', function() {
		assert.deepEqual(
			tortoise.parse('-9.87;'),
			[ -9.87 ]
		);
		assert.deepEqual(
			tortoise.parse('-15.6;'),
			[ -15.6 ]
		);
	});
});

suite('expressions', function() {
	test('addition', function() {
		assert.deepEqual(
			tortoise.parse('3 + 8;'),
			[ { tag: '+', left: 3, right: 8 } ]
		);
		assert.deepEqual(
			tortoise.parse('3 + -8;'),
			[ { tag: '+', left: 3, right: -8 } ]
		);
		assert.deepEqual(
			tortoise.parse('-3 + 8;'),
			[ { tag: '+', left: -3, right: 8 } ]
		);
		assert.deepEqual(
			tortoise.parse('-3 + -8;'),
			[ { tag: '+', left: -3, right: -8 } ]
		);
	});
	test('subtraction', function() {
		assert.deepEqual(
			tortoise.parse('3 - 8;'),
			[ { tag: '-', left: 3, right: 8 } ]
		);
		assert.deepEqual(
			tortoise.parse('3 - -8;'),
			[ { tag: '-', left: 3, right: -8 } ]
		);
		assert.deepEqual(
			tortoise.parse('-3 - 8;'),
			[ { tag: '-', left: -3, right: 8 } ]
		);
		assert.deepEqual(
			tortoise.parse('-3 - -8;'),
			[ { tag: '-', left: -3, right: -8 } ]
		);
	});
	test('multiplication', function() {
		assert.deepEqual(
			tortoise.parse('3 * 8;'),
			[ { tag: '*', left: 3, right: 8 } ]
		);
		assert.deepEqual(
			tortoise.parse('3 * -8;'),
			[ { tag: '*', left: 3, right: -8 } ]
		);
		assert.deepEqual(
			tortoise.parse('-3 * 8;'),
			[ { tag: '*', left: -3, right: 8 } ]
		);
		assert.deepEqual(
			tortoise.parse('-3 * -8;'),
			[ { tag: '*', left: -3, right: -8 } ]
		);
	});
	test('division', function() {
		assert.deepEqual(
			tortoise.parse('3 / 8;'),
			[ { tag: '/', left: 3, right: 8 } ]
		);
		assert.deepEqual(
			tortoise.parse('3 / -8;'),
			[ { tag: '/', left: 3, right: -8 } ]
		);
		assert.deepEqual(
			tortoise.parse('-3 / 8;'),
			[ { tag: '/', left: -3, right: 8 } ]
		);
		assert.deepEqual(
			tortoise.parse('-3 / -8;'),
			[ { tag: '/', left: -3, right: -8 } ]
		);
	});
});

suite('expression precedence', function() {
	test('mul beats add', function() {
		assert.deepEqual(
			tortoise.parse('2 + 3 * 4;'),
			[ { tag: '+', left: 2, right: { tag: '*', left: 3, right: 4 } } ]
		);
		assert.deepEqual(
			tortoise.parse('2 * 3 + 4;'),
			[ { tag: '+', left: { tag: '*', left: 2, right: 3 }, right: 4 } ]
		);
	});
	test('mul beats sub', function() {
		assert.deepEqual(
			tortoise.parse('2 - 3 * 4;'),
			[ { tag: '-', left: 2, right: { tag: '*', left: 3, right: 4 } } ]
		);
		assert.deepEqual(
			tortoise.parse('2 * 3 - 4;'),
			[ { tag: '-', left: { tag: '*', left: 2, right: 3 }, right: 4 } ]
		);
	});
	test('div beats add', function() {
		assert.deepEqual(
			tortoise.parse('2 + 3 / 4;'),
			[ { tag: '+', left: 2, right: { tag: '/', left: 3, right: 4 } } ]
		);
		assert.deepEqual(
			tortoise.parse('2 / 3 + 4;'),
			[ { tag: '+', left: { tag: '/', left: 2, right: 3 }, right: 4 } ]
		);
	});
	test('div beats sub', function() {
		assert.deepEqual(
			tortoise.parse('2 - 3 / 4;'),
			[ { tag: '-', left: 2, right: { tag: '/', left: 3, right: 4 } } ]
		);
		assert.deepEqual(
			tortoise.parse('2 / 3 - 4;'),
			[ { tag: '-', left: { tag: '/', left: 2, right: 3 }, right: 4 } ]
		);
	});
	test('add beats conditional', function() {
		assert.deepEqual(
			tortoise.parse('2 != 3 + 4;'),
			[ { tag: '!=', left: 2, right: { tag: '+', left: 3, right: 4 } } ]
		);
		assert.deepEqual(
			tortoise.parse('2 + 3 >= 4;'),
			[ { tag: '>=', left: { tag: '+', left: 2, right: 3 }, right: 4 } ]
		);
	});
	test('sub beats conditional', function() {
		assert.deepEqual(
			tortoise.parse('2 == 3 - 5;'),
			[ { tag: '==', left: 2, right: { tag: '-', left: 3, right: 5 } } ]
		);
		assert.deepEqual(
			tortoise.parse('2 - 3 <= 4;'),
			[ { tag: '<=', left: { tag: '-', left: 2, right: 3 }, right: 4 } ]
		);
	});
	test('mul beats conditional', function() {
		assert.deepEqual(
			tortoise.parse('2 > 3 * 4;'),
			[ { tag: '>', left: 2, right: { tag: '*', left: 3, right: 4 } } ]
		);
		assert.deepEqual(
			tortoise.parse('2 * 3 < 4;'),
			[ { tag: '<', left: { tag: '*', left: 2, right: 3 }, right: 4 } ]
		);
	});
	test('div beats conditional', function() {
		assert.deepEqual(
			tortoise.parse('2 >= 3 / 4;'),
			[ { tag: '>=', left: 2, right: { tag: '/', left: 3, right: 4 } } ]
		);
		assert.deepEqual(
			tortoise.parse('2 / 3 < 4;'),
			[ { tag: '<', left: { tag: '/', left: 2, right: 3 }, right: 4 } ]
		);
	});
});

/*
suite('set!', function() {
	test('an undefined variable', function() {
		expect(function(){
			evalScheem(['begin', ['set!', 'x', 2]]);
		}).to.throw();
	});
});
*/
