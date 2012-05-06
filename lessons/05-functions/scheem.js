if (typeof module !== 'undefined') {
	var SCHEEM = require('./parser');
}

/* ********************************************************************
 * Errors
 ******************************************************************** */

var ScheemError = function(message) {
	this.message = message;
	this.name = 'ScheemError';
	this.toString = function() {
		return this.message;
	};
};

/* ********************************************************************
 * Utility functions
 ******************************************************************** */

// add a new binding
var add_binding = function (env, v, val) {
	var newOuter = null;
	if (env.outer) {
		newOuter = {
			name: env.name,
			value: env.value,
			outer: env.outer
		};
	}
	env.name = v;
	env.value = val;
	env.outer = newOuter;
};

// update a variable in the environment
var envUpdate = function (env, v, val) {
	if (!env) {
		throw new ScheemError('Undefined variable: ' + v);
	}
	if (env.name == v) {
		env.value = val;
		return env;
	}
	return envUpdate(env.outer, v, val);
};

var envLookup = function (env, v) {
	if (!env) {
		throw new ScheemError('Undefined variable: ' + v);
	}
	if (env.name == v) {
		return env.value;
	}
	return envLookup(env.outer, v);
};

// create an initial environment
var initialEnv = function() {
	var env = {};
	return env;
};


/* ********************************************************************
 * Utility functions
 ******************************************************************** */

var _compare_items = function(a, b, comparator) {
	if (typeof a != typeof b) {
		throw new ScheemError('Cannot compare two items with different types');
	}
	if (Array.isArray(a)) {
		if (a.length != b.length) {
			throw new ScheemError('Cannot compare two lists with different lengths');
		}
		for (var i = 0, l = a.length; i < l; ++i) {
			if (!_compare_items(a[i], b[i], comparator)) {
				return false;
			}
		}
	} else if (!comparator(a, b)) {
		return false;
	}
	return true;
};

var _eval_transitive_truth = function(expr, env, func) {
	var last = evalScheem(expr[1], env);
	for (var i = 2, l = expr.length; i < l; ++i) {
		var cur = evalScheem(expr[i], env);
		if (!_compare_items(last, cur, func)) {
			return '#f';
		}
		last = cur;
	}
	return '#t';
};

/* ********************************************************************
 * Built-in functionality
 ******************************************************************** */

