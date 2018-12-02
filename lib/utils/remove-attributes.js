/**
 * Utility to remove specific attributes from all
 * child nodes of a given node.
 */
module.exports = function(el, attrs) {
  let localAttrs = attrs;

  if (localAttrs === true) {
    localAttrs = ['style'];
  }

  if (!localAttrs || !localAttrs.length) {
    return el;
  }

  let els = el.find('*');

  els.each((i, el) => (
    localAttrs.forEach(attr => els.eq(i).removeAttr(attr))
  ));

  return el;
}
