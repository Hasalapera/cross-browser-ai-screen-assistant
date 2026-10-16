/*
 * Purpose: Extracts and sanitises a raw selection string into a bounded, plain
 * text value. The result is always a string and is never parsed as markup or
 * code (SEC-004, SEC-005). Length is capped to bound memory use (SEC-003).
 */
(function (root) {
  "use strict";

  var CBASA = root.CBASA || (root.CBASA = {});

  var MAX_SELECTION_LENGTH = 2000;

  function sanitizeSelection(input) {
    if (typeof input !== "string") {
      return "";
    }
    var collapsed = input.replace(/\s+/g, " ").trim();
    if (collapsed.length > MAX_SELECTION_LENGTH) {
      collapsed = collapsed.slice(0, MAX_SELECTION_LENGTH);
    }
    return collapsed;
  }

  CBASA.selection = {
    MAX_SELECTION_LENGTH: MAX_SELECTION_LENGTH,
    sanitizeSelection: sanitizeSelection
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
