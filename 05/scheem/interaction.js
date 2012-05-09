var t, compileAndRun = function(v) {
	var e = $('#error');
	var s = $('#preview');
	var o = $('#output');
	var p, r;

	e.hide();
	$().add(o).add(s).html('');

	if ($.trim(v) === '') {
		return;
	}

	try {
		p = SCHEEM.parse(v);
	} catch (ex) {
		e.text('Parse error: '+ex).show();
		return;
	}

	LightTable.buildSyntaxTree(s, p);

	try {
		r = evalScheem(p, {});
	} catch (ex) {
		e.text('Runtime error: '+ex).show();
		return;
	}

	if (typeof r != 'string' && typeof r != 'number') {
		r = stringify(r);
	}

	o
		//.append($('<span class="">').text($.trim(v).replace("\t", '  ')))
		.append('<span class="result"> =&gt; </span>')
		.append($('<span class="result">').text(r));

};

var editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
	theme: 'solarized',
	tabSize: 2,
	indentWithTabs: true,
	autoClearEmptyLines: true,
	matchBrackets: true,
	onChange: function(e) {
		clearTimeout(t);
		t = setTimeout(function(){compileAndRun(e.getValue());}, 500);
	}
});

$('.example').click(function(){
	clearTimeout(t);
	editor.setValue($(this).find('code').text());
	compileAndRun(editor.getValue());
});

$('.group h3').click(function(){
	$(this).closest('.group').toggleClass('hidechildren');
});

$('#preview').on('hover', '.var', function(){
	$('.var-name-'+$(this).data('varname')).toggleClass('hover');
});

