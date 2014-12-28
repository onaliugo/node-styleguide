var fs = require('fs');
var del = require('del');
var mkdirp = require('mkdirp');
var mdConvert = require('marked');

var mdRenderer = new mdConvert.Renderer();

// First level code blocks
// Wrap inside of <pre><code>/<code></pre> insteaf of just <code></code>
// Replace < and > by their html entity
// Add a language-related class on the <pre> tag
mdRenderer.code = function (code, language) {
	code = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
	return 	'<pre class="code' + (language ? ' language-' + language : '') +'">' +
	'<code>' + code + '</code>' +
	'</pre>';
};

mdConvert.setOptions({
	renderer: mdRenderer,
	gfm: true,
	breaks: true,
	smartLists: true
});

var tools = {
	test: {
		compilationFn: function(fn, fnName, args){
			if(typeof fn !== 'function')
				throw new Error(fnName + ' is not a function');
			else if(typeof fn(args ? args : null) !== 'string')
				throw new Error(fnName + ' must return a string');
				return fn;
		},
		val: function(content, type, name){
			if(typeof content !== type)
				throw new Error(name + ' must return a ' + type);
		}
	}, // test

	get: {
		Markdown: function(param, MdStr){
			if(!param)
				return MdStr;

			tools.test.compilationFn(param, 'beforeCompilation', MdStr);
			return param(MdStr);
		},
		Html: function(param, MdStr){
			var htmlStr = mdConvert(MdStr);

			if(!param)
				return htmlStr;

			tools.test.compilationFn(param, 'afterCompilation', htmlStr);
			return param(htmlStr);
		},
		fileExtension: function(param){
			if(param){
				tools.test.val(param, 'string', 'distFilesExtensions');
				return param.charAt(0) !== '.' ? '.' + param : param;
			}
			return '.html';
		}
	}, // get

	create: {
		folder: function(folderPath, cb){
			mkdirp(folderPath, function(){
				console.log('$ create folder:', folderPath, ': OK');
				if(cb) cb();
			});
		},
		file: function(filePath, html){
			fs.writeFile(filePath, html, function(){
				console.log('$ generate:', filePath, ': OK');
			});
		}
	}, // create

	update: {
		file: function(filePath, html){
			fs.appendFile(filePath, html, function(){
				console.log('$ update:', filePath, ': OK');
			})
		}
	},

	delete: {
		folder: function(path, cb){
			try { del(path, cb); }
			catch(e) { console.log(e); }
		}
	} // delete
};

module.exports = tools;