var _builtin_dispatch = {

	// simple arithmetic
	'+': function(expr, env) { return expr.slice(1).reduce(function(a,b) { return evalScheem(a, env) + evalScheem(b, env); }); },
	'-': function(expr, env) { return expr.slice(1).reduce(function(a,b) { return evalScheem(a, env) - evalScheem(b, env); }); },
	'*': function(expr, env) { return expr.slice(1).reduce(function(a,b) { return evalScheem(a, env) * evalScheem(b, env); }); },
	'/': function(expr, env) { return expr.slice(1).reduce(function(a,b) { return evalScheem(a, env) / evalScheem(b, env); }); },

	// conditionals
	'=':  function(expr, env) { return _eval_transitive_truth(expr, env, function(a, b) { return a == b; }); },
	'<':  function(expr, env) { return _eval_transitive_truth(expr, env, function(a, b) { return a < b; }); },
	'>':  function(expr, env) { return _eval_transitive_truth(expr, env, function(a, b) { return a > b; }); },
	'<=': function(expr, env) { return _eval_transitive_truth(expr, env, function(a, b) { return a <= b; }); },
	'>=': function(expr, env) { return _eval_transitive_truth(expr, env, function(a, b) { return a >= b; }); },

	// logical
	'&': function(expr, env) { return expr.slice(1).every(function(a) { return evalScheem(a, env) == '#t'; }) ? '#t' : '#f'; },
	'|': function(expr, env) { return expr.slice(1).some(function(a)  { return evalScheem(a, env) == '#t'; }) ? '#t' : '#f'; },
	'not': [1, function(expr, env) { return (evalScheem(expr[1], env) == '#t') ? '#f' : '#t'; }],

	// aliases
	"\u00D7": function(expr, env) { return evalScheem(['*'].concat(expr.slice(1)), env); },
	"\u00F7": function(expr, env) { return evalScheem(['/'].concat(expr.slice(1)), env); },
	"\u2264": function(expr, env) { return evalScheem(['<='].concat(expr.slice(1)), env); },
	"\u2265": function(expr, env) { return evalScheem(['>='].concat(expr.slice(1)), env); },
	'and':    function(expr, env) { return evalScheem(['&'].concat(expr.slice(1)), env); },
	'or':     function(expr, env) { return evalScheem(['|'].concat(expr.slice(1)), env); },

	// the rest
	'begin': function(expr, env) {
		var r = 0;
		for (var i = 1, l = expr.length; i<l; ++i) {
			r = evalScheem(expr[i], env);
		}
		return r;
	},

	'define': [2, function(expr, env) {
		add_binding(env, expr[1], evalScheem(expr[2], env));
		return 0;
	}],

	'set!': [2, function(expr, env) {
		envUpdate(env, expr[1], evalScheem(expr[2], env));
		return 0;
	}],

	'quote': [1, function(expr, env) {
		return expr[1];
	}],

	'cons': function(expr, env) {
		return [evalScheem(expr[1], env)].concat(evalScheem(expr[2], env));
	},

	'car': [1, function(expr, env) {
		return evalScheem(expr[1], env)[0];
	}],

	'cdr': [1, function(expr, env) {
		return evalScheem(expr[1], env).slice(1);
	}],

	'if': [2, 3, function(expr, env) {
		var test = evalScheem(expr[1], env);
		if (test === '#t') {
			return evalScheem(expr[2], env);
		} else if (test === '#f') {
			return ('3' in expr) ? evalScheem(expr[3], env) : 0;
		} else {
			throw new ScheemError('First argument to "if" must evaluate to a boolean (#t or #f)');
		}
	}],

};

/* ********************************************************************
 * Core interpreter
 ******************************************************************** */

// evaluate a Scheem expression
var evalScheem = function(expr, env) {
	if (typeof env == 'undefined') {
		env = initialEnv();
	}

	// the simple cases
	if (typeof expr === 'number' || typeof expr === 'boolean') {
		return expr;
	}

	if (typeof expr === 'string') {
		if (expr === '#t' || expr === '#f') {
			return expr;
		}
		return envLookup(env, expr);
	}

	if (!(expr[0] in _builtin_dispatch)) {
		throw new ScheemError('Unrecognised Scheem function "' + expr[0] + '"');
	}
	var func_info = _builtin_dispatch[expr[0]];
	if (typeof func_info === 'function') {
		// unlimited args
		return func_info(expr, env);
	} else if (func_info.length == 2) {
		// specific argcount
		if ((expr.length - 1) !== func_info[0]) {
			throw new ScheemError('Scheem function "' + expr[0] + '" requires exactly ' + func_info[0] + ' arguments; ' + (expr.length - 1) + ' given.');
		}
		return func_info[1](expr, env);
	} else if (func_info.length == 3) {
		// variable argcount, with min/max
		if (func_info[0] !== null && (expr.length - 1) < func_info[0]) {
			throw new ScheemError('Scheem function "' + expr[0] + '" requires at least ' + func_info[0] + ' arguments; ' + (expr.length - 1) + ' given.');
		}
		if (func_info[1] !== null && (expr.length - 1) > func_info[1]) {
			throw new ScheemError('Scheem function "' + expr[0] + '" requires no more than ' + func_info[1] + ' arguments; ' + (expr.length - 1) + ' given.');
		}
		return func_info[2](expr, env);
	}
};

var evalScheemString = function(str, env) {
	if (typeof env == 'undefined') {
		env = initialEnv();
	}
	return evalScheem(SCHEEM.parse(str), env);
};


if (typeof module !== 'undefined') {
	module.exports.evalScheem = evalScheem;
	module.exports.evalScheemString = evalScheemString;
	module.exports.initialEnv = initialEnv;
}
