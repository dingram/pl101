var ScheemError = function(message) {
	this.message = message;
	this.name = 'ScheemError';
	this.toString = function() {
		return this.message;
	};
};

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

var _func_dispatch = {

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
	"\u00F7": function(expr, env) { return evalScheem(['*'].concat(expr.slice(1)), env); },
	"\u00D7": function(expr, env) { return evalScheem(['/'].concat(expr.slice(1)), env); },
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
		if (expr[1] in env) {
			throw new ScheemError('Variable has already been defined: '+expr);
		}
		env[expr[1]] = evalScheem(expr[2], env);
		return 0;
	}],

	'set!': [2, function(expr, env) {
		if (!(expr[1] in env)) {
			throw new ScheemError('Undefined variable: '+expr);
		}
		env[expr[1]] = evalScheem(expr[2], env);
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

};


var evalScheem = function(expr, env) {
	// the simple cases
	if (typeof expr === 'number' || typeof expr === 'boolean') {
		return expr;
	}

	if (typeof expr === 'string') {
		if (expr === '#t' || expr === '#f') {
			return expr;
		} else if (expr in env) {
			return env[expr];
		} else {
			throw new ScheemError('Undefined variable: '+expr);
		}
	}

  if (!(expr[0] in _func_dispatch)) {
    throw new ScheemError('Unrecognised Scheem function "' + expr[0] + '"');
  }
  var func_info = _func_dispatch[expr[0]];
  if (typeof func_info === 'function') {
		// unlimited args
		return func_info(expr, env);
  } else {
		// specific argcount
		if ((expr.length - 1) !== func_info[0]) {
			throw new ScheemError('Scheem function "' + expr[0] + '" requires exactly ' + func_info[0] + ' arguments; ' + (expr.length - 1) + ' given.');
		}
		return func_info[1](expr, env);
	}
};

if (typeof module !== 'undefined') {
	module.exports.evalScheem = evalScheem;
}
