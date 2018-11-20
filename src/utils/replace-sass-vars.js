/**
 * Utility for string replacement 
 */

'use strict';

function replaceSassVars(id, file, map) {
    let processed = file;

    for (let key in map) {
        processed = processed.replace(new RegExp(key, 'g'), map[key]);
    }

    return processed;
}

module.exports = replaceSassVars;
