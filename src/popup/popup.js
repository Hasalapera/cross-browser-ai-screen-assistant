/*
 * Purpose: Toolbar popup UI. Shows the current assistant state, lets the user
 * explicitly activate or deactivate it, and reflects state changes broadcast by
 * the background context. Uses only the runtime messaging API and the shared
 * state model (FR-002, FR-003, NFR-007).
 */
(function (root) {
  "use strict";

  var CBASA = root.CBASA;
  var api = CBASA.browserApi.getApi();
  var doc = root.document;
  var TYPES = CBASA.messages.TYPES;

  function el(id) {
    return doc && doc.getElementById ? doc.getElementById(id) : null;
  }

  function render(isActive) {
    var stateEl = el("state");
    var toggleEl = el("toggle");
    if (stateEl) {
      stateEl.textContent = isActive ? "Active" : "Inactive";
    }
    if (toggleEl) {
      toggleEl.textContent = isActive ? "Deactivate" : "Activate";
      toggleEl.setAttribute("aria-pressed", isActive ? "true" : "false");
    }
  }

  function send(message) {
    if (!api || !api.runtime || typeof api.runtime.sendMessage !== "function") {
      return null;
    }
    try {
      return api.runtime.sendMessage(message);
    } catch (_ignore) {
      return null;
    }
  }

  function applyReply(reply) {
    if (reply && typeof reply === "object") {
      render(reply.active === true);
    }
  }

  function sendAndApply(message) {
    var reply = send(message);
    if (reply && typeof reply.then === "function") {
      reply.then(applyReply).catch(function () {});
    } else {
      applyReply(reply);
    }
  }

  function onToggle() {
    var toggleEl = el("toggle");
    var isActive = toggleEl && toggleEl.getAttribute("aria-pressed") === "true";
    sendAndApply({ type: TYPES.SET_ACTIVE, payload: { active: !isActive } });
  }

  function init() {
    var toggleEl = el("toggle");
    if (toggleEl && typeof toggleEl.addEventListener === "function") {
      toggleEl.addEventListener("click", onToggle);
    }
    if (api && api.runtime && api.runtime.onMessage) {
      api.runtime.onMessage.addListener(function (message) {
        var result = CBASA.messages.validateMessage(message);
        if (result.ok && result.type === TYPES.STATE_CHANGED) {
          render(result.payload.active === true);
        }
        return undefined;
      });
    }
    sendAndApply({ type: TYPES.GET_STATE });
  }

  if (doc && doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
