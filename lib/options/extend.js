/* init();
 * Extend userOpts with default ones
 * Format paths and extensions
 * Trigger Markdown Converter options */

var extend = require('extend');
var mdOpts = require('./md');
var UtilsOpts = require('./utils');
var _default = require('./default');

module.exports = function (userOpts) {
	this.opts = extend( true, _default, userOpts );

	this.opts.srcFolder = Utils.formatPath( this.opts.srcFolder );
	this.opts.distFolder = Utils.formatPath( this.opts.distFolder );
	this.opts.components.folder = Utils.formatPath( this.opts.components.folder );

	this.opts.components.filesExtension = Utils.formatExtension( this.opts.components.filesExtension );

	mdOpts(this);
};
