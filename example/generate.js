var Styleguide = require('../lib/index.js');

new Styleguide ({
	files: {
		src: 'example/assets/css/',
		dist: 'dist',
		colors: false,
		ignore: []
	},

	components: {
		wrap: 'components/',
		extensions: 'html',
		beforeCompilation: function (str) {
			return str;
		},
		afterCompilation: function (str) {
			return str;
		},
	},

	type: 'one-page',
	layout: 'example/styleguide/layout.html',

	mdConverter: {
		heading: function (text, level) {
			var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
			var _class = 'Styleguide-title--' + level;

			return '<h' + level + ' id="' + escapedText + '" class="' + _class + '">' + text + '</h' + level + '>';
		}
	},

	silent: false
})
.generate(function () {
	console.log('✓ Styleguide generated\n');
});
