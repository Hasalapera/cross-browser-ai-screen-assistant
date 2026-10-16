import test from "node:test";
import assert from "node:assert/strict";
import { loadModules, SRC } from "./harness.mjs";

test("T-BCR-003-1: with no extension API present, access degrades safely", () => {
  const ctx = loadModules([SRC.browserApi]);
  assert.equal(ctx.CBASA.browserApi.getApi(), null);
  for (const feature of ["storage", "scripting", "tabs", "runtime", "unknown"]) {
    assert.equal(ctx.CBASA.browserApi.isAvailable(feature), false);
  }
});

test("T-BCR-003-1: the browser namespace is preferred and chrome is the fallback", () => {
  const fakeBrowser = { runtime: {}, marker: "browser" };
  const preferred = loadModules([SRC.browserApi], { browser: fakeBrowser, chrome: { marker: "chrome" } });
  assert.equal(preferred.CBASA.browserApi.getApi().marker, "browser");

  const fallback = loadModules([SRC.browserApi], { chrome: { marker: "chrome" } });
  assert.equal(fallback.CBASA.browserApi.getApi().marker, "chrome");
});

test("T-BCR-003-1: feature availability is detected per API", () => {
  const api = {
    storage: { local: { get() {}, set() {} } },
    runtime: { sendMessage() {} }
  };
  const ctx = loadModules([SRC.browserApi], { chrome: api });
  const { isAvailable } = ctx.CBASA.browserApi;
  assert.equal(isAvailable("storage"), true);
  assert.equal(isAvailable("runtime"), true);
  assert.equal(isAvailable("scripting"), false);
  assert.equal(isAvailable("tabs"), false);
});

test("T-BCR-003-2: missing-receiver transport errors are recognised", () => {
  const { isMissingReceiverError } = loadModules([SRC.browserApi]).CBASA.browserApi;
  assert.equal(
    isMissingReceiverError(
      new Error("Could not establish connection. Receiving end does not exist.")
    ),
    true
  );
  assert.equal(isMissingReceiverError(new Error("Cannot access contents of the page.")), false);
  assert.equal(isMissingReceiverError(null), false);
  assert.equal(isMissingReceiverError(undefined), false);
});

test("T-BCR-003-2: restricted-page injection errors are recognised", () => {
  const { isRestrictedPageError } = loadModules([SRC.browserApi]).CBASA.browserApi;
  assert.equal(isRestrictedPageError(new Error("Cannot access a chrome URL")), true);
  assert.equal(isRestrictedPageError(new Error("Cannot access contents of the page.")), true);
  assert.equal(isRestrictedPageError(new Error("The extensions gallery cannot be scripted.")), true);
  assert.equal(
    isRestrictedPageError(
      new Error("Could not establish connection. Receiving end does not exist.")
    ),
    false
  );
  assert.equal(isRestrictedPageError(new Error("random failure")), false);
});
