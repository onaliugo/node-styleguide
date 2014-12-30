var fs = require('fs');
var glob = require('glob');
var mdConvert = require('marked');
var Utils = require('./utils.js');
var extend = require('extend');

var defaultOptions = {
  srcFolder: 'example/assets/css/',
  distFolder: 'example/styleguide/',
  components: {
    folder: 'components/',
    filesExtension: 'html',
    beforeCompilation: function( MardowknStr ) { return MardowknStr; },
    afterCompilation:  function( HtmlStr ) { return HtmlStr; }
  },
  onePage: {
    active: false,
    layout: 'example/styleguide/layout.html',
    contentStr: '<!-- %onePage-data -->'
  }
};



/* Markdown converter options
 * Wrap each <code> into a <pre>
 * Add a language-related class on the <pre> tag
 * Replace '<' and '>' html entities */

var mdRenderer = new mdConvert.Renderer();

mdRenderer.code = function (code, language) {
  code = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return  '<pre class="code' + (language ? ' language-' + language : '') +'">' +
  '<code>' + code + '</code>' +
  '</pre>';
};

mdConvert.setOptions({
  renderer: mdRenderer,
  gfm: true,
  breaks: true,
  smartLists: true
});



/* Extend utils functions
 * getMd, getHtml, eachInGlob */

var u = new Utils;

u.addFunc({
  name: 'getMd',
  content: function( fn, str ){
    return fn ? fn(str) : str;
  }
});

u.addFunc({
  name: 'getHtml',
  content: function( fn, mdStr ){
    var html = mdConvert(mdStr);
    return fn ? fn(html) : html;
  }
});

u.addFunc({
  name: 'eachInGlob',
  content: function (path, cb) {
    return glob.sync(path);
    if(cb) cb( path );
  }
});



/* Styleguide Class
 * On new instance, set options */

function Styleguide (userOpts) {
  this.options = {};
  this.defaultOptions = defaultOptions;

  if (!userOpts) {
    this.options = this.defaultOptions;
    return;
  }

  this.testOptions( userOpts );
  this.options = extend(true, this.defaultOptions, userOpts);

  this.options.components.filesExtension = this.buildExtension( this.options.components.filesExtension );
  this.options.components.folder = this.buildFolderPath(this.options.components.folder);
  this.options.srcFolder = this.buildFolderPath(this.options.srcFolder);
  this.options.distFolder = this.buildFolderPath(this.options.distFolder);

  if (this.options.onePage.active) {
    this.options.onePage.content = "";
    this.options.onePage.indexPath = this.options.distFolder +  'index.html';
  }
};



/* testOptions()
 * For each option passed by user, test typeof
 * if it's a function, also test value */

Styleguide.prototype.testOptions = function (newObj) {
  var self = this;
  var defaultOptions = this.defaultOptions;

  for (var optionName in newObj) {
    var newValue = newObj[ optionName ];

    if (typeof newObj[ optionName ] === 'object') {
      for (var subOption in newObj[ optionName ] ) {
        u.checkVal( newValue[ subOption ], typeof defaultOptions[ optionName ][ subOption ], subOption);

        if (typeof newValue[ subOption ] === 'function'){
          u.checkFunction( newValue[ subOption ], 'arg', 'string', subOption);
        }
      }
    }
    else {
      u.checkVal( newValue, typeof defaultOptions[ optionName ], optionName);

      if (typeof newValue === 'function'){
        u.checkFunction( newValue, 'arg', 'string', optionName);
      }
    }
  }
};



/* convertMdFile()
 * Update Markdown str with options.beforeCompilation
 * Return html string */

Styleguide.prototype.convertMd = function (content) {
  var newContent = u.getMd( this.options.components.beforeCompilation, content );
  var html = u.getHtml( this.options.components.afterCompilation, newContent );

  return html;
};



/* createDistFile()
 * Create file's path and name
 * Create file */

Styleguide.prototype.createDistFile = function (MdFilePath, htmlStr) {
  var pathArray = MdFilePath.split( '/' );
  var fileName = pathArray[ pathArray.length - 1 ].replace( '.md', this.options.components.filesExtension );
  var filePath = this.options.distFolder + this.options.components.folder + fileName;

  u.createFile( filePath, htmlStr );
};



/* buildExtension()
* Add '.' if not at the begin of a string */

Styleguide.prototype.buildExtension = function (ext) {
  return ext.charAt( 0 ) !== '.' ? '.' + ext : ext;
};



/* buildExtension()
* Add '.' if not at the begin of a string */

Styleguide.prototype.buildFolderPath = function (path) {
  return path.charAt( path.length - 1 ) !== '/' ? path + '/' : path;
};



/* onePageGenerateIndex()
 * Read layout file
 * Replace contentStr with generated content */

Styleguide.prototype.onePageGenerateIndex = function () {
  var layoutStr = u.readFile( this.options.onePage.layout );

  layoutStr = layoutStr.replace( this.options.onePage.contentStr, this.options.onePage.content );
  u.createFile( this.options.onePage.indexPath, layoutStr );
};



/* Generate()
* Clear components folder if onePage isn't active
* For each .md files into srcFolder,
* convert it and create dest file */

Styleguide.prototype.generate = function () {
  var self = this;
  var files = u.eachInGlob( this.options.srcFolder + '**/*.md' );
  var onePage = this.options.onePage.active;

  if (onePage) {
    u.suppr( this.options.onePage.indexPath );
    u.suppr( this.options.distFolder + this.options.components.folder );
  }
  else {
    u.clearFolder( this.options.distFolder + this.options.components.folder );
  }

  files.forEach( function( path ){
    var mdContent = u.readFile( path );
    var htmlContent = self.convertMd( mdContent );

    if (onePage) {
      self.options.onePage.content += htmlContent;
    }
    else {
      self.createDistFile( path, htmlContent );
    }
  });

  if (onePage) {
    this.onePageGenerateIndex();
  }
};



module.exports = Styleguide;
