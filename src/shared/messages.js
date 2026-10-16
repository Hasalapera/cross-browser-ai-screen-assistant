/*
 * Purpose: Defines the typed message contract between the popup, background,
 * and content contexts, and validates inbound messages before any handling.
 * Unknown or malformed messages are rejected rather than acted upon, so page
 * data is always treated as untrusted (SEC-004).
 */
(function (root) {
  "use strict";

  var CBASA = root.CBASA || (root.CBASA = {});

  var TYPES = {
    GET_STATE: "CBASA_GET_STATE",
    SET_ACTIVE: "CBASA_SET_ACTIVE",
    STATE_CHANGED: "CBASA_STATE_CHANGED",
    DEACTIVATE: "CBASA_DEACTIVATE",
    REPORT_ERROR: "CBASA_REPORT_ERROR"
  };

  var KNOWN = {};
  Object.keys(TYPES).forEach(function (key) {
    KNOWN[TYPES[key]] = true;
  });

  function isKnownType(type) {
    return typeof type === "string" && KNOWN[type] === true;
  }

  function validateMessage(message) {
    if (!message || typeof message !== "object" || Array.isArray(message)) {
      return { ok: false, error: "malformed-message" };
    }
    if (!isKnownType(message.type)) {
      return { ok: false, error: "unknown-type" };
    }
    var payload = message.payload;
    if (
      payload !== undefined &&
      (typeof payload !== "object" || payload === null || Array.isArray(payload))
    ) {
      return { ok: false, error: "malformed-payload" };
    }
    return { ok: true, type: message.type, payload: payload || {} };
  }

  CBASA.messages = {
    TYPES: TYPES,
    isKnownType: isKnownType,
    validateMessage: validateMessage
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
