var Sthesia = {

	Keyboard: function(cvs) {
		if (!this) return new Sthesia.Keyboard(cvs);
		this.cvs = cvs;
		this.ctx = cvs.getContext('2d');
	}

};

Sthesia.ensureNumericPitch = function(pitch) {
	var midi_letter_pitches = { a:21, b:23, c:12, d:14, e:16, f:17, g:19 };
	var midipitch;

	if (typeof pitch === 'number' || !/[^0-9]/.test(pitch)) {
		return parseInt(pitch, 10);
	}

	var matches = /([a-g])(#+|b+)?([0-9]+)$/i.exec(pitch);
	var note = matches[1].toLowerCase(), accidental = matches[2] || '', octave = parseInt(matches[3], 10);
	return (12 * octave) + midi_letter_pitches[note] + (accidental.substr(0,1)=='#'?1:-1) * accidental.length;
};

Sthesia.keyPositionFromPitch = function(pitch, forDroplets) {
	var midipitch = Sthesia.ensureNumericPitch(pitch);
	var octave = Math.floor(midipitch / 12) - 1;
	var notenum = (midipitch % 12);
	var blacknote = (notenum in {1:true, 3:true, 6:true, 8:true, 10:true});
	var x, y, w, h;

	if (blacknote) {
		notenum = Math.floor(notenum / 2);
		x = 9 + (14 * notenum);
		w = 10;
		h = 28;
	} else {
		notenum = Math.floor(notenum / 2) + (notenum > 4 ? 1 : 0);
		x = (14 * notenum);
		w = 14;
		h = 45;
	}

	if (forDroplets) {
		w -= 2;
		x += 1;
	}

	x += (98 * octave);

	return {x: x, y: y, w: w, h: h};
};

Sthesia.Keyboard.prototype.draw = function(fill) {
	if (fill === undefined || fill === null) fill = true;

	if (fill) {
		this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
	}

	for (var i = 0; i < 10; ++i) {
		this.drawOctave(i, 5, this.cvs.height - 45, fill ? ((i==4)?'#ff9':'#fff') : null, fill ? ((i==4)?'#111':'#000') : null);
	}
};

Sthesia.Keyboard.prototype.drawPitchDroplet = function(x, y, pitch, dur, fill) {
	var pos = Sthesia.keyPositionFromPitch(pitch, true);
	this.drawDropletHighlight(x + pos.x, y, pos.w, Math.floor(dur/10), fill);
}

Sthesia.Keyboard.prototype.drawPitchHighlight = function(x, y, pitch, fill) {
	var pos = Sthesia.keyPositionFromPitch(pitch);
	this.drawKeyHighlight(x + pos.x, y, pos.w, pos.h, fill);
}

Sthesia.Keyboard.prototype.drawDropletHighlight = function(x, y, w, h, fill) {
	this.ctx.lineWidth = 1;
	this.ctx.lineJoin = 'round';

	this.ctx.strokeStyle = 'rgba(0,0,0,0.3)';
	this.ctx.fillStyle = fill;

	this.ctx.beginPath();
	this.ctx.rect(x, y, w, h);
	this.ctx.fill();
	this.ctx.stroke();
}

Sthesia.Keyboard.prototype.drawKeyHighlight = function(x, y, w, h, fill) {
	this.ctx.lineWidth = 1;
	this.ctx.lineJoin = 'round';

	this.ctx.fillStyle = fill;

	this.ctx.beginPath();
	this.ctx.rect(x, y, w, h);
	this.ctx.fill();
}

Sthesia.Keyboard.prototype.drawOctave = function(octave, x, y, whiteFill, blackFill) {
	var whiteKeyWidth = 14;
	var whiteKeyHeight = 45;
	var blackKeyWidth = 10;
	var blackKeyHeight = 28;

	var startX = x + (7 * whiteKeyWidth * octave);

	this.ctx.lineWidth = 1;
	this.ctx.lineJoin = 'round';

	// draw the white keys
	this.ctx.strokeStyle = '#000000';
	if (whiteFill) {
		this.ctx.fillStyle = whiteFill;
		this.ctx.beginPath();
		this.ctx.rect(startX, y, (7 * whiteKeyWidth), whiteKeyHeight);
		this.ctx.fill();
	}

	this.ctx.beginPath();

	for (var i = 0; i < 7; ++i) {
		this.ctx.moveTo(startX + (i * whiteKeyWidth), y + ((i==0 || i==3) ? 0 : blackKeyHeight));
		this.ctx.lineTo(startX + (i * whiteKeyWidth), y + whiteKeyHeight);
		this.ctx.lineTo(startX + ((i+1) * whiteKeyWidth), y + whiteKeyHeight);
	}
	this.ctx[octave == 9 ? 'lineTo' : 'moveTo'](startX + (7 * whiteKeyWidth), y + 0);
	this.ctx.lineTo(startX, y);

	this.ctx.stroke();

	// draw the black keys
	if (blackFill) {
		this.ctx.fillStyle = blackFill;
	}

	this.ctx.beginPath();
	for (var i = 0; i < 6; ++i) {
		if (i == 2) continue;
		this.ctx.rect(x + whiteKeyWidth - (blackFill ? 5 : 4) + (i * whiteKeyWidth) + (7 * whiteKeyWidth * octave), y, blackKeyWidth - (blackFill ? 0 : 2), blackKeyHeight);
	}

	if (blackFill) {
		this.ctx.fill();
	} else {
		this.ctx.stroke();
	}
};
