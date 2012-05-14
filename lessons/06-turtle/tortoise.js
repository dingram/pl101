(function(x){

	var parser = require('./tortoise-parser');

	var evalExpr = function(expr, env) {
		if (typeof expr == 'number') {
			return expr;
		}
		switch (expr.tag) {
			case '+': return evalExpr(expr.left, env) + evalExpr(expr.right, env);
			case '-': return evalExpr(expr.left, env) - evalExpr(expr.right, env);
			case '*': return evalExpr(expr.left, env) * evalExpr(expr.right, env);
			case '/': return evalExpr(expr.left, env) / evalExpr(expr.right, env);
		}

		throw new Error('Undefined operation: '+expr.tag);
	};

	var execStatement = function(stmt, env) {
		return evalExpr(stmt, env);
	};

	var execStatements = function(stmts, env) {
		var val = 0;
		for (var i = 0, l = stmts.length; i < l; ++i) {
			val = execStatement(stmts[i]);
		}
		return val;
	};

	var eval = function(str) {
		var program = parser.parse(str), initialEnv = {};
		return execStatements(program, initialEnv);
	};

	x.eval = eval;
	x.parse = function(){ return parser.parse.apply(parser, arguments); };

})(typeof module == 'undefined' ? this : module.exports);
