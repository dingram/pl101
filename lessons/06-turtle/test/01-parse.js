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
			[ { tag: 'ignore', body: 3 } ]
		);
		assert.deepEqual(
			tortoise.parse('42;'),
			[ { tag: 'ignore', body: 42 } ]
		);
	});
	test('negative integer', function() {
		assert.deepEqual(
			tortoise.parse('-9;'),
			[ { tag: 'ignore', body: -9 } ]
		);
		assert.deepEqual(
			tortoise.parse('-15;'),
			[ { tag: 'ignore', body: -15 } ]
		);
	});
	test('positive float', function() {
		assert.deepEqual(
			tortoise.parse('3.14;'),
			[ { tag: 'ignore', body: 3.14 } ]
		);
		assert.deepEqual(
			tortoise.parse('42.42;'),
			[ { tag: 'ignore', body: 42.42 } ]
		);
	});
	test('negative float', function() {
		assert.deepEqual(
			tortoise.parse('-9.87;'),
			[ { tag: 'ignore', body: -9.87 } ]
		);
		assert.deepEqual(
			tortoise.parse('-15.6;'),
			[ { tag: 'ignore', body: -15.6 } ]
		);
	});
});

suite('strings', function() {
	test('empty single-quoted', function() {
		assert.deepEqual(
			tortoise.parse("'';"),
			[ { tag: 'ignore', body: { tag:'string', value:'' } } ]
		);
	});
	test('empty double-quoted', function() {
		assert.deepEqual(
			tortoise.parse('"";'),
			[ { tag: 'ignore', body: { tag:'string', value:'' } } ]
		);
	});
	test('non-empty single-quoted', function() {
		assert.deepEqual(
			tortoise.parse("'foo';"),
			[ { tag: 'ignore', body: { tag:'string', value:'foo' } } ]
		);
		assert.deepEqual(
			tortoise.parse("'foo BaR baz:';"),
			[ { tag: 'ignore', body: { tag:'string', value:'foo BaR baz:' } } ]
		);
	});
	test('non-empty double-quoted', function() {
		assert.deepEqual(
			tortoise.parse('"foo";'),
			[ { tag: 'ignore', body: { tag:'string', value:'foo' } } ]
		);
		assert.deepEqual(
			tortoise.parse('"foo BaR baz:";'),
			[ { tag: 'ignore', body: { tag:'string', value:'foo BaR baz:' } } ]
		);
	});
	test('single-quoted with escapes', function() {
		assert.deepEqual(
			tortoise.parse("'fo\\\\o\\'s';"),
			[ { tag: 'ignore', body: { tag:'string', value:"fo\\o's" } } ]
		);
		assert.deepEqual(
			tortoise.parse("'ntest\\ntest2';"),
			[ { tag: 'ignore', body: { tag:'string', value:'ntest\\ntest2' } } ]
		);
	});
	test('double-quoted with escapes', function() {
		assert.deepEqual(
			tortoise.parse("\"fo\\\\o\\\"s\";"),
			[ { tag: 'ignore', body: { tag:'string', value:"fo\\o\"s" } } ]
		);
		assert.deepEqual(
			tortoise.parse("\"ntest\\ntest2\";"),
			[ { tag: 'ignore', body: { tag:'string', value:'ntest\ntest2' } } ]
		);
	});
});

suite('identifiers', function() {
	test('name checks', function() {
		assert.deepEqual(
			tortoise.parse('x;'),
			[ { tag: 'ignore', body: { tag:'ident', name:'x' } } ]
		);
		assert.deepEqual(
			tortoise.parse('foo;'),
			[ { tag: 'ignore', body: { tag:'ident', name:'foo' } } ]
		);
		assert.deepEqual(
			tortoise.parse('foo42;'),
			[ { tag: 'ignore', body: { tag:'ident', name:'foo42' } } ]
		);
		assert.deepEqual(
			tortoise.parse('foo_42;'),
			[ { tag: 'ignore', body: { tag:'ident', name:'foo_42' } } ]
		);
		assert.deepEqual(
			tortoise.parse('_x;'),
			[ { tag: 'ignore', body: { tag:'ident', name:'_x' } } ]
		);
	});
	test('invalid names', function() {
		expect(function(){
			tortoise.parse('42x;');
		}).to.throw();
		expect(function(){
			tortoise.parse('@y;');
		}).to.throw();
		expect(function(){
			tortoise.parse('$z;');
		}).to.throw();
	});
	test('unary negation', function() {
		assert.deepEqual(
			tortoise.parse('!x;'),
			[ { tag: 'ignore', body: { tag: '!', expr: {tag:'ident', name:'x' } } } ]
		);
		assert.deepEqual(
			tortoise.parse('!foo;'),
			[ { tag: 'ignore', body: { tag: '!', expr: {tag:'ident', name:'foo' } } } ]
		);
	});
});

