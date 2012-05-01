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
kbd.drawPitchHighlight(5, 0, 'c4', '#f00');
kbd.drawPitchHighlight(5, 0, 'd4', '#f70');
kbd.drawPitchHighlight(5, 0, 'e4', '#ff0');
kbd.drawPitchHighlight(5, 0, 'f4', '#0f0');
kbd.drawPitchHighlight(5, 0, 'g4', '#0ff');
kbd.drawPitchHighlight(5, 0, 'a4', '#00f');
kbd.drawPitchHighlight(5, 0, 'b4', '#f0f');
kbd.drawPitchHighlight(5, -20, 'c#4', '#000');
kbd.drawPitchHighlight(5, -20, 'd#4', '#000');
kbd.drawPitchHighlight(5, -20, 'f#4', '#000');
kbd.drawPitchHighlight(5, -20, 'g#4', '#000');
kbd.drawPitchHighlight(5, -20, 'a#4', '#000');

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

