import test from "node:test";
import assert from "node:assert/strict";
import { loadModules, SRC } from "./harness.mjs";

function selection() {
  return loadModules([SRC.selection]).CBASA.selection;
}

test("T-FR-004-1: captures a selection and collapses surrounding whitespace", () => {
  const { sanitizeSelection } = selection();
  assert.equal(sanitizeSelection("  hello   world \n next "), "hello world next");
});

test("T-FR-004-2: an empty or whitespace-only selection yields an empty string", () => {
  const { sanitizeSelection } = selection();
  assert.equal(sanitizeSelection("   \n\t "), "");
  assert.equal(sanitizeSelection(""), "");
});

test("T-SEC-004-1: non-string input is handled as an opaque, empty selection", () => {
  const { sanitizeSelection } = selection();
  for (const value of [null, undefined, 42, {}, [], true]) {
    assert.equal(sanitizeSelection(value), "");
  }
});

test("T-SEC-004-2: markup is preserved literally, never interpreted", () => {
  const { sanitizeSelection } = selection();
  const hostile = "<img src=x onerror=alert(1)>hello</img>";
  assert.equal(sanitizeSelection(hostile), hostile);
});

test("T-SEC-003-1: selection length is capped to bound memory", () => {
  const { sanitizeSelection, MAX_SELECTION_LENGTH } = selection();
  const long = "a".repeat(MAX_SELECTION_LENGTH + 500);
  assert.equal(sanitizeSelection(long).length, MAX_SELECTION_LENGTH);
});