suite('expressions', function() {
	test('addition', function() {
		assert.deepEqual(
			tortoise.parse('3 + 8;'),
			[ { tag: 'ignore', body: { tag: '+', left: 3, right: 8 } } ]
		);
		assert.deepEqual(
			tortoise.parse('3 + -8;'),
			[ { tag: 'ignore', body: { tag: '+', left: 3, right: -8 } } ]
		);
		assert.deepEqual(
			tortoise.parse('-3 + 8;'),
			[ { tag: 'ignore', body: { tag: '+', left: -3, right: 8 } } ]
		);
		assert.deepEqual(
			tortoise.parse('-3 + -8;'),
			[ { tag: 'ignore', body: { tag: '+', left: -3, right: -8 } } ]
		);
	});
	test('subtraction', function() {
		assert.deepEqual(
			tortoise.parse('3 - 8;'),
			[ { tag: 'ignore', body: { tag: '-', left: 3, right: 8 } } ]
		);
		assert.deepEqual(
			tortoise.parse('3 - -8;'),
			[ { tag: 'ignore', body: { tag: '-', left: 3, right: -8 } } ]
		);
		assert.deepEqual(
			tortoise.parse('-3 - 8;'),
			[ { tag: 'ignore', body: { tag: '-', left: -3, right: 8 } } ]
		);
		assert.deepEqual(
			tortoise.parse('-3 - -8;'),
			[ { tag: 'ignore', body: { tag: '-', left: -3, right: -8 } } ]
		);
	});
	test('multiplication', function() {
		assert.deepEqual(
			tortoise.parse('3 * 8;'),
			[ { tag: 'ignore', body: { tag: '*', left: 3, right: 8 } } ]
		);
		assert.deepEqual(
			tortoise.parse('3 * -8;'),
			[ { tag: 'ignore', body: { tag: '*', left: 3, right: -8 } } ]
		);
		assert.deepEqual(
			tortoise.parse('-3 * 8;'),
			[ { tag: 'ignore', body: { tag: '*', left: -3, right: 8 } } ]
		);
		assert.deepEqual(
			tortoise.parse('-3 * -8;'),
			[ { tag: 'ignore', body: { tag: '*', left: -3, right: -8 } } ]
		);
	});
	test('division', function() {
		assert.deepEqual(
			tortoise.parse('3 / 8;'),
			[ { tag: 'ignore', body: { tag: '/', left: 3, right: 8 } } ]
		);
		assert.deepEqual(
			tortoise.parse('3 / -8;'),
			[ { tag: 'ignore', body: { tag: '/', left: 3, right: -8 } } ]
		);
		assert.deepEqual(
			tortoise.parse('-3 / 8;'),
			[ { tag: 'ignore', body: { tag: '/', left: -3, right: 8 } } ]
		);
		assert.deepEqual(
			tortoise.parse('-3 / -8;'),
			[ { tag: 'ignore', body: { tag: '/', left: -3, right: -8 } } ]
		);
	});
	test('modulo', function() {
		assert.deepEqual(
			tortoise.parse('3 % 8;'),
			[ { tag: 'ignore', body: { tag: '%', left: 3, right: 8 } } ]
		);
		assert.deepEqual(
			tortoise.parse('3 % -8;'),
			[ { tag: 'ignore', body: { tag: '%', left: 3, right: -8 } } ]
		);
		assert.deepEqual(
			tortoise.parse('-3 % 8;'),
			[ { tag: 'ignore', body: { tag: '%', left: -3, right: 8 } } ]
		);
		assert.deepEqual(
			tortoise.parse('-3 % -8;'),
			[ { tag: 'ignore', body: { tag: '%', left: -3, right: -8 } } ]
		);
	});
	test('exponentiation', function() {
		assert.deepEqual(
			tortoise.parse('3 ** 8;'),
			[ { tag: 'ignore', body: { tag: '**', left: 3, right: 8 } } ]
		);
		assert.deepEqual(
			tortoise.parse('3 ** -8;'),
			[ { tag: 'ignore', body: { tag: '**', left: 3, right: -8 } } ]
		);
		assert.deepEqual(
			tortoise.parse('-3 ** 8;'),
			[ { tag: 'ignore', body: { tag: '**', left: -3, right: 8 } } ]
		);
		assert.deepEqual(
			tortoise.parse('-3 ** -8;'),
			[ { tag: 'ignore', body: { tag: '**', left: -3, right: -8 } } ]
		);
	});
	test('logical AND', function() {
		assert.deepEqual(
			tortoise.parse('1 && 2;'),
			[ { tag: 'ignore', body: { tag: '&&', left: 1, right: 2 } } ]
		);
	});
	test('logical OR', function() {
		assert.deepEqual(
			tortoise.parse('1 || 2;'),
			[ { tag: 'ignore', body: { tag: '||', left: 1, right: 2 } } ]
		);
	});
});

