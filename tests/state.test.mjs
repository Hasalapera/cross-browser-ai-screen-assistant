import test from "node:test";
import assert from "node:assert/strict";
import { loadModules, SRC } from "./harness.mjs";

function state() {
  return loadModules([SRC.state]).CBASA.state;
}

test("T-FR-003-3: a fresh install defaults to inactive", () => {
  const s = state();
  assert.equal(s.DEFAULT_ACTIVE, false);
  assert.equal(s.prefsFromStorage(undefined).active, false);
  assert.equal(s.prefsFromStorage({}).active, false);
});

test("T-FR-003-1: activating normalizes the preference to true", () => {
  const s = state();
  assert.equal(s.normalizeActive(true), true);
  assert.equal(s.prefsFromStorage({ active: true }).active, true);
});

test("T-FR-003-2: deactivation and non-boolean values normalize to inactive", () => {
  const s = state();
  assert.equal(s.prefsFromStorage({ active: false }).active, false);
  assert.equal(s.normalizeActive("true"), false);
  assert.equal(s.normalizeActive(1), false);
});

test("T-FR-010-1: preferences round-trip through a storage record", () => {
  const s = state();
  const stored = s.prefsToStorage(true);
  assert.equal(s.prefsFromStorage(stored).active, true);
  assert.equal(s.prefsFromStorage(s.prefsToStorage(false)).active, false);
});

test("T-FR-010-2: only preference data is persisted", () => {
  const s = state();
  assert.deepEqual({ ...s.prefsToStorage(true) }, { active: true });
  assert.deepEqual(Object.keys(s.prefsToStorage(true)), [s.STORAGE_KEY]);
});
