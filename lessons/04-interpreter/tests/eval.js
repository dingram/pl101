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
