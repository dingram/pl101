if (typeof module == 'undefined') this.tortoise = {};
(function(x){

	var parser;
	if (typeof require != 'undefined') {
		parser = require('./tortoise-parser');
	}
	if ((typeof parser == 'undefined' || typeof parser.parse == 'undefined') && typeof this.TORTOISE != 'undefined') {
		parser = this.TORTOISE;
	} else {
		throw 'Cannot find parser';
	}

	var add_binding = function(env, name, value) {
		if (!env || typeof env != 'object') {
			throw new Error('Environment missing');
		}
		if (typeof env.bindings == 'undefined') {
			env.bindings = {};
			env._outer = null;
		}
		if (name in env.bindings) {
			env._outer = { bindings: env.bindings, _outer: env._outer };
			env.bindings = {};
		}
		env.bindings[name] = value;
		return value;
	};

	var update = function(env, name, value) {
		if (!env || typeof env != 'object') {
			throw new Error('Undeclared variable: ' + name);
		}
		if (name in env.bindings) {
			env.bindings[name] = value;
			return value;
		}
		return update(env._outer, name, value);
	};

	var lookup = function(env, name) {
		if (!env || typeof env != 'object') {
			throw new Error('Undefined variable: ' + name);
		}
		if (name in env.bindings) {
			return env.bindings[name];
		}
		return lookup(env._outer, name);
	};

	var evalExpr = function(expr, env) {
		if (typeof expr == 'number' || typeof expr == 'boolean' || typeof expr == 'undefined') {
			return expr;
		}
		switch (expr.tag) {
			case '+': return evalExpr(expr.left, env) + evalExpr(expr.right, env);
			case '-': return evalExpr(expr.left, env) - evalExpr(expr.right, env);
			case '*': return evalExpr(expr.left, env) * evalExpr(expr.right, env);
			case '/': return evalExpr(expr.left, env) / evalExpr(expr.right, env);
			case '%': return evalExpr(expr.left, env) % evalExpr(expr.right, env);

			case '**': return Math.pow(evalExpr(expr.left, env), evalExpr(expr.right, env));

			case '==': return evalExpr(expr.left, env) == evalExpr(expr.right, env) ? 1 : 0;
			case '!=': return evalExpr(expr.left, env) != evalExpr(expr.right, env) ? 1 : 0;
			case '<':  return evalExpr(expr.left, env) <  evalExpr(expr.right, env) ? 1 : 0;
			case '<=': return evalExpr(expr.left, env) <= evalExpr(expr.right, env) ? 1 : 0;
			case '>=': return evalExpr(expr.left, env) >= evalExpr(expr.right, env) ? 1 : 0;
			case '>':  return evalExpr(expr.left, env) >  evalExpr(expr.right, env) ? 1 : 0;

			case '!':  return evalExpr(expr.expr, env) ? 0 : 1;

			case '&&': return evalExpr(expr.left, env) && evalExpr(expr.right, env) ? 1 : 0;
			case '||': return evalExpr(expr.left, env) || evalExpr(expr.right, env) ? 1 : 0;

			case 'ident': return lookup(env, expr.name);
			case 'string': return expr.value;
			case 'dict':
				var result = {};
				for (var i in expr.contents) {
					result[i] = evalExpr(expr.contents[i], env);
				}
				return result;

			case 'subscript':
				var base = evalExpr(expr.expr, env);
				var result = base;
				if (typeof base != 'string' && typeof base != 'object') {
					throw new Error('Cannot access subscripts of non-string/-dictionary expression');
				}
				var indices = expr.indices.map(function(x){ return evalExpr(x, env); });
				for (var i = 0, l = indices.length; i < l; ++i) {
					if (typeof result == 'string') {
						if (typeof indices[i] != 'number') {
							throw new Error('String offset must be a number');
						} else if (indices[i] >= 0 && indices[i] < result.length) {
							result = result[indices[i]];
						} else {
							throw new Error('String offset '+indices[i]+' does not exist');
						}
					} else if (typeof result != 'undefined' && indices[i] in result) {
						result = result[indices[i]];
					} else {
						throw new Error('Subscript '+indices[i]+' does not exist');
					}
				}
				return result;

			case 'call':
				var func = lookup(env, expr.name);
				var args = expr.args.map(function(x){ return evalExpr(x, env); });
				return func.apply(null, args);
		}

		throw new Error('Undefined opcode: '+expr.tag);
	};

	var execStatement = function(stmt, env) {
		var val = 0;

		switch (stmt.tag) {
			case 'ignore':
				return evalExpr(stmt.body, env);

			case 'var':
				for (var i = 0, l = stmt.vars.length; i < l; ++i) {
					var val = evalExpr(stmt.vars[i].value, env);
					if (typeof val === 'undefined') {
						val = 0;
					}
					add_binding(env, stmt.vars[i].name, val);
				}
				return 0;

			case ':=':
				val = evalExpr(stmt.right, env);
				update(env, stmt.left, val);
				return val;

			case 'if':
				if (evalExpr(stmt.expr, env)) {
					return execStatements(stmt.body, env);
				} else if ('else_body' in stmt && Array.isArray(stmt.else_body)) {
					return execStatements(stmt.else_body, env);
				}
				return undefined;

			case 'repeat':
				var times = evalExpr(stmt.expr, env);
				for (var i = 0; i < times; ++i) {
					val = execStatements(stmt.body, env);
				}
				return val;

			case 'define':
				var body = function(){
					var innerEnv = { bindings: {}, _outer: env };
					for (var i = 0, l = stmt.args.length, al = arguments.length; i < l; ++i) {
						innerEnv.bindings[stmt.args[i].name] = i < al ? arguments[i] : stmt.args[i].value;
					}
					return execStatements(stmt.body, innerEnv);
				};
				add_binding(env, stmt.name, body);
				return 0;

		}

		throw new Error('Undefined opcode: '+stmt.tag);
	};

	var execStatements = function(stmts, env) {
		var val = undefined;
		for (var i = 0, l = stmts.length; i < l; ++i) {
			var tmp = execStatement(stmts[i], env);
			if (typeof tmp !== 'undefined') val = tmp;
		}
		return val;
	};

	var eval = function(str, env) {
		var program = parser.parse(str), initialEnv = env || {};
		if (typeof initialEnv.bindings != 'object') {
			initialEnv.bindings = {};
		}
		if (typeof initialEnv._outer == 'undefined') {
			initialEnv._outer = null;
		}
		//add_binding(initialEnv, 'log', function(){ console.log.apply(console, arguments); });
		return execStatements(program, initialEnv);
	};

	x.eval = eval;
	x.parse = function(){ return parser.parse.apply(parser, arguments); };
	x.add_binding = add_binding;

})(typeof module == 'undefined' ? this.tortoise : module.exports);
