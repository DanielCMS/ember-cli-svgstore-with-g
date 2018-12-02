const fs = require('fs');
const makeArray = require('make-array');
const objectAssign = require('object-assign');
const path = require('path');
const mkdirp = require('mkdirp');
const CachingWriter = require('broccoli-caching-writer');
const helpers = require('broccoli-kitchen-sink-helpers');
const svgstore = require('./svgstore');

const defaultSettings = {
  outputFile: '/images.svg',
  annotation: 'SVGStore Processor',
  svgstoreOpts: {},
};

function SvgProcessor(_inputNode, _options) {
  const options = objectAssign({}, defaultSettings, _options);

  this._name = options.name || (
    (this.constructor && this.constructor.name) ? this.constructor.name : 'SVGStore'
  );
  this._annotation = options.annotation;
  this._options = options;

  let inputNodes = makeArray(_inputNode);

  CachingWriter.call(this, inputNodes, this._options);
}

SvgProcessor.prototype = Object.create(CachingWriter.prototype);
SvgProcessor.prototype.constructor = SvgProcessor;
SvgProcessor.prototype.description = 'svgstore';

/**
 * Overrides broccoli-plugin's `build' function.
 * @see: https://github.com/broccolijs/broccoli-plugin#pluginprototypebuild
 */
SvgProcessor.prototype.build = function() {
  const svgOutput = svgstore(this._options.svgstoreOpts);
  const fileSettings = this._options.fileSettings || {};

  for (let srcDir of this.inputPaths) {
    let inputFiles = helpers.multiGlob(["**/*.svg"], { cwd: srcDir });

    for (let inputFileName of inputFiles) {
      let inputFilePath = path.join(srcDir, inputFileName);
      let stat = fs.statSync(inputFilePath);

      if (stat && stat.isFile()) {
        let fileNameWithoutExtension = inputFileName.replace(/\.[^\.]+$/, '');
        let fileContents = fs.readFileSync(inputFilePath, { encoding: 'utf8' });
        let inputFileSettings = fileSettings[fileNameWithoutExtension] || {};
        let svgId = inputFileSettings.id || fileNameWithoutExtension;
        let fileSVGStoreOpts = inputFileSettings.svgstoreOpts || {};

        svgOutput.add(svgId, fileContents, fileSVGStoreOpts);
      }
    }
  }

  let outputDestination = path.join(this.outputPath, this._options.outputFile);

  mkdirp.sync(path.dirname(outputDestination));

  return fs.writeFileSync(outputDestination, svgOutput.toString());
};

module.exports = SvgProcessor;
