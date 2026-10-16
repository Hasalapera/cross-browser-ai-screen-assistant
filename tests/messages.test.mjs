import test from "node:test";
import assert from "node:assert/strict";
import { loadModules, SRC } from "./harness.mjs";

function messages() {
  return loadModules([SRC.messages]).CBASA.messages;
}

test("T-SEC-004-1: unknown message types are rejected", () => {
  const { validateMessage } = messages();
  assert.equal(validateMessage({ type: "CBASA_UNKNOWN" }).ok, false);
  assert.equal(validateMessage({ type: "CBASA_UNKNOWN" }).error, "unknown-type");
});

test("T-SEC-004-2: malformed messages are rejected before handling", () => {
  const { validateMessage } = messages();
  for (const value of [null, undefined, 42, "text", ["CBASA_GET_STATE"], {}]) {
    assert.equal(validateMessage(value).ok, false);
  }
  assert.equal(
    validateMessage({ type: "CBASA_SET_ACTIVE", payload: "nope" }).error,
    "malformed-payload"
  );
});

test("T-FR-002-1: known, well-formed messages are accepted and normalised", () => {
  const { TYPES, validateMessage } = messages();
  const result = validateMessage({ type: TYPES.SET_ACTIVE, payload: { active: true } });
  assert.equal(result.ok, true);
  assert.equal(result.type, TYPES.SET_ACTIVE);
  assert.deepEqual({ ...result.payload }, { active: true });

  const withoutPayload = validateMessage({ type: TYPES.GET_STATE });
  assert.equal(withoutPayload.ok, true);
  assert.deepEqual({ ...withoutPayload.payload }, {});
});
