/*
 * Purpose: Content-script entry point. Injected only on explicit activation.
 * While active it observes the user's text selection, renders the local panel,
 * tears the panel down on deactivation, and contains every error so a failure
 * is reported to the background context rather than thrown into the host page
 * (FR-003, FR-004, NFR-005, BCR-003).
 */
(function (root) {
  "use strict";

  if (root.__CBASA_CONTENT_LOADED__) {
    return;
  }
  root.__CBASA_CONTENT_LOADED__ = true;

  var CBASA = root.CBASA;
  var doc = root.document;
  var api = CBASA.browserApi.getApi();
  var active = CBASA.state.DEFAULT_ACTIVE;
  var panel = null;

  function clearPanel() {
    if (panel && typeof panel.destroy === "function") {
      panel.destroy();
    }
    panel = null;
  }

  function reportError(stage, error) {
    if (!api || !api.runtime || typeof api.runtime.sendMessage !== "function") {
      return;
    }
    try {
      var result = api.runtime.sendMessage({
        type: CBASA.messages.TYPES.REPORT_ERROR,
        payload: {
          stage: stage,
          message: String(error && error.message ? error.message : error)
        }
      });
      if (result && typeof result.then === "function") {
        /* The background context may be gone; contain any transport rejection. */
        result.catch(function () {});
      }
    } catch (_ignore) {
      /* Error reporting is best-effort and never rethrows. */
    }
  }

  function guard(stage, fn) {
    return function () {
      try {
        return fn.apply(null, arguments);
      } catch (error) {
        reportError(stage, error);
        return undefined;
      }
    };
  }

  function currentSelection() {
    if (!doc || typeof doc.getSelection !== "function") {
      return "";
    }
    var selection = doc.getSelection();
    return selection ? CBASA.selection.sanitizeSelection(String(selection)) : "";
  }

  function onSelectionEnd() {
    if (!active) {
      return;
    }
    var text = currentSelection();
    if (!text) {
      return;
    }
    clearPanel();
    panel = CBASA.panel.createPanel(doc, text, {
      onDismiss: function () {
        panel = null;
      }
    });
  }

  function applyState(nextActive) {
    active = CBASA.state.normalizeActive(nextActive);
    if (!active) {
      clearPanel();
    }
  }

  function onMessage(message) {
    var result = CBASA.messages.validateMessage(message);
    if (!result.ok) {
      return undefined;
    }
    if (result.type === CBASA.messages.TYPES.STATE_CHANGED) {
      applyState(result.payload.active);
    } else if (result.type === CBASA.messages.TYPES.DEACTIVATE) {
      applyState(false);
    }
    return undefined;
  }

  function readInitialState() {
    if (!api || !api.runtime || typeof api.runtime.sendMessage !== "function") {
      return;
    }
    try {
      var reply = api.runtime.sendMessage({ type: CBASA.messages.TYPES.GET_STATE });
      if (reply && typeof reply.then === "function") {
        reply
          .then(function (state) {
            if (state && typeof state === "object") {
              applyState(state.active);
            }
          })
          .catch(function () {});
      } else if (reply && typeof reply === "object") {
        applyState(reply.active);
      }
    } catch (_ignore) {
      /* No background available: remain inactive rather than throw. */
    }
  }

  function start() {
    if (!doc || typeof doc.addEventListener !== "function") {
      return;
    }
    doc.addEventListener("mouseup", guard("selection", onSelectionEnd), true);
    doc.addEventListener("keyup", guard("selection", onSelectionEnd), true);
    if (api && api.runtime && api.runtime.onMessage) {
      api.runtime.onMessage.addListener(guard("message", onMessage));
    }
    readInitialState();
  }

  start();
})(typeof globalThis !== "undefined" ? globalThis : this);
