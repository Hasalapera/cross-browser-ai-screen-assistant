/*
 * Purpose: Thin cross-browser abstraction over the extension API namespace.
 * Prefers the promise-based `browser` namespace (Firefox) and falls back to
 * `chrome` (Chromium). Feature-detects individual APIs so callers can degrade
 * gracefully (BCR-003) instead of throwing.
 */
(function (root) {
  "use strict";

  var CBASA = root.CBASA || (root.CBASA = {});

  function getApi() {
    if (root && root.browser && typeof root.browser === "object") {
      return root.browser;
    }
    if (root && root.chrome && typeof root.chrome === "object") {
      return root.chrome;
    }
    return null;
  }

  function isAvailable(feature) {
    var api = getApi();
    if (!api) {
      return false;
    }
    switch (feature) {
      case "storage":
        return !!(api.storage && api.storage.local);
      case "scripting":
        return !!(api.scripting && typeof api.scripting.executeScript === "function");
      case "tabs":
        return !!(api.tabs && typeof api.tabs.query === "function");
      case "runtime":
        return !!(api.runtime && typeof api.runtime.sendMessage === "function");
      default:
        return false;
    }
  }

  function errorMessage(error) {
    if (error && typeof error.message === "string") {
      return error.message;
    }
    if (typeof error === "string") {
      return error;
    }
    return "";
  }

  /*
   * Classifies the expected, benign transport failure raised when a message is
   * sent to a context that has no listener (e.g. a tab that never received the
   * on-demand content script). These must be handled, not surfaced as uncaught
   * errors (BCR-003, NFR-005).
   */
  function isMissingReceiverError(error) {
    var message = errorMessage(error);
    return /receiving end does not exist/i.test(message) ||
      /could not establish connection/i.test(message);
  }

  /*
   * Classifies the expected failure when script injection is attempted on a
   * page that forbids content scripts (browser-internal pages, the extension
   * gallery, PDF viewers, or pages without host access). Protected pages are
   * skipped by design (SEC-006) and are not exceptions.
   */
  function isRestrictedPageError(error) {
    var message = errorMessage(error);
    return /cannot access a chrome/i.test(message) ||
      /cannot access contents of the page/i.test(message) ||
      /cannot be scripted/i.test(message) ||
      /missing host permission/i.test(message);
  }

  CBASA.browserApi = {
    getApi: getApi,
    isAvailable: isAvailable,
    isMissingReceiverError: isMissingReceiverError,
    isRestrictedPageError: isRestrictedPageError
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
