var Turtle = function (id) {
    var $elem = $('#' + id);
    this.paper = Raphael(id);
    this.originx = $elem.width() / 2;
    this.originy = $elem.height() / 2;
    this.clear();
};
Turtle.prototype.clear = function () {
    this.paper.clear();
    this.x = this.originx;
    this.y = this.originy;
    this.angle = 90;
    this.width = 4;
    this.opacity = 1.0;
    this.color = '#00f';
    this.pen = true;
    this.turtleimg = undefined;
    this.updateTurtle();
};
Turtle.prototype.updateTurtle = function () {
    if(this.turtleimg === undefined) {
        this.turtleimg = this.paper.image(
            "turtle2.png",
            0, 0, 64, 64);
    }
    this.turtleimg.attr({
        x: this.x - 32,
        y: this.y - 32,
        transform: "r" + (-this.angle)});
    this.turtleimg.toFront();
};
Turtle.prototype.setOpacity = function(opacity) {
    this.opacity = opacity;
};
Turtle.prototype.setWidth = function(width) {
    this.width = width;
};
Turtle.prototype.setColor = function(r, g, b) {
    this.color = Raphael.rgb(r, g, b);
};
Turtle.prototype.setPosition = function(x, y) {
    this.x = x;
    this.y = y;
    this.updateTurtle();
};
Turtle.prototype.setHeading = function(a) {
    this.angle = a;
    this.updateTurtle();
};
Turtle.prototype.drawTo = function (x, y) {
    var x1 = this.x;
    var y1 = this.y;
    var params = {
        "stroke-width": this.width,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke": this.color,
        "stroke-opacity": this.opacity
    };
    var path = this.paper.path(Raphael.format("M{0},{1}L{2},{3}",
        x1, y1, x, y)).attr(params);
};
Turtle.prototype.forward = function (d) {
    var newx = this.x + Math.cos(Raphael.rad(this.angle)) * d;
    var newy = this.y - Math.sin(Raphael.rad(this.angle)) * d;
    if(this.pen) {
        this.drawTo(newx, newy);
    }
    this.x = newx;
    this.y = newy;
    this.updateTurtle();
};
Turtle.prototype.right = function (ang) {
    this.angle -= ang;
    this.updateTurtle();
};
Turtle.prototype.left = function (ang) {
    this.angle += ang;
    this.updateTurtle();
};
Turtle.prototype.pen_up = function () {
    this.pen = false;
};
Turtle.prototype.pen_down = function () {
    this.pen = true;
};
Turtle.prototype.home = function() {
    this.setPosition(this.originx, this.originy);
};

var lsystem_expand = function(rules, axiom, iterations) {
	var current = axiom;
	for (var iteration = 0; iteration < iterations; ++iteration) {
		var next = '';
		for (var i = 0, l = current.length; i < l; ++i) {
			var c = current[i];
			var r = rules[c];
			if (typeof r == 'string') {
				next += r;
			} else if (c in rules) {
				next += c;
			} else {
				throw new Error('No such production: '+c);
			}
		}
		current = next;
	}
	return current;
};

var lsystem_draw = function(rules, axiom, iterations) {
	var expr = lsystem_expand(rules, axiom, iterations);

	for (var i = 0, l = expr.length; i < l; ++i) {
		var c = expr[i];
		var r = rules[c];
		if (!(c in rules)) {
			throw new Error('No such production: '+c);
		} else if (typeof r != 'string') {
			r();
		}
	}

	return 0;
};

$(function() {
		$('#output').css({bottom: ($('#input').height()+10)+'px'});
    var myTurtle = new Turtle("canvas");
    var env = { };
    tortoise.add_binding(env, 'forward', function(d) { myTurtle.forward(d); });
    tortoise.add_binding(env, 'right', function(a) { myTurtle.right(a); });
    tortoise.add_binding(env, 'left', function(a) { myTurtle.left(a); });
    tortoise.add_binding(env, 'home', function() { myTurtle.home(); });
    tortoise.add_binding(env, 'pen_up', function() { myTurtle.pen_up(); });
    tortoise.add_binding(env, 'pen_down', function() { myTurtle.pen_down(); });
    tortoise.add_binding(env, 'color_rgb', function(r,g,b) { myTurtle.setColor(r, g, b); });
    tortoise.add_binding(env, 'opacity', function(o) { myTurtle.setOpacity(o); });
    tortoise.add_binding(env, 'width', function(w) { myTurtle.setWidth(w); });
    tortoise.add_binding(env, 'is_string', function(x) { return (typeof x) === 'string'; });
    tortoise.add_binding(env, 'lsystem_expand', lsystem_expand);
    tortoise.add_binding(env, 'lsystem_draw', lsystem_draw);
    $('#run').click(function() {
        var user_text = $('#program').val();
				//$('#console').html('');
        myTurtle.clear();
				tortoise.eval(user_text, env);
    });

		$('li a', '#examples').click(function(e){
			var $this = $(this);
			e.preventDefault();
			$('#program').val($.trim($($this.attr('href')).html()));
			$('#run').click();
		});
});
