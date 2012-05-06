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
	add_binding(env, 'identity', function(args) { return args[0]; });
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
	var last = evalScheem(expr[0], env);
	for (var i = 1, l = expr.length; i < l; ++i) {
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

var builtin = function(fn, argsMin, argsMax) {
	fn.builtin = true;
	fn.argsMin = argsMin;
	fn.argsMax = argsMax;
	return fn;
};

var _builtin_dispatch = {

	// simple arithmetic
	'+': function(expr, env) { return expr.reduce(function(a,b) { return evalScheem(a, env) + evalScheem(b, env); }); },
	'-': function(expr, env) { return expr.reduce(function(a,b) { return evalScheem(a, env) - evalScheem(b, env); }); },
	'*': function(expr, env) { return expr.reduce(function(a,b) { return evalScheem(a, env) * evalScheem(b, env); }); },
	'/': function(expr, env) { return expr.reduce(function(a,b) { return evalScheem(a, env) / evalScheem(b, env); }); },

	// conditionals
	'=':  function(expr, env) { return _eval_transitive_truth(expr, env, function(a, b) { return a == b; }); },
	'<':  function(expr, env) { return _eval_transitive_truth(expr, env, function(a, b) { return a < b; }); },
	'>':  function(expr, env) { return _eval_transitive_truth(expr, env, function(a, b) { return a > b; }); },
	'<=': function(expr, env) { return _eval_transitive_truth(expr, env, function(a, b) { return a <= b; }); },
	'>=': function(expr, env) { return _eval_transitive_truth(expr, env, function(a, b) { return a >= b; }); },

	// logical
	'&': function(expr, env) { return expr.every(function(a) { return evalScheem(a, env) == '#t'; }) ? '#t' : '#f'; },
	'|': function(expr, env) { return expr.some(function(a)  { return evalScheem(a, env) == '#t'; }) ? '#t' : '#f'; },
	'not': builtin(function(expr, env) { return (evalScheem(expr[0], env) == '#t') ? '#f' : '#t'; }, 1, 1),

	// aliases
	"\u00D7": function(expr, env) { return evalScheem(['*'].concat(expr), env); },
	"\u00F7": function(expr, env) { return evalScheem(['/'].concat(expr), env); },
	"\u2264": function(expr, env) { return evalScheem(['<='].concat(expr), env); },
	"\u2265": function(expr, env) { return evalScheem(['>='].concat(expr), env); },
	'and':    function(expr, env) { return evalScheem(['&'].concat(expr), env); },
	'or':     function(expr, env) { return evalScheem(['|'].concat(expr), env); },

	// the rest
	'begin': function(expr, env) {
		var r = 0;
		for (var i = 0, l = expr.length; i<l; ++i) {
			r = evalScheem(expr[i], env);
		}
		return r;
	},

	'define': builtin(function(expr, env) {
		add_binding(env, expr[0], evalScheem(expr[1], env));
		return 0;
	}, 2, 2),

	'set!': builtin(function(expr, env) {
		envUpdate(env, expr[0], evalScheem(expr[1], env));
		return 0;
	}, 2, 2),

	'quote': builtin(function(expr, env) {
		return expr[0];
	}, 1, 1),

	'cons': builtin(function(expr, env) {
		return [evalScheem(expr[0], env)].concat(evalScheem(expr[1], env));
	}, 2, 2),

	'car': builtin(function(expr, env) {
		return evalScheem(expr[0], env)[0];
	}, 1, 1),

	'cdr': builtin(function(expr, env) {
		return evalScheem(expr[0], env).slice(1);
	}, 1, 1),

	'if': builtin(function(expr, env) {
		var test = evalScheem(expr[0], env);
		if (test === '#t') {
			return evalScheem(expr[1], env);
		} else if (test === '#f') {
			return ('2' in expr) ? evalScheem(expr[2], env) : 0;
		} else {
			throw new ScheemError('First argument to "if" must evaluate to a boolean (#t or #f)');
		}
	}, 2, 3),

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

	var func_name = expr[0];
	var called_arg_count = expr.length - 1;
	var func;

	// try for a built-in function
	if (func_name in _builtin_dispatch) {
		func = _builtin_dispatch[func_name];
	} else {
		func = envLookup(env, func_name);
	}

	if (typeof func.argsMin == 'undefined' && typeof func.argsMax == 'undefined') {
		// no limit on args

	} else if (typeof func.argsMin == 'undefined') {
		// no minimum arg count
		if (called_arg_count > func.argsMax) {
			throw new ScheemError('Scheem function "' + func_name + '" requires no more than ' + func.argsMax + ' arguments; ' + called_arg_count + ' given.');
		}

	} else if (typeof func.argsMax == 'undefined') {
		// no maximum arg count
		if (called_arg_count < func.argsMin) {
			throw new ScheemError('Scheem function "' + func_name + '" requires at least ' + func.argsMin + ' arguments; ' + called_arg_count + ' given.');
		}

	} else if (func.argsMin == func.argsMax) {
		// exact arg count
		if (called_arg_count != func.argsMax) {
			throw new ScheemError('Scheem function "' + func_name + '" requires exactly ' + func.argsMax + ' arguments; ' + called_arg_count + ' given.');
		}

	} else {
		// arg count range
		if (called_arg_count < func.argsMin) {
			throw new ScheemError('Scheem function "' + func_name + '" requires at least ' + func.argsMin + ' arguments; ' + called_arg_count + ' given.');
		}
		if (called_arg_count > func.argsMax) {
			throw new ScheemError('Scheem function "' + func_name + '" requires no more than ' + func.argsMax + ' arguments; ' + called_arg_count + ' given.');
		}
	}

	return func(expr.slice(1), env);
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
