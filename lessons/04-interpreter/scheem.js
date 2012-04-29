var _func_dispatch = {
	'quote': function(expr, env) {
		return expr[1];
	},
};


var evalScheem = function(expr, env) {
	// the simple cases
	if (typeof expr === 'number') {
		return expr;
	}

	if (typeof expr === 'string') {
		if (expr in env) {
			return env[expr];
		} else {
			throw 'Undefined variable: '+expr;
		}
	}

  if (!(expr[0] in _func_dispatch)) {
    throw 'Unrecognised Scheem function "' + expr[0] + '"';
  }
  var func_info = _func_dispatch[expr[0]];
  if (typeof func_info === 'function') {
		// unlimited args
		return func_info(expr, env);
  } else {
		// specific argcount
		if ((expr[0].length + 1) !== func_info[0]) {
			throw 'Scheem function "' + expr[0] + '" requires exactly ' + func_info[0] + ' arguments.';
		}
		return func_info[1](expr, env);
	}
};


if (typeof module !== 'undefined') {
	module.exports.evalScheem = evalScheem;
}
