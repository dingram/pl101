var LightTable = {

	quoteTreeToHtml: function(t) {
		switch (typeof t) {
			case 'number':
				return '<span class="num">'+t+'</span>';
			case 'string':
				return '<span class="">'+t+'</span>';
			default:
				var r = '(';
				for (var i = 0, l = t.length; i < l; ++i) {
					r += (i > 0 ? ' ' : '') + LightTable.quoteTreeToHtml(t[i]);
				}
				r += ')';
				return r;
		}
	},

	parseTreeToHtml: function(t, env) {
		switch (typeof t) {
			case 'number':
				return '<span class="num">'+t+'</span>';
			case 'string':
				if (t in env) {
					return '<span class="var rep var-name-'+t+'" title="'+t+'" data-varname="'+t+'">'+env[t]+'</span>';
				} else {
					return '<span class="var var-name-'+t+'" data-varname="'+t+'">'+t+'</span>';
				}
			default:
				if (t[0] == 'quote') {
					return "<span class=\"op\">'</span>" + LightTable.quoteTreeToHtml(t[1]);
				}
				// array
				var r = '(<span class="';
				switch (t[0]) {
					case '+':
					case '-':
					case '*':
					case '/':
					case '<':
					case '>':
					case '<=':
					case '>=':
					case '=':
						r += 'op';
						break;
					default:
						r += 'fn';
						break;
				}
				r += '">'+t[0]+'</span>';
				for (var i = 1, l = t.length; i < l; ++i) {
					r += ' ' + LightTable.parseTreeToHtml(t[i], env);
				}
				r += ')';

				if (t[0] == 'define' || t[0] == 'set!') {
					env[t[1]] = LightTable.parseTreeToHtml(t[2]);
				}
				return r;
		}
	},

	buildSyntaxTree: function(output, parsed) {
		output.html(LightTable.parseTreeToHtml(parsed, {}));
	}

};
