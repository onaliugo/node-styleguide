/* Markdown converter opts
 * Wrap each <code> into a <pre class=language-related>
 * Generate an example if language is not CSS or JS
 * Replace '<' and '>' html entities
 * Allow user to add options */

var hljs = require('highlight.js');
var mdConvert = require('marked');
var renderer = new mdConvert.Renderer();

mdConvert.setOptions({
	renderer: renderer,
	gfm: true,
	tables: true,
	smartLists: true
});

renderer.code = function (code, language) {
	var codeExample = '';
	var codeWrapped = '';

	if (language !== 'css' && language !== 'js')
		codeExample = code + '\n';

	code = hljs.highlightAuto(code).value;

	if (language !== 'esc')
		codeWrapped = '<pre class="code">' + '<code class="' + (language ? language : "") + '">' + code + '</code>' + '</pre>';

	return codeExample + codeWrapped;
};

module.exports = function (constructor) {
	var opts = constructor.opts.mdConverter;

	for (var opt in opts) {
		renderer[opt] = opts[opt];
	}
};
