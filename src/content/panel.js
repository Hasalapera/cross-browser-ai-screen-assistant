/*
 * Purpose: Renders the floating answer panel inside an isolated shadow root.
 * Untrusted selection text is written only as text content, never as markup,
 * and the panel can be fully removed so the host page is left unchanged
 * (FR-005, FR-006, FR-007, SEC-005, NFR-007).
 */
(function (root) {
  "use strict";

  var CBASA = root.CBASA || (root.CBASA = {});

  var HOST_ID = "cbasa-panel-host";

  function applyStyles(element, styles) {
    Object.keys(styles).forEach(function (key) {
      element.style[key] = styles[key];
    });
  }

  function createPanel(doc, text, options) {
    var opts = options || {};

    var existing = doc.getElementById ? doc.getElementById(HOST_ID) : null;
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }

    var host = doc.createElement("div");
    host.id = HOST_ID;
    applyStyles(host, {
      position: "fixed",
      top: "16px",
      right: "16px",
      zIndex: "2147483647",
      maxWidth: "360px"
    });

    var shadow = host.attachShadow ? host.attachShadow({ mode: "open" }) : host;

    var card = doc.createElement("div");
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-label", "Assistant selection panel");
    applyStyles(card, {
      fontFamily: "system-ui, sans-serif",
      fontSize: "14px",
      lineHeight: "1.4",
      color: "#111",
      background: "#fff",
      border: "1px solid #ccc",
      borderRadius: "8px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
      padding: "12px"
    });

    var heading = doc.createElement("p");
    heading.setAttribute("id", HOST_ID + "-title");
    applyStyles(heading, { margin: "0 0 8px 0", fontWeight: "600" });
    heading.textContent = "Selected text";

    var content = doc.createElement("p");
    content.setAttribute("id", HOST_ID + "-content");
    applyStyles(content, { margin: "0 0 12px 0", whiteSpace: "pre-wrap" });
    content.textContent = text;

    var dismiss = doc.createElement("button");
    dismiss.setAttribute("type", "button");
    dismiss.setAttribute("aria-label", "Dismiss assistant panel");
    applyStyles(dismiss, { cursor: "pointer" });
    dismiss.textContent = "Dismiss";

    card.setAttribute("aria-labelledby", HOST_ID + "-title");
    card.setAttribute("aria-describedby", HOST_ID + "-content");
    card.appendChild(heading);
    card.appendChild(content);
    card.appendChild(dismiss);
    shadow.appendChild(card);

    function destroy() {
      if (host.parentNode) {
        host.parentNode.removeChild(host);
      }
    }

    function handleDismiss() {
      destroy();
      if (typeof opts.onDismiss === "function") {
        opts.onDismiss();
      }
    }

    dismiss.addEventListener("click", handleDismiss);

    if (doc.body) {
      doc.body.appendChild(host);
    }

    return {
      host: host,
      shadow: shadow,
      card: card,
      content: content,
      dismissButton: dismiss,
      destroy: destroy
    };
  }

  CBASA.panel = {
    HOST_ID: HOST_ID,
    createPanel: createPanel
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
