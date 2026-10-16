import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { ROOT } from "./harness.mjs";

const SRC_DIR = path.join(ROOT, "src");

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walk(full));
    } else {
      out.push(full);
    }
  }
  return out;
}

const SOURCE_FILES = walk(SRC_DIR);
const JS_FILES = SOURCE_FILES.filter((f) => f.endsWith(".js"));
const TEXT_FILES = SOURCE_FILES.filter(
  (f) => f.endsWith(".js") || f.endsWith(".html") || f.endsWith(".json")
);

const FORBIDDEN = [
  { label: "innerHTML assignment", pattern: /innerHTML/ },
  { label: "outerHTML assignment", pattern: /outerHTML/ },
  { label: "insertAdjacentHTML", pattern: /insertAdjacentHTML/ },
  { label: "document.write", pattern: /document\.write/ },
  { label: "eval call", pattern: /\beval\s*\(/ },
  { label: "Function constructor", pattern: /new\s+Function\s*\(/ },
  { label: "fetch call", pattern: /\bfetch\s*\(/ },
  { label: "XMLHttpRequest", pattern: /XMLHttpRequest/ },
  { label: "WebSocket", pattern: /WebSocket/ },
  { label: "sendBeacon", pattern: /sendBeacon/ },
  { label: "hard-coded URL", pattern: /https?:\/\// }
];

test("T-SEC-002-1: no source file contains secrets or credential literals", () => {
  const patterns = [
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /\bghp_[A-Za-z0-9]{30,}\b/,
    /\bsk-[A-Za-z0-9_-]{20,}\b/
  ];
  for (const file of SOURCE_FILES) {
    const text = readFileSync(file, "utf8");
    for (const pattern of patterns) {
      assert.ok(!pattern.test(text), `${file} matched ${pattern}`);
    }
  }
});

test("T-SEC-005-1: source renders text without markup or code evaluation", () => {
  for (const file of TEXT_FILES) {
    const text = readFileSync(file, "utf8");
    for (const { label, pattern } of FORBIDDEN) {
      assert.ok(!pattern.test(text), `${path.relative(ROOT, file)}: ${label}`);
    }
  }
});

test("T-SEC-009-1: the MVP source performs no network access", () => {
  const network = FORBIDDEN.filter((f) =>
    ["fetch call", "XMLHttpRequest", "WebSocket", "sendBeacon", "hard-coded URL"].includes(f.label)
  );
  for (const file of TEXT_FILES) {
    const text = readFileSync(file, "utf8");
    for (const { label, pattern } of network) {
      assert.ok(!pattern.test(text), `${path.relative(ROOT, file)}: ${label}`);
    }
  }
});

test("T-NFR-003-1: every source module documents its purpose", () => {
  assert.ok(JS_FILES.length > 0, "expected at least one JS module");
  for (const file of JS_FILES) {
    const text = readFileSync(file, "utf8");
    assert.match(text, /Purpose:/, `${path.relative(ROOT, file)} lacks a Purpose comment`);
  }
});
