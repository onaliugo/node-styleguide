module.exports = {
	files: {
		src: 'assets/css/',
		dist: 'dist',
		colors: false,
		ignore: []
	},

	components: {
		wrap: 'components/',
		extension: 'html',
		beforeCompilation: function (str) {
			return str;
		},
		afterCompilation: function (str) {
			return str;
		}
	},

	type: 'components',

	onepage: {
		layout: 'styleguide-layout.html',
		stylesheets: []
	},

	mdConverter: {
		heading: function (text, level) {
			var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
			var _class = 'Styleguide-title--' + level;

			return '<h' + level + ' id="' + escapedText + '" class="' + _class + '">' + text + '</h' + level + '>';
		}
	},

	silent: false
};
