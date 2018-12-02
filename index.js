const makeArray = require('make-array');
const SVGStore = require('./lib/broccoli-svgstore');
const UnwatchedDir = require('broccoli-source').UnwatchedDir;
const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');

module.exports = {
  name: 'ember-cli-svgstore-with-g',

  options() {
    return this.app.options.svgstore || {};
  },

  treeForPublic() {
    let options = this.options();
    let trees = this._makeSvgTrees(options.files, options.svgstoreOpts);

    return this._maybeMerge(trees, 'output');
  },

  postprocessTree(type, tree) {
    if (type !== 'all') {
      return tree;
    }

    let options = this.options();
    let globalExclude = options.excludeSourceFiles;
    let target = options.files.outputFile.split("/");
    let file = target[target.length - 1].split(".svg")[0];
    let filesToKeep = makeArray(options.files.filesToKeep);

    filesToKeep = filesToKeep.map(file => file.split(".svg")[0]);

    let excludeGlobs = makeArray(this.options().files).reduce((result, fileSpec) => {
      let paths = [];

      // Remove only if the `excludeSourceFiles` option is set
      if (globalExclude || fileSpec.excludeSourceFiles) {
        // Remove sprite files from the dist if they originate in the `/public` dir
        paths = makeArray(fileSpec.sourceDirs).filter(dir => dir.match(/^public\//))
          .map(dir => (
            `${dir.replace(/^public\//, '')}/!(${file}|${filesToKeep.join("|")})*.svg`
          ));
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

  _makeSvgTrees(files, svgstoreOpts) {
    return makeArray(files)
      .map(fileSpec => new SVGStore(this._makeSourceTree(fileSpec), {
        outputFile: fileSpec.outputFile,
        svgstoreOpts: svgstoreOpts
      }));
  },

  _makeSourceTree(fileSpec) {
    let inputs = makeArray(fileSpec.sourceDirs)
      .map(directoryPath => new UnwatchedDir(directoryPath));

    return this._maybeMerge(inputs, 'sources: ' + fileSpec.outputFile);
  },

  _maybeMerge(trees, description) {
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
