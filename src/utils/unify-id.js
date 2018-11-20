/**
 * Utility for making ids of the input symbol unique
 */

'use strict';

var SELECTOR_SVG = 'svg';
var TEMPLATE_SYMBOL = '<symbol/>';
var GROUP_SYMBOL = '<g/>';
var ATTRIBUTE_ID = 'id';
var loadXml = require('./load-xml');

function unifyId(id, file, options) {
        var processed = file;
        var child = loadXml(file);
        var tagsWithId = child('[id]');
        var oldIdArray = [];
        var newIdArray = [];
        var oldId;
        var newId;
        var tag;
        var i;

        for (i = 0; i < tagsWithId.length; i++) {
            tag = tagsWithId.slice(i, i+1);
            oldId = tag.attr('id');
            newId = oldId + '_' + id;
            tag.attr('id', newId);
            oldIdArray.push(oldId);
            newIdArray.push(newId);
        }

        processed = child.xml();

        for (i = 0; i < tagsWithId.length; i++) {
            oldId = oldIdArray[i];
            newId = newIdArray[i];

            processed = processed.replace(new RegExp('#' + oldId, 'g'), '#' + newId);
        }

	return processed;
}

module.exports = unifyId;
