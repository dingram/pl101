var ScheemError = function(message) {
	this.message = message;
	this.name = 'ScheemError';
	this.toString = function() {
		return this.message;
	};
};

var _func_dispatch = {

	// simple arithmetic
	'+': function(expr, env) { return expr.slice(1).reduce(function(a,b) { return evalScheem(a, env) + evalScheem(b, env); }); },
	'-': [2, function(expr, env) { return evalScheem(expr[1], env) - evalScheem(expr[2], env); }],
	'*': function(expr, env) { return expr.slice(1).reduce(function(a,b) { return evalScheem(a, env) * evalScheem(b, env); }); },
	'/': [2, function(expr, env) { return evalScheem(expr[1], env) / evalScheem(expr[2], env); }],

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
