/*
 * Purpose: Background coordination layer. Owns the assistant activation state,
 * persists the minimal preference using browser storage, answers state queries,
 * injects the content script on explicit activation, and broadcasts state
 * changes to content scripts. All browser access is feature-detected so a
 * missing API degrades instead of throwing (FR-003, FR-010, BCR-003).
 */
(function (root) {
  "use strict";

  var CBASA = root.CBASA;
  var api = CBASA.browserApi.getApi();
  var TYPES = CBASA.messages.TYPES;
  var STORAGE_KEY = CBASA.state.STORAGE_KEY;
  var active = CBASA.state.DEFAULT_ACTIVE;

  function storageArea() {
    if (api && api.storage && api.storage.local) {
      return api.storage.local;
    }
    return null;
  }

  /*
   * Surfaces an unexpected failure in the extension's own console. The message
   * never leaves this context and never rethrows, so the host page is never
   * affected (SEC-009, NFR-005). Expected, benign conditions are filtered out by
   * the callers before reaching here.
   */
  function reportUnexpected(context, error) {
    if (root.console && typeof root.console.error === "function") {
      root.console.error("CBASA background: " + context + " failed", error);
    }
  }

  /*
   * Attaches a rejection handler to a promise-returning browser API call. The
   * Chromium promise form of `tabs.sendMessage`/`scripting.executeScript`/storage
   * rejects asynchronously, so a surrounding try/catch alone does not catch it;
   * an unhandled rejection there surfaces as "Uncaught (in promise)" in the
   * service worker. `isExpected` classifies benign failures that are handled
   * quietly; anything else is reported rather than silently swallowed.
   */
  function settle(result, context, isExpected) {
    if (result && typeof result.then === "function") {
      result.catch(function (error) {
        if (typeof isExpected !== "function" || !isExpected(error)) {
          reportUnexpected(context, error);
        }
      });
    }
    return result;
  }

  function persist() {
    var area = storageArea();
    if (area && typeof area.set === "function") {
      try {
        settle(area.set(CBASA.state.prefsToStorage(active)), "storage.set");
      } catch (error) {
        reportUnexpected("storage.set", error);
      }
    }
  }

  function broadcast() {
    if (!api || !api.tabs || typeof api.tabs.query !== "function" || !api.tabs.sendMessage) {
      return;
    }
    var deliver = function (tabs) {
      (tabs || []).forEach(function (tab) {
        if (!tab || tab.id === undefined) {
          return;
        }
        try {
          settle(
            api.tabs.sendMessage(tab.id, {
              type: TYPES.STATE_CHANGED,
              payload: { active: active }
            }),
            "tabs.sendMessage",
            CBASA.browserApi.isMissingReceiverError
          );
        } catch (error) {
          if (!CBASA.browserApi.isMissingReceiverError(error)) {
            reportUnexpected("tabs.sendMessage", error);
          }
        }
      });
    };
    try {
      var maybeTabs = api.tabs.query({});
      if (maybeTabs && typeof maybeTabs.then === "function") {
        maybeTabs.then(deliver).catch(function (error) {
          reportUnexpected("tabs.query", error);
        });
      } else if (maybeTabs) {
        deliver(maybeTabs);
      }
    } catch (error) {
      reportUnexpected("tabs.query", error);
    }
  }

  function injectIntoActiveTab() {
    if (!api || !api.tabs || typeof api.tabs.query !== "function") {
      return;
    }
    if (!api.scripting || typeof api.scripting.executeScript !== "function") {
      /* Missing scripting API: selection detection stays unavailable (BCR-003). */
      return;
    }
    var inject = function (tabs) {
      var tab = tabs && tabs[0];
      if (!tab || tab.id === undefined) {
        return;
      }
      try {
        settle(
          api.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"]
          }),
          "scripting.executeScript",
          CBASA.browserApi.isRestrictedPageError
        );
      } catch (error) {
        if (!CBASA.browserApi.isRestrictedPageError(error)) {
          reportUnexpected("scripting.executeScript", error);
        }
      }
    };
    try {
      var maybeTabs = api.tabs.query({ active: true, currentWindow: true });
      if (maybeTabs && typeof maybeTabs.then === "function") {
        maybeTabs.then(inject).catch(function (error) {
          reportUnexpected("tabs.query", error);
        });
      } else if (maybeTabs) {
        inject(maybeTabs);
      }
    } catch (error) {
      reportUnexpected("tabs.query", error);
    }
  }

  function setActive(next) {
    active = CBASA.state.normalizeActive(next);
    persist();
    if (active) {
      injectIntoActiveTab();
    }
    broadcast();
    return active;
  }

  function load() {
    var area = storageArea();
    if (!area || typeof area.get !== "function") {
      return;
    }
    var apply = function (stored) {
      active = CBASA.state.prefsFromStorage(stored).active;
      broadcast();
    };
    try {
      var maybe = area.get(STORAGE_KEY);
      if (maybe && typeof maybe.then === "function") {
        maybe.then(apply).catch(function (error) {
          reportUnexpected("storage.get", error);
        });
      } else if (maybe && typeof maybe === "object") {
        apply(maybe);
      }
    } catch (error) {
      reportUnexpected("storage.get", error);
    }
  }

  function onMessage(message, sender, sendResponse) {
    var result = CBASA.messages.validateMessage(message);
    if (!result.ok) {
      return undefined;
    }
    if (result.type === TYPES.GET_STATE) {
      sendResponse({ active: active });
      return true;
    }
    if (result.type === TYPES.SET_ACTIVE) {
      setActive(result.payload.active);
      sendResponse({ active: active });
      return true;
    }
    if (result.type === TYPES.DEACTIVATE) {
      setActive(false);
      sendResponse({ active: active });
      return true;
    }
    if (result.type === TYPES.REPORT_ERROR) {
      /* Errors are contained locally; nothing is logged or transmitted. */
      return undefined;
    }
    return undefined;
  }

  if (api && api.runtime && api.runtime.onMessage) {
    api.runtime.onMessage.addListener(onMessage);
  }
  if (api && api.storage && api.storage.onChanged) {
    try {
      api.storage.onChanged.addListener(function (changes, areaName) {
        if (areaName && areaName !== "local") {
          return;
        }
        if (changes && Object.prototype.hasOwnProperty.call(changes, STORAGE_KEY)) {
          active = CBASA.state.normalizeActive(changes[STORAGE_KEY].newValue);
          broadcast();
        }
      });
    } catch (_ignore) {
      /* Degrade quietly (BCR-003). */
    }
  }
  load();
})(typeof globalThis !== "undefined" ? globalThis : this);
