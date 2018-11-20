const merge = require('merge');
const makeArray = require('make-array');
const SVGStore = require('./lib/broccoli-svgstore');
const UnwatchedDir = require('broccoli-source').UnwatchedDir;
const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');

module.exports = {
  name: 'ember-cli-svgstore',

  options() {
    return this._options = this._options || merge(true, {}, {
      files: []
    }, this.app.options.svgstore || {});
  },

  treeForPublic() {
    let options = this.options();
    let trees = this._makeSvgTrees(options.files, options.svgstoreOpts);

    return this._maybeMerge(trees, 'output');
  },

  // Remove sprite files from the dist if they originate in the `/public` dir
  postprocessTree: function(type, tree) {
    if (type !== 'all') {
      return tree;
    }

    let options = this.options();
    let globalExclude = options.excludeSourceFiles;
    let target = options.files.outputFile.split("/");
    var file = target[target.length - 1].split(".svg")[0];
    var filesToKeep = options.files.filesToKeep || [];

    filesToKeep = filesToKeep.map(file => file.split(".svg")[0]);

    var excludeGlobs = makeArray(this.options().files).reduce(function(result, fileSpec) {
      var paths = [];

      // Remove only if the `excludeSourceFiles` option is set
      if (globalExclude || fileSpec.excludeSourceFiles) {
        paths = makeArray(fileSpec.sourceDirs).filter(function(dir) {
          return dir.match(/^public\//);
        }).map(function(dir) {
          return dir.replace(/^public\//, '') + '/!(' + file + '|' + filesToKeep.join("|") + ')*.svg';
        });
      }

      return result.concat(paths);
    }, []);

    if (excludeGlobs.length) {
      tree = new Funnel(tree, {
        exclude: excludeGlobs
      });
    }

    return tree;
  },

  _makeSvgTrees: function(files, svgstoreOpts) {
    return makeArray(files).map(function(fileSpec) {
      return new SVGStore(this._makeSourceTree(fileSpec), {
        outputFile: fileSpec.outputFile,
        svgstoreOpts: svgstoreOpts
      });
    }, this);
  },

  _makeSourceTree: function(fileSpec) {
    var inputs = makeArray(fileSpec.sourceDirs).map((directoryPath) => {
      return new UnwatchedDir(directoryPath);
    });
    return this._maybeMerge(inputs, 'sources: ' + fileSpec.outputFile);
  },

  _maybeMerge: function(trees, description) {
    trees = makeArray(trees);
    if (trees.length === 1) {
      return trees[0];
    } else {
      return new MergeTrees(trees, {
        description: 'TreeMerger (SVGStore ' + description + ')'
      });
    }
  }
};
