/**
 * Utility to copy specific attributes from one node to another.
 */
const makeArray = require("make-array");
const ALWAYS_COPY_ATTRS = [
  'viewBox',
  'aria-labelledby',
  'role',
];

module.exports = function(a, b, attrs) {
  let attrsToCopy = ALWAYS_COPY_ATTRS.concat(makeArray(attrs));
  let copiedAttrs = {};

  attrsToCopy.forEach(attr => {
    if (!attr || copiedAttrs[attr]) {
      return;
    }

    copiedAttrs[attr] = true;

    let bAttr = b.attr(attr);

    if (bAttr !== null) {
      a.attr(attr, b.attr(attr));
    }
  });

  return a;
}
