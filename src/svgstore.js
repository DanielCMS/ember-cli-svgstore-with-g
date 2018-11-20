'use strict';

var assign = require('object-assign');

var copyAttributes = require('./utils/copy-attributes');
var loadXml = require('./utils/load-xml');
var removeAttributes = require('./utils/remove-attributes');
var setAttributes = require('./utils/set-attributes');
var svgToSymbol = require('./utils/svg-to-symbol');
var unifyId = require('./utils/unify-id');
var replaceSassVars = require('./utils/replace-sass-vars');

var SELECTOR_SVG = 'svg';
var SELECTOR_DEFS = 'defs';

var TEMPLATE_SVG = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs/></svg>';
var TEMPLATE_DOCTYPE = '<?xml version="1.0" encoding="UTF-8"?>' +
	'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' +
	'"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

var DEFAULT_OPTIONS = {
	cleanDefs: false,
	cleanSymbols: false,
	inline: false,
	svgAttrs: false,
	symbolAttrs: false,
	copyAttrs: false
};

function svgstore(options) {
	var svgstoreOptions = assign({}, DEFAULT_OPTIONS, options);

	// <svg>
	var parent = loadXml(TEMPLATE_SVG);
	var parentSvg = parent(SELECTOR_SVG);
	var parentDefs = parent(SELECTOR_DEFS);

	return {
		element: parent,

		add: function (id, file, options) {
                        if (svgstoreOptions.svgstoreOpts.unifyIds) {
                            file = unifyId(id, file, options);
                        }

                        var sassVarsMap = svgstoreOptions.svgstoreOpts.sassVarsMap;

                        if (sassVarsMap) {
                            file = replaceSassVars(id, file, sassVarsMap);
                        }

			var child = loadXml(file);
			var addOptions = assign({}, svgstoreOptions, options);

			// <defs>
			var childDefs = child(SELECTOR_DEFS);

			removeAttributes(childDefs, addOptions.cleanDefs);
			parentDefs.append(childDefs.contents());
			childDefs.remove();

			// <symbol>
			var childSvg = child(SELECTOR_SVG);
			var childSymbol = svgToSymbol(id, child, addOptions);

			removeAttributes(childSymbol, addOptions.cleanSymbols);
			copyAttributes(childSymbol, childSvg, addOptions.copyAttrs);
			setAttributes(childSymbol, addOptions.symbolAttrs);
			parentSvg.append(childSymbol);

			return this;
		},

		toString: function (options) {
			// Create a clone so we don't modify the parent document.
			var clone = loadXml(parent.xml());
			var toStringOptions = assign({}, svgstoreOptions, options);

			// <svg>
			var svg = clone(SELECTOR_SVG);

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

module.exports = svgstore;
