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


suite('expression evaluation', function() {
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
