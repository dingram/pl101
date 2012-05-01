var Keyboard = function(cvs) {
	if (!this) return new Keyboard(cvs);
	this.cvs = cvs;
	this.ctx = cvs.getContext('2d');
};

Keyboard.prototype.draw = function() {
	this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);

	for (var i = 0; i < 10; ++i) {
		this.drawOctave(i, 5, this.cvs.height - 45, (i==4)?'#ff9':'#fff', (i==4)?'#111':'#000');
	}
};

Keyboard.prototype.positionFromPitch = function(pitch, forDroplets) {
	var midi_letter_pitches = { a:21, b:23, c:12, d:14, e:16, f:17, g:19 };

	var matches = /([a-g])(#+|b+)?([0-9]+)$/i.exec(pitch);
	var note = matches[1].toLowerCase(), accidental = matches[2] || '', octave = parseInt(matches[3], 10);
	midipitch = (12 * octave) + midi_letter_pitches[note] + (accidental.substr(0,1)=='#'?1:-1) * accidental.length;

	var notenum = (midipitch % 12);
	var blacknote = (notenum in {1:true, 3:true, 6:true, 8:true, 10:true});
	var x, w;

	if (blacknote) {
		notenum = Math.floor(notenum / 2);
		x = 9 + (14 * notenum);
		w = 8;
	} else {
		notenum = Math.floor(notenum / 2) + (notenum > 4 ? 1 : 0);
		x = (14 * notenum);
		w = 14;
	}

	if (forDroplets) {
		w -= 2;
		x += 1;
	}

	x += (98 * octave);

	return {x: x, w: w};
};

Keyboard.prototype.drawPitchHighlight = function(x, y, pitch, fill) {
	var pos = this.positionFromPitch(pitch);
	this.drawKeyHighlight(x + pos.x, y, pos.w, fill);
}

Keyboard.prototype.drawKeyHighlight = function(x, y, w, fill) {
	this.ctx.lineWidth = 1;
	this.ctx.lineJoin = 'round';

	this.ctx.fillStyle = fill;

	this.ctx.beginPath();
	this.ctx.rect(x, y, w, 65);
	this.ctx.fill();
}

Keyboard.prototype.drawOctave = function(octave, x, y, whiteFill, blackFill) {
	this.ctx.lineWidth = 1;
	this.ctx.lineJoin = 'round';

	this.ctx.strokeStyle = '#000000';
	this.ctx.fillStyle = whiteFill;

	this.ctx.beginPath();
	for (var i = 0; i < 7; ++i) {
		this.ctx.rect(x + (14*i) + (98*octave), y, 14, 45);
	}
	this.ctx.fill();
	this.ctx.stroke();

	this.ctx.fillStyle = blackFill;

	this.ctx.beginPath();
	for (var i = 0; i < 6; ++i) {
		if (i == 2) continue;
		this.ctx.rect(x+ 9 + (14*i) + (98*octave), y, 10, 28);
	}
	this.ctx.fill();
};
