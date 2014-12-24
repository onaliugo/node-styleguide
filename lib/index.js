var fs = require('fs');
var glob = require('glob');
var tools = require('./tools.js');

var opts;



function whenReady(_opts){
	opts = _opts;

	tools.delete.folder(opts.componentFolder, function(){
		console.log('$ delete:', opts.componentFolder, ': OK');

		var distComponentFolder = opts.distFolder + opts.distComponentFolder;
		var fileExtension = tools.get.fileExtension(opts.distFilesExtensions);
		var indexPath = opts.componentFolder + 'index' + fileExtension;

		tools.create.folder(distComponentFolder, function(){

			// Create empty file index => Will be updated on each file creation
			tools.create.file(indexPath, '');

			// Create all files needed
			glob(opts.baseFolder + '**/*.md', function(err, files){
				console.log('$ forEach', opts.baseFolder + '**/*.md');
				files.forEach(forEachMdFiles);
			});
		});
	});
}

function forEachMdFiles(MarkdownFilePath){
	fs.readFile(MarkdownFilePath, 'utf8', function(err, originalMardown) {
		var newMarkdown = tools.get.Markdown(opts.beforeCompilation, originalMardown);
		var html = tools.get.Html(opts.afterCompilation, newMarkdown);
		var fileExtension = tools.get.fileExtension(opts.distFilesExtensions);

		var componentPath = MarkdownFilePath.replace(opts.baseFolder, '').split('/');
		var fileName = componentPath[componentPath.length -1].replace('.md', fileExtension);
		var file = fileName.split('.')[0];
		var filePath = opts.componentFolder + fileName;

		var indexPath = opts.componentFolder + 'index' + fileExtension;

		tools.create.file(filePath, html);
		tools.update.file(indexPath, '<a href="/styleguide/' + file + '">' + file.charAt(0).toUpperCase() + file.slice(1) + '</a>');
	});
}



module.exports = {
	generate: function(opts){
		tools.test.val(opts.baseFolder, 'string', 'baseFolder');
		tools.test.val(opts.distFolder, 'string', 'distFolder');
		tools.test.val(opts.distComponentFolder, 'string', 'distComponentFolder');
		tools.test.val(opts.distFilesExtensions, 'string', 'distFilesExtensions');

		opts.componentFolder = opts.distFolder + opts.distComponentFolder;

		whenReady(opts);
	}
};