suite('expression associativity', function(){
	test('addition', function() {
		assert.deepEqual(
			tortoise.parse('3 + 4 + 5;'),
			[ { tag: 'ignore', body: { tag: '+', left: { tag: '+', left: 3, right: 4 }, right: 5 } } ]
		);
		assert.deepEqual(
			tortoise.parse('0 + -1 + 2 + 34 + 5.6 + -7.890 + x;'),
			[ { tag: 'ignore', body: { tag: '+',
					left: { tag: '+',
						left: { tag: '+',
							left: { tag: '+',
								left: { tag: '+',
									left: { tag: '+', left: 0, right: -1},
									right: 2 },
								right: 34 },
							right: 5.6 },
						right: -7.890 },
					right: {tag: 'ident', name: 'x'}
			} } ]
		);
	});
	test('exponentiation', function() {
		assert.deepEqual(
			tortoise.parse('3 ** 4 ** 5;'),
			[ { tag: 'ignore', body: { tag: '**', left: 3, right: { tag: '**', left: 4, right: 5 } } } ]
		);
		assert.deepEqual(
			tortoise.parse('0 ** -1 ** 2 ** 34 ** 5.6 ** -7.890 ** x;'),
			[ { tag: 'ignore', body: { tag: '**',
					left: 0, right: { tag: '**',
						left: -1, right: { tag: '**',
							left: 2, right: { tag: '**',
								left: 34, right: { tag: '**',
									left: 5.6, right: { tag: '**',
										left: -7.890, right: {tag: 'ident', name: 'x'}},
								},
							},
						},
					}
			} } ]
		);
	});
	test('logical AND', function() {
		assert.deepEqual(
			tortoise.parse('3 && 4 && 5;'),
			[ { tag: 'ignore', body: { tag: '&&', left: { tag: '&&', left: 3, right: 4 }, right: 5 } } ]
		);
		assert.deepEqual(
			tortoise.parse('0 && -1 && 2 && 34 && 5.6 && -7.890 && x;'),
			[ { tag: 'ignore', body: { tag: '&&',
					left: { tag: '&&',
						left: { tag: '&&',
							left: { tag: '&&',
								left: { tag: '&&',
									left: { tag: '&&', left: 0, right: -1},
									right: 2 },
								right: 34 },
							right: 5.6 },
						right: -7.890 },
					right: {tag: 'ident', name: 'x'}
			} } ]
		);
	});
	test('logical OR', function() {
		assert.deepEqual(
			tortoise.parse('3 || 4 || 5;'),
			[ { tag: 'ignore', body: { tag: '||', left: { tag: '||', left: 3, right: 4 }, right: 5 } } ]
		);
		assert.deepEqual(
			tortoise.parse('0 || -1 || 2 || 34 || 5.6 || -7.890 || x;'),
			[ { tag: 'ignore', body: { tag: '||',
					left: { tag: '||',
						left: { tag: '||',
							left: { tag: '||',
								left: { tag: '||',
									left: { tag: '||', left: 0, right: -1},
									right: 2 },
								right: 34 },
							right: 5.6 },
						right: -7.890 },
					right: {tag: 'ident', name: 'x'}
			} } ]
		);
	});
});

