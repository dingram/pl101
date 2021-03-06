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
	test('modulo', function() {
		assert.deepEqual(
			tortoise.eval('8 % 4;'),
			0
		);
		assert.deepEqual(
			tortoise.eval('8 % -4;'),
			0
		);
		assert.deepEqual(
			tortoise.eval('-8 % 4;'),
			0
		);
		assert.deepEqual(
			tortoise.eval('-8 % -4;'),
			0
		);
		assert.deepEqual(
			tortoise.eval('8 % 3;'),
			2
		);
		assert.deepEqual(
			tortoise.eval('8 % -3;'),
			2
		);
		assert.deepEqual(
			tortoise.eval('-8 % 3;'),
			-2
		);
		assert.deepEqual(
			tortoise.eval('-8 % -3;'),
			-2
		);
	});
});

suite('expression evaluation (integers and variables)', function() {
	test('addition', function() {
		assert.deepEqual(
			tortoise.eval('3 + x;', {bindings:{x:8}}),
			11
		);
		assert.deepEqual(
			tortoise.eval('3 + -x;', {bindings:{x:8}}),
			-5
		);
		assert.deepEqual(
			tortoise.eval('-3 + x;', {bindings:{x:8}}),
			5
		);
		assert.deepEqual(
			tortoise.eval('-3 + -x;', {bindings:{x:8}}),
			-11
		);
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
		assert.deepEqual(
			tortoise.eval('-x - 8;', {bindings:{x:3}}),
			-11
		);
		assert.deepEqual(
			tortoise.eval('-x - -8;', {bindings:{x:3}}),
			5
		);
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
		assert.deepEqual(
			tortoise.eval('-3 * -8;'),
			24
		);
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
		assert.deepEqual(
			tortoise.eval('-8 / -4;'),
			2
		);
	});
	test('exponentiation', function() {
		assert.deepEqual(
			tortoise.eval('3 ** x;', {bindings:{x:8}}),
			Math.pow(3, 8)
		);
		assert.deepEqual(
			tortoise.eval('3 ** -x;', {bindings:{x:8}}),
			Math.pow(3, -8)
		);
		assert.deepEqual(
			tortoise.eval('-3 ** x;', {bindings:{x:8}}),
			Math.pow(-3, 8)
		);
		assert.deepEqual(
			tortoise.eval('-3 ** -x;', {bindings:{x:8}}),
			Math.pow(-3, -8)
		);
	});
	test('unary minus', function() {
		assert.deepEqual(
			tortoise.eval('-x;', {bindings:{x:8}}),
			-8
		);
		assert.deepEqual(
			tortoise.eval('-x;', {bindings:{x:-8}}),
			8
		);
	});
	test('unary negation', function() {
		assert.deepEqual(
			tortoise.eval('!x;', {bindings:{x:0}}),
			1
		);
		assert.deepEqual(
			tortoise.eval('!x;', {bindings:{x:1}}),
			0
		);
		assert.deepEqual(
			tortoise.eval('!x;', {bindings:{x:-1}}),
			0
		);
		assert.deepEqual(
			tortoise.eval('!x;', {bindings:{x:8}}),
			0
		);
		assert.deepEqual(
			tortoise.eval('!x;', {bindings:{x:-8}}),
			0
		);
	});
});

