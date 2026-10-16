/*
 * Purpose: Owns the assistant activation-preference model shared by the
 * background, popup, and content contexts. Pure, dependency-free functions so
 * the state rules are unit-testable without a browser (FR-003, FR-010).
 */
(function (root) {
  "use strict";

  var CBASA = root.CBASA || (root.CBASA = {});

  var STORAGE_KEY = "active";
  var DEFAULT_ACTIVE = false;

  function normalizeActive(value) {
    return value === true;
  }

  function prefsFromStorage(stored) {
    var record = stored && typeof stored === "object" ? stored : {};
    return { active: normalizeActive(record[STORAGE_KEY]) };
  }

  function prefsToStorage(active) {
    var record = {};
    record[STORAGE_KEY] = normalizeActive(active);
    return record;
  }

  CBASA.state = {
    STORAGE_KEY: STORAGE_KEY,
    DEFAULT_ACTIVE: DEFAULT_ACTIVE,
    normalizeActive: normalizeActive,
    prefsFromStorage: prefsFromStorage,
    prefsToStorage: prefsToStorage
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
