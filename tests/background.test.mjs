import test from "node:test";
import assert from "node:assert/strict";
import { loadModules, SRC } from "./harness.mjs";

const MODULES = [SRC.browserApi, SRC.messages, SRC.state, SRC.background];

const MISSING_RECEIVER =
  "Could not establish connection. Receiving end does not exist.";

function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/*
 * A fake promise-like result whose rejection handler is recorded so the test
 * can assert the implementation attached one (the real bug was a missing
 * rejection handler on the Chromium promise form of the messaging APIs).
 */
function track(list, entry, error) {
  const tracking = { rejectionHandled: false, handler: null };
  const thenable = {
    then() {
      return thenable;
    },
    catch(onRejected) {
      if (typeof onRejected === "function") {
        tracking.rejectionHandled = true;
        tracking.handler = onRejected;
      }
      return thenable;
    }
  };
  list.push({ entry, tracking, error });
  return thenable;
}

function createChrome(options = {}) {
  const opts = {
    tabs: [{ id: 1 }, { id: 2 }],
    activeTab: { id: 1 },
    stored: {},
    ...options
  };
  const state = {
    sends: [],
    injected: [],
    persisted: [],
    messageListeners: [],
    storageListeners: []
  };
  const api = {
    runtime: {
      onMessage: { addListener: (fn) => state.messageListeners.push(fn) },
      sendMessage: () => Promise.resolve(undefined)
    },
    storage: {
      local: {
        get: () => Promise.resolve(opts.stored),
        set: (record) => track(state.persisted, record, opts.setError)
      },
      onChanged: { addListener: (fn) => state.storageListeners.push(fn) }
    },
    tabs: {
      query: (queryInfo) =>
        Promise.resolve(queryInfo && queryInfo.active ? [opts.activeTab] : opts.tabs),
      sendMessage: (tabId, message) =>
        track(state.sends, { tabId, message }, opts.sendError)
    },
    scripting: {
      executeScript: (details) =>
        track(state.injected, { details }, opts.injectError)
    }
  };
  return { api, state };
}

function load(opts = {}) {
  const { api, state } = createChrome(opts);
  const errors = [];
  loadModules(MODULES, {
    chrome: api,
    console: { error: (...args) => errors.push(args) }
  });
  return { state, errors };
}

test("T-NFR-005-2: broadcasting handles the missing-receiver rejection quietly", async () => {
  const { state, errors } = load();
  await flush();

  assert.equal(state.sends.length, 2, "state is broadcast to every tab");
  for (const { entry, tracking } of state.sends) {
    assert.equal(entry.message.type, "CBASA_STATE_CHANGED");
    assert.equal(tracking.rejectionHandled, true, "a rejection handler is attached");
  }

  for (const { tracking } of state.sends) {
    tracking.handler(new Error(MISSING_RECEIVER));
  }
  assert.equal(errors.length, 0, "a benign no-receiver error must not be reported");
});

test("T-NFR-005-2: unexpected messaging failures are surfaced, not swallowed", async () => {
  const { state, errors } = load();
  await flush();

  for (const { tracking } of state.sends) {
    tracking.handler(new Error("Something unexpected happened"));
  }
  assert.equal(errors.length, state.sends.length, "unexpected errors are reported");
});

test("T-FR-003-4: activation injects the content script and broadcasts active state", async () => {
  const { state, errors } = load();
  await flush();
  const before = state.sends.length;

  let reply;
  state.messageListeners[0](
    { type: "CBASA_SET_ACTIVE", payload: { active: true } },
    {},
    (value) => {
      reply = value;
    }
  );
  await flush();

  assert.deepEqual({ ...reply }, { active: true });
  assert.equal(state.injected.length, 1, "content script injected once");
  assert.equal(state.injected[0].entry.details.target.tabId, 1, "into the active tab");
  assert.equal(state.injected[0].tracking.rejectionHandled, true);

  const changed = state.sends.slice(before);
  assert.equal(changed.length, 2);
  assert.ok(changed.every((s) => s.entry.message.payload.active === true));
  assert.equal(errors.length, 0);
});

test("T-BCR-003-2: injection on a protected page degrades quietly", async () => {
  const { state, errors } = load();
  await flush();

  state.messageListeners[0]({ type: "CBASA_SET_ACTIVE", payload: { active: true } }, {}, () => {});
  await flush();

  assert.equal(state.injected.length, 1);
  state.injected[0].tracking.handler(new Error("Cannot access contents of the page."));
  assert.equal(errors.length, 0, "a protected-page refusal is not an exception");
});

test("T-NFR-005-2: unexpected injection failures are surfaced", async () => {
  const { state, errors } = load();
  await flush();

  state.messageListeners[0]({ type: "CBASA_SET_ACTIVE", payload: { active: true } }, {}, () => {});
  await flush();

  state.injected[0].tracking.handler(new Error("Unexpected injection failure"));
  assert.equal(errors.length, 1);
});

test("T-FR-010-3: the persisted preference is written on activation", async () => {
  const { state } = load();
  await flush();

  state.messageListeners[0]({ type: "CBASA_SET_ACTIVE", payload: { active: true } }, {}, () => {});
  await flush();

  const written = state.persisted.map((p) => p.entry);
  assert.ok(written.some((record) => record.active === true));
  for (const { tracking } of state.persisted) {
    assert.equal(tracking.rejectionHandled, true, "storage.set rejection is handled");
  }
});
