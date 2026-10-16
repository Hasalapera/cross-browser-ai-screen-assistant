import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { ROOT } from "./harness.mjs";

const DIST = path.join(ROOT, "dist");

function runBuild() {
  return execFileSync("python3", [path.join("scripts", "build-extension.py")], {
    cwd: ROOT,
    encoding: "utf8"
  });
}

test("T-NFR-004-1: one build command emits both Chromium and Firefox packages", () => {
  const output = runBuild();
  assert.match(output, /\[build\] done/);

  for (const target of ["chromium", "firefox"]) {
    for (const file of [
      "manifest.json",
      "background.js",
      "content.js",
      "popup.js",
      "popup.html",
      "popup.css"
    ]) {
      const artifact = path.join(DIST, target, file);
      assert.ok(existsSync(artifact), `missing ${target}/${file}`);
    }
  }

  const chromium = JSON.parse(readFileSync(path.join(DIST, "chromium", "manifest.json"), "utf8"));
  const firefox = JSON.parse(readFileSync(path.join(DIST, "firefox", "manifest.json"), "utf8"));
  assert.equal(chromium.background.service_worker, "background.js");
  assert.deepEqual(firefox.background.scripts, ["background.js"]);
  assert.deepEqual([...chromium.permissions].sort(), ["activeTab", "scripting", "storage"]);
});

test("T-NFR-004-1: each bundle inlines the shared modules it depends on", () => {
  for (const target of ["chromium", "firefox"]) {
    const background = readFileSync(path.join(DIST, target, "background.js"), "utf8");
    const content = readFileSync(path.join(DIST, target, "content.js"), "utf8");
    const popup = readFileSync(path.join(DIST, target, "popup.js"), "utf8");
    for (const [label, text] of [
      ["background", background],
      ["content", content],
      ["popup", popup]
    ]) {
      assert.match(text, /CBASA/, `${target}/${label} bundle missing shared namespace`);
    }
    assert.match(content, /content\/content\.js/, `${target} content bundle missing entry`);
    assert.match(popup, /popup\/popup\.js/, `${target} popup bundle missing entry`);
  }
});

test("T-FR-001-1: the Chromium package declares a loadable MV3 manifest", () => {
  runBuild();
  const manifest = JSON.parse(readFileSync(path.join(DIST, "chromium", "manifest.json"), "utf8"));
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.action.default_popup, "popup.html");
});

test("T-FR-001-2: the Firefox package manifest is structurally complete (runtime load NOT VERIFIED)", () => {
  runBuild();
  const manifest = JSON.parse(readFileSync(path.join(DIST, "firefox", "manifest.json"), "utf8"));
  assert.equal(manifest.manifest_version, 3);
  assert.ok(manifest.browser_specific_settings.gecko.id);
});
