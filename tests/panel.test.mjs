import test from "node:test";
import assert from "node:assert/strict";
import { loadModules, SRC } from "./harness.mjs";

function createFakeDocument() {
  const document = { body: null };
  function makeElement(tag) {
    const el = {
      tagName: String(tag).toUpperCase(),
      id: "",
      children: [],
      parentNode: null,
      style: {},
      attributes: {},
      listeners: {},
      textContent: "",
      shadowRoot: null,
      appendChild(child) {
        child.parentNode = this;
        this.children.push(child);
        return child;
      },
      removeChild(child) {
        const index = this.children.indexOf(child);
        if (index >= 0) {
          this.children.splice(index, 1);
          child.parentNode = null;
        }
        return child;
      },
      setAttribute(name, value) {
        this.attributes[name] = String(value);
      },
      getAttribute(name) {
        return Object.prototype.hasOwnProperty.call(this.attributes, name)
          ? this.attributes[name]
          : null;
      },
      addEventListener(type, handler) {
        (this.listeners[type] = this.listeners[type] || []).push(handler);
      },
      attachShadow() {
        this.shadowRoot = makeElement("shadow-root");
        return this.shadowRoot;
      }
    };
    return el;
  }
  function walk(el, visit) {
    visit(el);
    el.children.forEach((child) => walk(child, visit));
    if (el.shadowRoot) {
      walk(el.shadowRoot, visit);
    }
  }
  document.body = makeElement("body");
  document.createElement = makeElement;
  document.getElementById = (id) => {
    let found = null;
    walk(document.body, (el) => {
      if (el.id === id) {
        found = el;
      }
    });
    return found;
  };
  return document;
}

function panelApi() {
  return loadModules([SRC.panel]).CBASA.panel;
}

test("T-FR-005-1: a panel is created and attached for captured text", () => {
  const doc = createFakeDocument();
  const { createPanel } = panelApi();
  const panel = createPanel(doc, "example selection");
  assert.equal(doc.body.children.length, 1);
  assert.equal(panel.host.parentNode, doc.body);
  assert.equal(panel.content.textContent, "example selection");
});

test("T-FR-005-2: the panel is positioned without covering the reading cursor", () => {
  const doc = createFakeDocument();
  const { createPanel } = panelApi();
  const panel = createPanel(doc, "example selection");
  assert.ok(panel.host.style.position === "fixed");
  assert.ok(panel.host.style.zIndex.length > 0);
});

test("T-FR-007-1: selection text is rendered as plain text with no child markup", () => {
  const doc = createFakeDocument();
  const { createPanel } = panelApi();
  const hostile = "<script>alert(1)</script>";
  const panel = createPanel(doc, hostile);
  assert.equal(panel.content.textContent, hostile);
  assert.equal(panel.content.children.length, 0);
});

test("T-SEC-005-1: the panel exposes accessible roles and labels", () => {
  const doc = createFakeDocument();
  const { createPanel } = panelApi();
  const panel = createPanel(doc, "text");
  assert.equal(panel.card.getAttribute("role"), "dialog");
  assert.equal(panel.dismissButton.getAttribute("aria-label"), "Dismiss assistant panel");
  assert.equal(
    panel.card.getAttribute("aria-describedby"),
    panel.content.getAttribute("id")
  );
});

test("T-FR-006-1: dismissing the panel removes it and leaves the host DOM clean", () => {
  const doc = createFakeDocument();
  const { createPanel } = panelApi();
  let dismissed = 0;
  const panel = createPanel(doc, "text", { onDismiss: () => (dismissed += 1) });
  assert.equal(doc.body.children.length, 1);
  panel.dismissButton.listeners.click[0]();
  assert.equal(dismissed, 1);
  assert.equal(doc.body.children.length, 0);
  assert.equal(panel.host.parentNode, null);
});

test("T-FR-006-1: rendering a new panel first removes any previous panel", () => {
  const doc = createFakeDocument();
  const { createPanel, HOST_ID } = panelApi();
  createPanel(doc, "first");
  createPanel(doc, "second");
  assert.equal(doc.body.children.length, 1);
  assert.equal(doc.getElementById(HOST_ID).id, HOST_ID);
  const shadow = doc.body.children[0].shadowRoot;
  assert.equal(shadow.children.length, 1);
  assert.equal(shadow.children[0].children[1].textContent, "second");
});
