(function(x){

	var parser = require('./tortoise-parser');

	var lookup = function(env, name) {
		if (typeof env != 'object') {
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
		switch (stmt.tag) {
			case 'ignore':
				return evalExpr(stmt.body, env);
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
		return execStatements(program, initialEnv);
	};

	x.eval = eval;
	x.parse = function(){ return parser.parse.apply(parser, arguments); };

})(typeof module == 'undefined' ? this : module.exports);
