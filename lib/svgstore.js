const assign = require('object-assign');
const copyAttributes = require('./utils/copy-attributes');
const loadXml = require('./utils/load-xml');
const removeAttributes = require('./utils/remove-attributes');
const setAttributes = require('./utils/set-attributes');
const svgToSymbol = require('./utils/svg-to-symbol');
const unifyId = require('./utils/unify-id');
const replaceSassVars = require('./utils/replace-sass-vars');

const SELECTOR_SVG = 'svg';
const SELECTOR_DEFS = 'defs';

const TEMPLATE_SVG = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs/></svg>';
const TEMPLATE_DOCTYPE = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

const DEFAULT_OPTIONS = {
  cleanDefs: false,
  cleanSymbols: false,
  inline: false,
  svgAttrs: false,
  symbolAttrs: false,
  copyAttrs: false
};

module.exports = function(options) {
  let svgstoreOptions = assign({}, DEFAULT_OPTIONS, options);
  let parent = loadXml(TEMPLATE_SVG);
  let parentSvg = parent(SELECTOR_SVG);
  let parentDefs = parent(SELECTOR_DEFS);

  return {
    element: parent,
    add(id, file, options) {
      if (svgstoreOptions.svgstoreOpts.unifyIds) {
        file = unifyId(id, file, options);
      }

      let sassVarsMap = svgstoreOptions.svgstoreOpts.sassVarsMap;

      if (sassVarsMap) {
        file = replaceSassVars(id, file, sassVarsMap);
      }

      let child = loadXml(file);
      let addOptions = assign({}, svgstoreOptions, options);
      let childDefs = child(SELECTOR_DEFS);

      removeAttributes(childDefs, addOptions.cleanDefs);
      parentDefs.append(childDefs.contents());
      childDefs.remove();

      let childSvg = child(SELECTOR_SVG);
      let childSymbol = svgToSymbol(id, child, addOptions);

      removeAttributes(childSymbol, addOptions.cleanSymbols);
      copyAttributes(childSymbol, childSvg, addOptions.copyAttrs);
      setAttributes(childSymbol, addOptions.symbolAttrs);
      parentSvg.append(childSymbol);

      return this;
    },

    toString(options) {
      // Create a clone so we don't modify the parent document.
      let clone = loadXml(parent.xml());
      let toStringOptions = assign({}, svgstoreOptions, options);
      let svg = clone(SELECTOR_SVG);

      setAttributes(svg, toStringOptions.svgAttrs);

      // output inline
      if (toStringOptions.inline) {
          return clone.xml();
      }

      // output standalone
      svg.attr('xmlns', function (val) {
          return val || 'http://www.w3.org/2000/svg';
      });

      svg.attr('xmlns:xlink', function (val) {
          return val || 'http://www.w3.org/1999/xlink';
      });

      return TEMPLATE_DOCTYPE + clone.xml();
    }
  };
}