suite('expression evaluation (dictionaries)', function() {
	test('empty', function() {
		assert.deepEqual(
			tortoise.eval('{};'),
			{}
		);
	});
	test('single-element int', function() {
		assert.deepEqual(
			tortoise.eval('{ a: 1 };'),
			{a: 1}
		);
	});
	test('single-element string', function() {
		assert.deepEqual(
			tortoise.eval('{ a: "abc" };'),
			{a: "abc"}
		);
	});
	test('single-element expression', function() {
		assert.deepEqual(
			tortoise.eval('{ a: 1+2 };'),
			{a: 3}
		);
	});
	test('single-element complex expression', function() {
		assert.deepEqual(
			tortoise.eval('{ a: 1+2 };'),
			{a: 3}
		);
	});
	test('nested complex expression', function() {
		assert.deepEqual(
			tortoise.eval('{ foo: { bar: x*(1+2), baz: "quux" } };', { bindings: {x: 15}, _outer: null }),
			{foo: { bar: 45, baz: 'quux' }}
		);
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
	test('two declarations', function() {
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
	test('dual declaration', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('var x, y;', env),
			0
		);
		assert.deepEqual(
			env,
			{ bindings: { x: 0, y: 0 }, _outer: null }
		);
	});
	test('declaration with initialisation', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('var x := 12;', env),
			0
		);
		assert.deepEqual(
			env,
			{ bindings: { x: 12 }, _outer: null }
		);
	});
	test('two declarations with initialisation', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('var x := 12; var y := 34;', env),
			0
		);
		assert.deepEqual(
			env,
			{ bindings: { x: 12, y: 34 }, _outer: null }
		);
	});
	test('dual declaration with initialisation', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('var x := 12, y := 34;', env),
			0
		);
		assert.deepEqual(
			env,
			{ bindings: { x: 12, y: 34 }, _outer: null }
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

suite('variable subscript', function() {
	test('string', function(){
		assert.deepEqual(
			tortoise.eval('"foo"[0];'),
			'f'
		);
		assert.deepEqual(
			tortoise.eval('"bar"[1];'),
			'a'
		);
		assert.deepEqual(
			tortoise.eval('"bar"[2];'),
			'r'
		);
	});
	test('dictionary, single-level', function(){
		assert.deepEqual(
			tortoise.eval('var x := { a: 1, b: 2, c: 4 }; x["a"];'),
			1
		);
		assert.deepEqual(
			tortoise.eval('var x := { a: 1, b: 2, c: 4 }; x["b"];'),
			2
		);
		assert.deepEqual(
			tortoise.eval('var x := { a: 1, b: 2, c: 4 }; x["c"];'),
			4
		);
	});
	test('dictionary, multi-level', function(){
		assert.deepEqual(
			tortoise.eval('var x := { a: 1, b: { c: 4 } }; x["a"];'),
			1
		);
		assert.deepEqual(
			tortoise.eval('var x := { a: 1, b: { c: 4 } }; x["b"];'),
			{ c: 4 }
		);
		assert.deepEqual(
			tortoise.eval('var x := { a: 1, b: { c: 4 } }; x.b.c;'),
			4
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
			undefined
		);
	});
	test('simple expression', function() {
		assert.deepEqual(
			tortoise.eval('if (1 == 1) { 5; }'),
			5
		);
		assert.deepEqual(
			tortoise.eval('if (0 > 17) { 1; }'),
			undefined
		);
	});
	test('simple with else', function() {
		assert.deepEqual(
			tortoise.eval('if (1) { 5; } else { -1; }'),
			5
		);
		assert.deepEqual(
			tortoise.eval('if (0) { 1; } else { 42; }'),
			42
		);
	});
	test('simple expression with else', function() {
		assert.deepEqual(
			tortoise.eval('if (1 == 1) { 5; } else { 19; }'),
			5
		);
		assert.deepEqual(
			tortoise.eval('if (0 > 17) { 1; } else { 19; }'),
			19
		);
	});
	test('simple with multi-statement else', function() {
		assert.deepEqual(
			tortoise.eval('if (1) { 5; } else { -1; 25; }'),
			5
		);
		assert.deepEqual(
			tortoise.eval('if (0) { 1; } else { 784.1; 42; }'),
			42
		);
	});
	test('expression with logical operators, with else', function() {
		assert.deepEqual(
			tortoise.eval('if (1 == 1 && 2 == 2) { 5; } else { 19; }'),
			5
		);
		assert.deepEqual(
			tortoise.eval('if (1 <= 0 && 2 == 2) { 5; } else { 19; }'),
			19
		);
		assert.deepEqual(
			tortoise.eval('if (1 == 1 || 2 == 2) { 5; } else { 19; }'),
			5
		);
		assert.deepEqual(
			tortoise.eval('if (1 <= 0 || 2 == 2) { 5; } else { 19; }'),
			5
		);
		assert.deepEqual(
			tortoise.eval('if (1 != 1 || 2 != 2) { 5; } else { 19; }'),
			19
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

suite('function definition', function(){
	test('no args, empty body', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('define x() { }', env),
			0
		);
		assert.isFunction(env.bindings.x);
	});
	test('one arg, empty body', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('define x(foo) { }', env),
			0
		);
		assert.isFunction(env.bindings.x);
	});
	test('many args, empty body', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('define x(foo, bar, baz) { }', env),
			0
		);
		assert.isFunction(env.bindings.x);
	});
	test('one (optional) arg, empty body', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('define x(foo := 14) { }', env),
			0
		);
		assert.isFunction(env.bindings.x);
	});
	test('many args, one optional, empty body', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('define x(foo, bar, baz := 12) { }', env),
			0
		);
		assert.isFunction(env.bindings.x);
	});
	test('many args (all optional), empty body', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('define x(foo := 12, bar := 34, baz := 56) { }', env),
			0
		);
		assert.isFunction(env.bindings.x);
	});
	test('no args, single-statement body', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('define x() { 1 + 2; }', env),
			0
		);
		assert.isFunction(env.bindings.x);
	});
	test('one arg, single-statement body', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('define x(foo) { foo + 4; }', env),
			0
		);
		assert.isFunction(env.bindings.x);
	});
	test('many args, single-statement body', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('define x(foo, bar, baz) { foo + bar * baz - 3; }', env),
			0
		);
		assert.isFunction(env.bindings.x);
	});
	test('one (optional) arg, single-statement body', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('define x(foo := 4) { foo + 4; }', env),
			0
		);
		assert.isFunction(env.bindings.x);
	});
	test('many args, one optional, single-statement body', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('define x(foo, bar, baz := 56) { foo + bar * baz - 3; }', env),
			0
		);
		assert.isFunction(env.bindings.x);
	});
	test('many args (all optional), single-statement body', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('define x(foo := 12, bar := 34, baz := 56) { foo + bar * baz - 3; }', env),
			0
		);
		assert.isFunction(env.bindings.x);
	});
	test('no args, multi-statement body', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('define x() { var y; y := 11; if (1 == 2) { 42; } }', env),
			0
		);
		assert.isFunction(env.bindings.x);
	});
	test('one arg, multi-statement body', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('define x(foo) { var y; y := foo - 21; if (foo > 3) { 42; } }', env),
			0
		);
		assert.isFunction(env.bindings.x);
	});
	test('many args, multi-statement body', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('define x(foo, bar, baz) { var y; y := (baz + 20) / 4; if (foo + bar > 3) { 42; } }', env),
			0
		);
		assert.isFunction(env.bindings.x);
	});
	test('one (optional) arg, multi-statement body', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('define x(foo := 12) { var y; y := foo - 21; if (foo > 3) { 42; } }', env),
			0
		);
		assert.isFunction(env.bindings.x);
	});
	test('many args, one optional, multi-statement body', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('define x(foo, bar, baz := 56) { var y; y := (baz + 20) / 4; if (foo + bar > 3) { 42; } }', env),
			0
		);
		assert.isFunction(env.bindings.x);
	});
	test('many args (all optional), multi-statement body', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('define x(foo := 12, bar := 34, baz := 56) { var y; y := (baz + 20) / 4; if (foo + bar > 3) { 42; } }', env),
			0
		);
		assert.isFunction(env.bindings.x);
	});
});

