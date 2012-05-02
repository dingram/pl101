var Sthesia = {

	offsetX: 5,
	whiteKeyWidth: 14,
	whiteKeyHeight: 45,
	blackKeyWidth: 10,
	blackKeyHeight: 28,

	Keyboard: function(cvs) {
		if (!this) return new Sthesia.Keyboard(cvs);
		this.cvs = cvs;
		this.ctx = cvs.getContext('2d');
	},

	Droplets: function(cvs) {
		if (!this) return new Sthesia.Droplets(cvs);
		this.cvs = cvs;
		this.ctx = cvs.getContext('2d');
		this.clear();
	},

	play_timer: null,
	play: function(kbd, pvw) {
		clearTimeout(Sthesia.play_timer);
		pvw.cvs.parentNode.scrollTop = pvw.cvs.height;
		Sthesia.play_timer = setTimeout(Sthesia.animateFrame, 10, kbd, pvw);
	},

	animateFrame: function(kbd, pvw) {
		pvw.cvs.parentNode.scrollTop -= 1;
		if (pvw.cvs.parentNode.scrollTop > 0) {
			Sthesia.play_timer = setTimeout(Sthesia.animateFrame, 10, kbd, pvw);
		}
	}

};

/* ************************************************************************
 * Shared functions                                                       *
 ************************************************************************ */

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
		x = 9 + (Sthesia.whiteKeyWidth * notenum);
		w = Sthesia.blackKeyWidth;
		h = Sthesia.blackKeyHeight;
	} else {
		notenum = Math.floor(notenum / 2) + (notenum > 4 ? 1 : 0);
		x = (Sthesia.whiteKeyWidth * notenum);
		w = Sthesia.whiteKeyWidth;
		h = Sthesia.whiteKeyHeight;
	}

	if (forDroplets) {
		w -= 2;
		x += 1;
	}

	x += (7 * Sthesia.whiteKeyWidth * octave);

	return {x: x, y: y, w: w, h: h};
};

/* ************************************************************************
 * Keyboard library                                                       *
 ************************************************************************ */

Sthesia.Keyboard.prototype.draw = function(fill) {
	if (fill === undefined || fill === null) fill = true;

	if (fill) {
		this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);
	}

	for (var i = 0; i < 10; ++i) {
		this.drawOctave(i, Sthesia.offsetX, this.cvs.height - Sthesia.whiteKeyHeight, fill ? ((i==4)?'#ff9':'#fff') : null, fill ? ((i==4)?'#111':'#000') : null);
	}
};

Sthesia.Keyboard.prototype.drawPitchHighlight = function(x, y, pitch, fill) {
	var pos = Sthesia.keyPositionFromPitch(pitch);
	this.drawKeyHighlight(x + pos.x, y, pos.w, pos.h, fill);
};

Sthesia.Keyboard.prototype.drawKeyHighlight = function(x, y, w, h, fill) {
	this.ctx.lineWidth = 1;
	this.ctx.lineJoin = 'round';

	this.ctx.fillStyle = fill;

	this.ctx.beginPath();
	this.ctx.rect(x, y, w, h);
	this.ctx.fill();
};

Sthesia.Keyboard.prototype.drawOctave = function(octave, x, y, whiteFill, blackFill) {
	var startX = x + (7 * Sthesia.whiteKeyWidth * octave);

	this.ctx.lineWidth = 1;
	this.ctx.lineJoin = 'round';

	// draw the white keys
	this.ctx.strokeStyle = '#000000';
	if (whiteFill) {
		this.ctx.fillStyle = whiteFill;
		this.ctx.beginPath();
		this.ctx.rect(startX, y, (7 * Sthesia.whiteKeyWidth), Sthesia.whiteKeyHeight);
		this.ctx.fill();
	}

	this.ctx.beginPath();

	for (var i = 0; i < 7; ++i) {
		this.ctx.moveTo(startX + (i * Sthesia.whiteKeyWidth), y + ((i==0 || i==3) ? 0 : Sthesia.blackKeyHeight));
		this.ctx.lineTo(startX + (i * Sthesia.whiteKeyWidth), y + Sthesia.whiteKeyHeight);
		this.ctx.lineTo(startX + ((i+1) * Sthesia.whiteKeyWidth), y + Sthesia.whiteKeyHeight);
	}
	this.ctx[octave == 9 ? 'lineTo' : 'moveTo'](startX + (7 * Sthesia.whiteKeyWidth), y + 0);
	this.ctx.lineTo(startX, y);

	this.ctx.stroke();

	// draw the black keys
	if (blackFill) {
		this.ctx.fillStyle = blackFill;
	}

	this.ctx.beginPath();
	for (var i = 0; i < 6; ++i) {
		if (i == 2) continue;
		this.ctx.rect(x + Sthesia.whiteKeyWidth - (blackFill ? 5 : 4) + (i * Sthesia.whiteKeyWidth) + (7 * Sthesia.whiteKeyWidth * octave), y, Sthesia.blackKeyWidth - (blackFill ? 0 : 2), Sthesia.blackKeyHeight);
	}

	if (blackFill) {
		this.ctx.fill();
	} else {
		this.ctx.stroke();
	}
};


/* ************************************************************************
 * Droplets library                                                       *
 ************************************************************************ */

Sthesia.Droplets.prototype.clear = function() {
	this.droplets = [];
};

Sthesia.Droplets.prototype.add = function(pitch, start, dur, color) {
	this.droplets.push({
		pitch: pitch,
		start: start,
		dur: dur,
		color: color
	});
	// sort NOTE output in increasing order of time
	this.droplets.sort(function($a, $b) {
		return $a.start - $b.start;
	});
};

Sthesia.Droplets.prototype.draw = function(pitch, start, dur, color) {
	var lastDroplet, height;
	var magicHeight = 302;

	if (!this.droplets.length) {
		height = 16;
	} else {
		lastDroplet = this.droplets[this.droplets.length-1];
		height = Math.floor((lastDroplet.start + lastDroplet.dur) / 10) + magicHeight;
	}

	this.cvs.height = height;
	this.cvs.setAttribute('height', ""+height);
	this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);

	if (!this.droplets.length) {
		return;
	}

	this.ctx.lineWidth = 1;
	this.ctx.lineJoin = 'round';
	this.ctx.strokeStyle = 'rgba(0,0,0,0.9)';

	for (var i = 0, l = this.droplets.length; i < l; ++i) {
		var d = this.droplets[i];

		var pos = Sthesia.keyPositionFromPitch(d.pitch, true);
		pos.h = Math.floor(d.dur / 10);
		pos.y = height - Math.floor((d.dur + d.start) / 10);

		this.ctx.fillStyle = d.color;
		this.ctx.beginPath();
		this.ctx.rect(Sthesia.offsetX + pos.x, pos.y, pos.w, pos.h);
		this.ctx.fill();
		this.ctx.stroke();
	}

	this.cvs.parentNode.scrollTop = height;

};
