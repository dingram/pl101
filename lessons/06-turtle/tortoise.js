(function(x){

	var parser = require('./tortoise-parser');

	x.parse = function(){ return parser.parse.apply(parser, arguments); };

})(typeof module == 'undefined' ? this : module.exports);
