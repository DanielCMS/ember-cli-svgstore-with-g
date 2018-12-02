/**
 * Utility method to create an XML document object with a jQuery-like
 * interface for node manipulation.
 */
const cheerio = require('cheerio');

module.exports = text => cheerio.load(text, {
  xmlMode: true
});
