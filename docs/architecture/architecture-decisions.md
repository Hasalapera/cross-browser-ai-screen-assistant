# Architecture Decision Records — Cross-Browser AI Screen Assistant

- **Document ID:** ADR
- **Last updated:** 2026-10-17

Each ADR records a significant, hard-to-reverse decision: context, options,
decision, reasons, consequences, and status. Status values: `PROPOSED`,
`ACCEPTED`, `SUPERSEDED` (by another ADR), `DEPRECATED`, `REJECTED`.

---

## ADR-001 — Browser platform and manifest strategy

- **Status:** ACCEPTED
- **Date:** 2026-10-17
- **Context:** The extension must run on Chromium-family browsers and Firefox.
  Chromium requires Manifest V3 (MV2 is deprecated); Firefox supports MV3 with
  some differences (background scripts vs. service worker, `browser` vs.
  `chrome` namespace).
- **Options:**
  1. Single MV3 manifest targeting Chromium only.
  2. MV3 with a cross-browser build that emits a Firefox-adjusted manifest and a
     polyfill shim for the `browser`/`chrome` namespace.
  3. Separate codebases per browser.
- **Decision:** Option 2 — a single source tree with a build step producing a
  Chromium MV3 package and a Firefox-compatible package; use a thin
  runtime-abstracted API layer (or a maintained polyfill) so feature code is
  browser-agnostic.
- **Reasons:** One codebase (NFR-004), targets the required browsers (FR-001,
  BCR-001, BCR-002), avoids maintenance cost of option 3, and avoids excluding
  Firefox as option 1 would.
- **Consequences:** Adds a build step and a compatibility layer; compatibility
  must be verified per browser (BCR-004) rather than assumed.
- **Requirements:** FR-001, NFR-004, BCR-001, BCR-002, BCR-003.

---

## ADR-002 — AI integration via backend proxy, not direct client calls

- **Status:** ACCEPTED (design); implementation DEFERRED to Phase 2
- **Date:** 2026-10-17
- **Context:** Phase 2 must obtain AI answers. Calling an AI provider directly
  from the client would require shipping an API key in the extension or asking
  each user for one.
- **Options:**
  1. Direct provider call from the extension with a bundled key.
  2. Direct call with per-user keys stored in browser storage.
  3. Extension → owned backend proxy → provider; credentials server-side.
- **Decision:** Option 3. The extension sends the user's explicit request to an
  owned backend over HTTPS; the backend holds provider credentials and enforces
  auth/rate limits.
- **Reasons:** Satisfies SEC-002 (no client secrets) and SEC-008 (HTTPS +
  server-held credentials). Options 1 and 2 expose keys to extraction.
- **Consequences:** Requires a backend service and an approved privacy/data-flow
  review before Phase 2 code. Backend is its own trust boundary.
- **Requirements:** FR-008, SEC-002, SEC-008, SEC-009.

---

## ADR-003 — Extension source language and toolchain

- **Status:** ACCEPTED
- **Date:** 2026-10-17
- **Context:** The MVP needs a maintainable, cross-browser-friendly codebase
  with minimal dependency and privacy risk.
- **Options:**
  1. Plain ES modules, no build step, browser APIs directly.
  2. TypeScript + a bundler (e.g., esbuild/Vite) + a polyfill.
  3. A full framework (React/Vue) for the popup/panel.
- **Decision:** Start with **plain ES modules** for the MVP, with a small
  Node-based build script that emits per-browser manifest variants and copies
  sources. TypeScript and a bundler may be introduced by a later ADR if
  complexity justifies it.
- **Reasons:** Minimal dependencies (NFR-003, NFR-006, SEC-010), no build
  toolchain supply-chain surface for the MVP, and direct use of platform APIs
  keeps the code auditable. Node is already available (verified v24).
- **Consequences:** Larger manual effort for cross-browser differences; the
  runtime API abstraction layer from ADR-001 still applies. Revisit if the code
  grows or type-safety becomes necessary.
- **Requirements:** NFR-003, NFR-004, NFR-006.

---

## ADR-004 — OCR approach

- **Status:** PROPOSED (Phase 3)
- **Date:** 2026-10-17
- **Context:** Optional OCR on user-authorized screen capture.
- **Options:** browser-native OCR APIs; WASM OCR (e.g., Tesseract.js) bundled
  locally; server-side OCR via the Phase 2 backend; third-party cloud OCR.
- **Decision:** Not yet decided. Requires an ADR update when Phase 3 begins,
  weighing bundle size, privacy (local vs. server), accuracy, and consent UX.
- **Constraints (already binding):** explicit per-action user gesture (SEC-007),
  no circumvention of protected content (SEC-006), and no transmission without
  consent (SEC-009).
- **Requirements:** FR-009, SEC-006, SEC-007.

---

## ADR-005 — Requirement traceability and documentation governance

- **Status:** ACCEPTED
- **Date:** 2026-10-17
- **Context:** The project requires requirement-driven consistency across
  future tasks, with auditable links from requirement to test to evidence.
- **Options:**
  1. Ad-hoc documentation.
  2. A full requirements-management tool.
  3. In-repo Markdown documents with stable IDs + a lightweight local
     governance-check script, enforced through AGENTS.md and skills.
- **Decision:** Option 3.
- **Reasons:** No external dependency, versioned with the code, reviewable in
  diffs, and enforceable by deterministic checks where semantics allow. A tool
  (option 2) is unnecessary overhead at this scale.
- **Consequences:** Static checks can validate ID formats and cross-references
  but cannot judge semantic correctness of a requirement change — that remains a
  human/agent review responsibility (documented limitation).
- **Requirements:** supports AGENTS.md and `docs/quality/traceability-matrix.md`.

---

## ADR-006 — Skill-based workflow orchestration

- **Status:** ACCEPTED
- **Date:** 2026-10-17
- **Context:** The agent must automatically select the right process for each
  task type and actually load the corresponding skill.
- **Options:**
  1. Instructions only in AGENTS.md (advisory).
  2. Project-local opencode skills in `.opencode/skills/*/SKILL.md` selected by
     the model from each skill's `description`, plus a `/change` command that
     encodes the end-to-end lifecycle.
- **Decision:** Option 2, with AGENTS.md defining the selection table.
- **Reasons:** opencode discovers real skills and exposes their descriptions to
  the model, making selection reliable; AGENTS.md remains the human-readable
  contract. This is the mechanism opencode actually supports (verified).
- **Consequences:** Skill selection is model-driven, so it is *strongly guided
  but not hard-enforced* by the runtime. AGENTS.md requires the agent to report
  when a skill could not be loaded. Truly automatic enforcement of "did the
  agent load a skill" is not provided by opencode and is therefore advisory.
- **Requirements:** supports `docs/development/workflow.md`.