suite('function call', function(){
	test('no args, empty body', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('define x() { } x();', env),
			0
		);
	});
	test('one arg, empty body', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('define x(foo) { } x(1);', env),
			0
		);
	});
	test('many args, empty body', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('define x(foo, bar, baz) { } x(1, 2, 3);', env),
			0
		);
	});
	test('no args, single-statement body', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('define x() { 1 + 2; } x();', env),
			3
		);
	});
	test('one arg, single-statement body', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('define x(foo) { foo + 4; } x(1);', env),
			5
		);
	});
	test('many args, single-statement body', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('define x(foo, bar, baz) { foo + bar * baz - 3; } x(4, 5, 6);', env),
			31
		);
	});
	test('no args, multi-statement body', function() {
		var env = {};
		assert.deepEqual(
			tortoise.eval('define x() { var y; y := 11; if (1 == 2) { 42; } } x();', env),
			11
		);
	});
	test('one arg, multi-statement body', function() {
		assert.deepEqual(
			tortoise.eval('define x(foo) { var y; y := foo - 2; if (foo > 3) { 42; } } x(3);'),
			1
		);
		assert.deepEqual(
			tortoise.eval('define x(foo) { var y; y := foo - 2; if (foo > 3) { 42; } } x(4);'),
			42
		);
	});
	test('many args, multi-statement body', function() {
		assert.deepEqual(
			tortoise.eval('define x(foo, bar, baz) { var y; y := (baz + 20) / 4; if (foo + bar > 3) { 42; } } x(1, 2, 4);'),
			6
		);
		assert.deepEqual(
			tortoise.eval('define x(foo, bar, baz) { var y; y := (baz + 20) / 4; if (foo + bar > 3) { 42; } } x(2, 3, 6);'),
			42
		);
	});
});
