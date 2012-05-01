var Keyboard = function(cvs) {
	if (!this) return new Keyboard(cvs);
	this.cvs = cvs;
	this.ctx = cvs.getContext('2d');
};

Keyboard.prototype.draw = function() {
	this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height);

	for (var i = 0; i < 10; ++i) {
		this.drawOctave(5 + 98*i, this.cvs.height - 45, (i==4)?'#ff9':'#fff', (i==4)?'#111':'#000');
	}
};

Keyboard.prototype.drawOctave = function(x, y, whiteFill, blackFill) {
	this.ctx.lineWidth = 1;
	this.ctx.lineJoin = 'round';

	this.ctx.strokeStyle = '#000000';
	this.ctx.fillStyle = whiteFill;

	this.ctx.beginPath();
	for (var i = 0; i < 7; ++i) {
		this.ctx.rect(x + (14*i), y, 14, 45);
	}
	this.ctx.fill();
	this.ctx.stroke();

	this.ctx.fillStyle = blackFill;

	this.ctx.beginPath();
	for (var i = 0; i < 6; ++i) {
		if (i == 2) continue;
		this.ctx.rect(x+ 9 + (14*i), y, 10, 28);
	}
	this.ctx.fill();
};
