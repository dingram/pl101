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

			case '==': return evalExpr(expr.left, env) == evalExpr(expr.right, env);
			case '<':  return evalExpr(expr.left, env) <  evalExpr(expr.right, env);
			case '<=': return evalExpr(expr.left, env) <= evalExpr(expr.right, env);
			case '>=': return evalExpr(expr.left, env) >= evalExpr(expr.right, env);
			case '>':  return evalExpr(expr.left, env) >  evalExpr(expr.right, env);

			case 'ident': return lookup(env, expr.name);
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
					val = execStatements(stmt.body, env);
				}
				return val;
		}

		throw new Error('Undefined opcode: '+stmt.tag);
	};

	var execStatements = function(stmts, env) {
		var val = 0;
		for (var i = 0, l = stmts.length; i < l; ++i) {
			val = execStatement(stmts[i], env);
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
