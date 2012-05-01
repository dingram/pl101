var $kbd = $('#keyboard');
$kbd
	.prop('width', $kbd.width())
	.prop('height', $kbd.height());

var $pvw = $('#music-preview');
$pvw
	.prop('width', $pvw.width())
	.prop('height', $pvw.height());


var kbd = new Keyboard($kbd[0]);
kbd.draw();

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
		p = MUS.parse(v);
	} catch (ex) {
		e.text(
			'Parse error: Found "'+ex.found+'" at line '+ex.line+', col '+ex.offset+'. Expected: '+ex.expected.join(', ')
		).show();
		return;
	}

	try {
		//r = evalScheem(p, {});
	} catch (ex) {
		e.text('Runtime error: '+ex).show();
		return;
	}

	if (typeof r != 'string' && typeof r != 'number') {
		r = JSON.stringify(r);
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

$('#preview').on('hover', '.var', function(){
	$('.var-name-'+$(this).data('varname')).toggleClass('hover');
});

