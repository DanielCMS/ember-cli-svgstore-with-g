/**
 * Utility for cloning an <svg/> as a <symbol/> within
 * the composition of svgstore output.
 */
const SELECTOR_SVG = 'svg';
const TEMPLATE_SYMBOL = '<symbol/>';
const GROUP_SYMBOL = '<g/>';
const ATTRIBUTE_ID = 'id';

/**
 * @param {string} id The id to be applied to the symbol tag
 * @param {string} child An object created by loading the content of the current file via the cheerio#load function.
 * @param {object} options for parsing the svg content
 * @return {object} symbol The final cheerio-aware object created by cloning the SVG contents
 * @see <a href="https://github.com/cheeriojs/cheerio">The Cheerio Project</a>
 */
module.exports = function(id, child, options) {
  let svgElem = child(SELECTOR_SVG);
  let enclosingTag = options.svgstoreOpts.useGroup ? GROUP_SYMBOL : TEMPLATE_SYMBOL;
  let symbol = child(enclosingTag);

  symbol.attr(ATTRIBUTE_ID, id);
  symbol.append(svgElem.contents());

  return symbol;
}
