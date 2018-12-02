/**
 * Utility for string replacement 
 */
module.exports = function(id, file, map) {
  let processed = file;

  for (let key in map) {
    processed = processed.replace(new RegExp(key, 'g'), map[key]);
  }

  return processed;
}
