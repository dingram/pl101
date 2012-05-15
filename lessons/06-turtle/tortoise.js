(function(x){

	var parser = require('./tortoise-parser');

	var add_binding = function(env, name, value) {
		if (!env || typeof env != 'object') {
			throw new Error('Environment missing');
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
		if (typeof expr == 'number') {
			return expr;
		}
		switch (expr.tag) {
			case '+': return evalExpr(expr.left, env) + evalExpr(expr.right, env);
			case '-': return evalExpr(expr.left, env) - evalExpr(expr.right, env);
			case '*': return evalExpr(expr.left, env) * evalExpr(expr.right, env);
			case '/': return evalExpr(expr.left, env) / evalExpr(expr.right, env);
			case '%': return evalExpr(expr.left, env) % evalExpr(expr.right, env);

			case '**': return Math.pow(evalExpr(expr.left, env), evalExpr(expr.right, env));

			case '==': return evalExpr(expr.left, env) == evalExpr(expr.right, env);
			case '<':  return evalExpr(expr.left, env) <  evalExpr(expr.right, env);
			case '<=': return evalExpr(expr.left, env) <= evalExpr(expr.right, env);
			case '>=': return evalExpr(expr.left, env) >= evalExpr(expr.right, env);
			case '>':  return evalExpr(expr.left, env) >  evalExpr(expr.right, env);

			case '!':  return evalExpr(expr.expr, env) ? 0 : 1;

			case '&&': return evalExpr(expr.left, env) && evalExpr(expr.right, env) ? 1 : 0;
			case '||': return evalExpr(expr.left, env) || evalExpr(expr.right, env) ? 1 : 0;

			case 'ident': return lookup(env, expr.name);

			case 'call':
				var func = lookup(env, expr.name);
				var args = expr.args.map(evalExpr);
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
				add_binding(env, stmt.name, 0);
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
					for (var i = 0, l = stmt.args.length; i < l; ++i) {
						innerEnv.bindings[stmt.args[i]] = arguments[i];
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
		return execStatements(program, initialEnv);
	};

	x.eval = eval;
	x.parse = function(){ return parser.parse.apply(parser, arguments); };

})(typeof module == 'undefined' ? this : module.exports);
