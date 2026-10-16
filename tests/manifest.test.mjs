import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { ROOT } from "./harness.mjs";

const EXPECTED_PERMISSIONS = ["activeTab", "scripting", "storage"];

function readManifest(name) {
  return JSON.parse(readFileSync(path.join(ROOT, "src", name), "utf8"));
}

test("T-BCR-001-1: the Chromium manifest is valid Manifest V3", () => {
  const manifest = readManifest("manifest.chromium.json");
  assert.equal(manifest.manifest_version, 3);
  assert.equal(typeof manifest.name, "string");
  assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
  assert.equal(typeof manifest.background.service_worker, "string");
  assert.equal(manifest.action.default_popup, "popup.html");
});

test("T-BCR-002-1: the Firefox manifest targets Firefox with background scripts", () => {
  const manifest = readManifest("manifest.firefox.json");
  assert.equal(manifest.manifest_version, 3);
  assert.ok(Array.isArray(manifest.background.scripts));
  assert.ok(manifest.browser_specific_settings.gecko.id.includes("@"));
});

test("T-SEC-001-1: both manifests request exactly the least-privilege permissions", () => {
  for (const name of ["manifest.chromium.json", "manifest.firefox.json"]) {
    const manifest = readManifest(name);
    assert.deepEqual([...manifest.permissions].sort(), EXPECTED_PERMISSIONS, name);
    assert.equal(manifest.host_permissions, undefined, `${name} must not request host permissions`);
  }
});