suite('expression precedence', function() {
	test('exp beats add', function() {
		assert.deepEqual(
			tortoise.parse('2 + 3 ** 4;'),
			[ { tag: 'ignore', body: { tag: '+', left: 2, right: { tag: '**', left: 3, right: 4 } } } ]
		);
		assert.deepEqual(
			tortoise.parse('2 ** 3 + 4;'),
			[ { tag: 'ignore', body: { tag: '+', left: { tag: '**', left: 2, right: 3 }, right: 4 } } ]
		);
	});
	test('exp beats sub', function() {
		assert.deepEqual(
			tortoise.parse('2 - 3 ** 4;'),
			[ { tag: 'ignore', body: { tag: '-', left: 2, right: { tag: '**', left: 3, right: 4 } } } ]
		);
		assert.deepEqual(
			tortoise.parse('2 ** 3 - 4;'),
			[ { tag: 'ignore', body: { tag: '-', left: { tag: '**', left: 2, right: 3 }, right: 4 } } ]
		);
	});
	test('exp beats mul', function() {
		assert.deepEqual(
			tortoise.parse('2 * 3 ** 4;'),
			[ { tag: 'ignore', body: { tag: '*', left: 2, right: { tag: '**', left: 3, right: 4 } } } ]
		);
		assert.deepEqual(
			tortoise.parse('2 ** 3 * 4;'),
			[ { tag: 'ignore', body: { tag: '*', left: { tag: '**', left: 2, right: 3 }, right: 4 } } ]
		);
	});
	test('exp beats div', function() {
		assert.deepEqual(
			tortoise.parse('2 / 3 ** 4;'),
			[ { tag: 'ignore', body: { tag: '/', left: 2, right: { tag: '**', left: 3, right: 4 } } } ]
		);
		assert.deepEqual(
			tortoise.parse('2 ** 3 / 4;'),
			[ { tag: 'ignore', body: { tag: '/', left: { tag: '**', left: 2, right: 3 }, right: 4 } } ]
		);
	});
	test('exp beats mod', function() {
		assert.deepEqual(
			tortoise.parse('2 % 3 ** 4;'),
			[ { tag: 'ignore', body: { tag: '%', left: 2, right: { tag: '**', left: 3, right: 4 } } } ]
		);
		assert.deepEqual(
			tortoise.parse('2 ** 3 % 4;'),
			[ { tag: 'ignore', body: { tag: '%', left: { tag: '**', left: 2, right: 3 }, right: 4 } } ]
		);
	});
	test('mul beats add', function() {
		assert.deepEqual(
			tortoise.parse('2 + 3 * 4;'),
			[ { tag: 'ignore', body: { tag: '+', left: 2, right: { tag: '*', left: 3, right: 4 } } } ]
		);
		assert.deepEqual(
			tortoise.parse('2 * 3 + 4;'),
			[ { tag: 'ignore', body: { tag: '+', left: { tag: '*', left: 2, right: 3 }, right: 4 } } ]
		);
	});
	test('mul beats sub', function() {
		assert.deepEqual(
			tortoise.parse('2 - 3 * 4;'),
			[ { tag: 'ignore', body: { tag: '-', left: 2, right: { tag: '*', left: 3, right: 4 } } } ]
		);
		assert.deepEqual(
			tortoise.parse('2 * 3 - 4;'),
			[ { tag: 'ignore', body: { tag: '-', left: { tag: '*', left: 2, right: 3 }, right: 4 } } ]
		);
	});
	test('div beats add', function() {
		assert.deepEqual(
			tortoise.parse('2 + 3 / 4;'),
			[ { tag: 'ignore', body: { tag: '+', left: 2, right: { tag: '/', left: 3, right: 4 } } } ]
		);
		assert.deepEqual(
			tortoise.parse('2 / 3 + 4;'),
			[ { tag: 'ignore', body: { tag: '+', left: { tag: '/', left: 2, right: 3 }, right: 4 } } ]
		);
	});
	test('div beats sub', function() {
		assert.deepEqual(
			tortoise.parse('2 - 3 / 4;'),
			[ { tag: 'ignore', body: { tag: '-', left: 2, right: { tag: '/', left: 3, right: 4 } } } ]
		);
		assert.deepEqual(
			tortoise.parse('2 / 3 - 4;'),
			[ { tag: 'ignore', body: { tag: '-', left: { tag: '/', left: 2, right: 3 }, right: 4 } } ]
		);
	});
	test('mod beats add', function() {
		assert.deepEqual(
			tortoise.parse('2 + 3 % 4;'),
			[ { tag: 'ignore', body: { tag: '+', left: 2, right: { tag: '%', left: 3, right: 4 } } } ]
		);
		assert.deepEqual(
			tortoise.parse('2 % 3 + 4;'),
			[ { tag: 'ignore', body: { tag: '+', left: { tag: '%', left: 2, right: 3 }, right: 4 } } ]
		);
	});
	test('mod beats sub', function() {
		assert.deepEqual(
			tortoise.parse('2 - 3 % 4;'),
			[ { tag: 'ignore', body: { tag: '-', left: 2, right: { tag: '%', left: 3, right: 4 } } } ]
		);
		assert.deepEqual(
			tortoise.parse('2 % 3 - 4;'),
			[ { tag: 'ignore', body: { tag: '-', left: { tag: '%', left: 2, right: 3 }, right: 4 } } ]
		);
	});
	test('add beats conditional', function() {
		assert.deepEqual(
			tortoise.parse('2 != 3 + 4;'),
			[ { tag: 'ignore', body: { tag: '!=', left: 2, right: { tag: '+', left: 3, right: 4 } } } ]
		);
		assert.deepEqual(
			tortoise.parse('2 + 3 >= 4;'),
			[ { tag: 'ignore', body: { tag: '>=', left: { tag: '+', left: 2, right: 3 }, right: 4 } } ]
		);
	});
	test('sub beats conditional', function() {
		assert.deepEqual(
			tortoise.parse('2 == 3 - 5;'),
			[ { tag: 'ignore', body: { tag: '==', left: 2, right: { tag: '-', left: 3, right: 5 } } } ]
		);
		assert.deepEqual(
			tortoise.parse('2 - 3 <= 4;'),
			[ { tag: 'ignore', body: { tag: '<=', left: { tag: '-', left: 2, right: 3 }, right: 4 } } ]
		);
	});
	test('mul beats conditional', function() {
		assert.deepEqual(
			tortoise.parse('2 > 3 * 4;'),
			[ { tag: 'ignore', body: { tag: '>', left: 2, right: { tag: '*', left: 3, right: 4 } } } ]
		);
		assert.deepEqual(
			tortoise.parse('2 * 3 < 4;'),
			[ { tag: 'ignore', body: { tag: '<', left: { tag: '*', left: 2, right: 3 }, right: 4 } } ]
		);
	});
	test('div beats conditional', function() {
		assert.deepEqual(
			tortoise.parse('2 >= 3 / 4;'),
			[ { tag: 'ignore', body: { tag: '>=', left: 2, right: { tag: '/', left: 3, right: 4 } } } ]
		);
		assert.deepEqual(
			tortoise.parse('2 / 3 < 4;'),
			[ { tag: 'ignore', body: { tag: '<', left: { tag: '/', left: 2, right: 3 }, right: 4 } } ]
		);
	});
	test('mod beats conditional', function() {
		assert.deepEqual(
			tortoise.parse('2 >= 3 % 4;'),
			[ { tag: 'ignore', body: { tag: '>=', left: 2, right: { tag: '%', left: 3, right: 4 } } } ]
		);
		assert.deepEqual(
			tortoise.parse('2 % 3 < 4;'),
			[ { tag: 'ignore', body: { tag: '<', left: { tag: '%', left: 2, right: 3 }, right: 4 } } ]
		);
	});
});

suite('assignment', function(){
	test('simple assignment', function() {
		assert.deepEqual(
			tortoise.parse('x := 1;'),
			[ { tag: ':=', left: 'x', right: 1 } ]
		);
	});
	test('simple expression assignment', function() {
		assert.deepEqual(
			tortoise.parse('x := 1 + 4;'),
			[ { tag: ':=', left: 'x', right: { tag: '+', left: 1, right: 4 } } ]
		);
	});
	test('complex expression assignment', function() {
		assert.deepEqual(
			tortoise.parse('x := (1 + 4) / (22 - 12);'),
			[ { tag: ':=', left: 'x', right: { tag: '/', left: { tag: '+', left: 1, right: 4 }, right: { tag: '-', left: 22, right: 12 } } } ]
		);
	});
});
