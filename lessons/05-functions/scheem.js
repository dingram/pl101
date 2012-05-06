if (typeof module !== 'undefined') {
	var SCHEEM = require('./parser');
}

/* ********************************************************************
 * Errors
 ******************************************************************** */

var ScheemError = function(message) {
	this.constructor.prototype.__proto__ = Error.prototype;
	if (Error.captureStackTrace)
		Error.captureStackTrace(this, this.constructor);
	this.name = 'ScheemError';
	this.message = message;
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
 * Environment functions
 ******************************************************************** */

var dump_environment = function(env) {
	var e = env;
	var vars = {};
	var shadowed = [];
	while (e && 'name' in e) {
		if (e.name in vars) {
			shadowed.push({n: e.name, v: e.value});
		} else {
			vars[e.name] = e.value;
		}
		e = e.outer;
	}
	console.log("");
	console.log("Current environment:");
	for (var n in vars) {
		console.log('  ' + n + ": " + vars[n]);
	}
	if (shadowed.length) {
		console.log("Shadowed variables:");
		for (var i = 0, l=shadowed.length; i<l; ++i) {
			console.log('  ' + shadowed[i].n + ": " + shadowed[i].v);
		}
	}
};

// add a new binding
var add_binding = function (env, v, val) {
	var newOuter = null;
	if (env.name !== undefined) {
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

var add_func_binding = function (env, v, minArgs, maxArgs, fn) {
	fn.argsMin = minArgs;
	fn.argsMax = maxArgs;
	return add_binding(env, v, fn);
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

// NB: populated below
var initialEnv;

var initialEnvLookup = function (v, env) {
	if (typeof env == 'undefined') {
		env = initialEnv;
	} else if (!env) {
		throw new ScheemError('Undefined variable: ' + v);
	}
	if (env.name == v) {
		return env.value;
	}
	return initialEnvLookup(v, env.outer);
};

// create an initial environment (defined above)
initialEnv = (function() {
	var initEnv = {};

	// global "variable"s
	add_binding(initEnv, 'null', []);
	add_binding(initEnv, 'nil',  []);

	// identity function
	add_binding(initEnv, 'identity', function(args) { return args[0]; });

	// simple arithmetic
	add_binding(initEnv, '+', function(args, env) { return args.reduce(function(a,b) { return evalScheem(a, env) + evalScheem(b, env); }); });
	add_binding(initEnv, '-', function(args, env) { return args.reduce(function(a,b) { return evalScheem(a, env) - evalScheem(b, env); }); });
	add_binding(initEnv, '*', function(args, env) { return args.reduce(function(a,b) { return evalScheem(a, env) * evalScheem(b, env); }); });
	add_binding(initEnv, '/', function(args, env) { return args.reduce(function(a,b) { return evalScheem(a, env) / evalScheem(b, env); }); });

	// conditionals
	add_binding(initEnv, '=',  function(args, env) { return _eval_transitive_truth(args, env, function(a, b) { return a == b; }); });
	add_binding(initEnv, '<',  function(args, env) { return _eval_transitive_truth(args, env, function(a, b) { return a < b; }); });
	add_binding(initEnv, '>',  function(args, env) { return _eval_transitive_truth(args, env, function(a, b) { return a > b; }); });
	add_binding(initEnv, '<=', function(args, env) { return _eval_transitive_truth(args, env, function(a, b) { return a <= b; }); });
	add_binding(initEnv, '>=', function(args, env) { return _eval_transitive_truth(args, env, function(a, b) { return a >= b; }); });

	// logical
	add_binding(initEnv, '&&',  function(args, env) { return args.every(function(a) { return evalScheem(a, env) == '#t'; }) ? '#t' : '#f'; });
	add_binding(initEnv, '||',  function(args, env) { return args.some(function(a)  { return evalScheem(a, env) == '#t'; }) ? '#t' : '#f'; });
	add_func_binding(initEnv, 'not', 1, 1, function(args, env) { return (evalScheem(args[0], env) == '#t') ? '#f' : '#t'; });

	// list functions
	add_func_binding(initEnv, 'cons',   2, 2, function(args, env) { return [evalScheem(args[0], env)].concat(evalScheem(args[1], env)); });
	add_func_binding(initEnv, 'car',    1, 1, function(args, env) { return evalScheem(args[0], env)[0]; });
	add_func_binding(initEnv, 'cdr',    1, 1, function(args, env) { return evalScheem(args[0], env).slice(1); });
	add_func_binding(initEnv, 'length', 1, 1, function(args, env) { return evalScheem(args[0], env).length; });

	add_func_binding(
		initEnv,
		'list-ref',
		2, 2,
		function(args, env) {
			var val = evalScheem(args[0], env);
			var idx = evalScheem(args[1], env);
			if (idx in val) {
				return val[idx];
			} else {
				throw new ScheemError('Input list is too short');
			}
		}
	);

	add_func_binding(
		initEnv,
		'map',
		2, undefined,
		function(args, env) {
			var fn = evalScheem(args[0], env);
			var lists = args.slice(1).map(function(a) { return evalScheem(a, env); });
			var result = [];
			for (var i=0, l=lists[0].length; i < l; ++i) {
				var fargs = [fn];
				for (var j = 0, ll = lists.length; j < ll; ++j) {
					fargs.push(lists[j][i]);
				}
				result.push(evalScheem(fargs, env));
			}
			return result;
		}
	);

	add_func_binding(
		initEnv,
		'foldl',
		3, undefined,
		function(args, env) {
			var fn = evalScheem(args[0], env);
			var init = evalScheem(args[1], env);
			var lists = args.slice(2).map(function(a) { return evalScheem(a, env); });
			var result = init;
			for (var i=0, l=lists[0].length; i < l; ++i) {
				var fargs = [fn];
				for (var j = 0, ll = lists.length; j < ll; ++j) {
					fargs.push(lists[j][i]);
				}
				fargs.push(result);
				result = evalScheem(fargs, env);
			}
			return result;
		}
	);

	// alerts
	add_func_binding(
		initEnv,
		'alert',
		1, 1,
		function(args, env) {
			var val = evalScheem(args[0], env);
			(typeof alert != 'undefined' ? alert : console.log)(val);
			return val;
		}
	);

	// aliases
	add_binding(initEnv, "\u00D7", initialEnvLookup('*', initEnv));
	add_binding(initEnv, "\u00F7", initialEnvLookup('/', initEnv));
	add_binding(initEnv, "\u2264", initialEnvLookup('<=', initEnv));
	add_binding(initEnv, "\u2265", initialEnvLookup('>=', initEnv));
	add_binding(initEnv, 'and',    initialEnvLookup('&&', initEnv));
	add_binding(initEnv, 'or',     initialEnvLookup('||', initEnv));

	return initEnv;
})();

var envLookup = function (env, v) {
	if (!env) {
		// look up in initial environment
		return initialEnvLookup(v);
	}
	if (env.name == v) {
		return env.value;
	}
	return envLookup(env.outer, v);
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

	'lambda-one': builtin(function(expr, env) {
		var fn = function(x, env){
			var innerEnv = JSON.parse(JSON.stringify(env));
			add_binding(innerEnv, expr[0], evalScheem(x[0], env));
			return evalScheem(expr[1], innerEnv);
		};
		fn.argsMin = fn.argsMax = 1;
		return fn;
	}, 2, 2),

	'lambda': builtin(function(expr, env) {
		var fn;
		var arglist = expr[0];
		if (typeof arglist == 'string') {
			// variable arguments getting bound to a list
			fn = function(x, env){
				var innerEnv = JSON.parse(JSON.stringify(env));
				var argvalues = [];
				for (var i = 0, l = x.length; i < l; ++i) {
					argvalues.push(evalScheem(x[i], env));
				}
				add_binding(innerEnv, arglist, argvalues);
				return evalScheem(expr[1], innerEnv);
			};
		} else {
			// exact list of arguments
			fn = function(x, env){
				var innerEnv = JSON.parse(JSON.stringify(env));
				for (var i = 0, l = arglist.length; i < l; ++i) {
					var argval = evalScheem(x[i], env);
					add_binding(innerEnv, arglist[i], argval);
				}
				var ret = evalScheem(expr[1], innerEnv);
				return ret;
			};
			fn.argsMin = arglist.length;
			fn.argsMax = arglist.length;
		}
		return fn;
	}, 2, 2),

};

/* ********************************************************************
 * Core interpreter
 ******************************************************************** */

var evalFunction = function(expr, env) {
	var func_name = expr[0];
	var called_arg_count = expr.length - 1;
	var func;

	// try for a built-in function
	if (typeof func_name == 'function') {
		func = func_name;
		func_name = '<lambda>';
	} else if (func_name in _builtin_dispatch) {
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

// evaluate a Scheem expression
var evalScheem = function(expr, env) {
	if (typeof env == 'undefined') {
		env = {};
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

	return evalFunction(expr, env);
};

var evalScheemString = function(str, env) {
	if (typeof env == 'undefined') {
		env = {};
	}
	return evalScheem(SCHEEM.parse(str), env);
};

var stringify = function(scheem) {
	if (typeof scheem === 'number' || typeof scheem === 'string') {
		return ""+scheem;
	}
	if (typeof scheem === 'boolean') {
		return scheem ? '#t' : '#f';
	}
	if (scheem[0] === 'quote') {
		return "'" + stringify(scheem[1]);
	}
	return '(' + scheem.map(stringify).join(' ') + ')';
};

if (typeof module !== 'undefined') {
	module.exports.evalScheem = evalScheem;
	module.exports.evalScheemString = evalScheemString;
	module.exports.stringify = stringify;
}
