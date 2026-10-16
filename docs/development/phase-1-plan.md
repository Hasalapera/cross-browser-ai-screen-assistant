# Phase 1 Implementation Plan — Basic Extension MVP

- **Document ID:** PHASE1
- **Version:** 1.1.0
- **Status:** Implemented (skeleton); browser-level verification pending
- **Last updated:** 2026-10-17

Scope: implement the approved MVP requirements only — FR-001..FR-007, FR-010,
NFR-001..NFR-007, SEC-001..SEC-006, SEC-009, SEC-010, BCR-001..BCR-004.
**No** AI (FR-008), OCR (FR-009), screenshot capture, backend, or external
transmission.

## 0. Pre-implementation approvals

- Initial Git commit: **done** (local `main`; remote `origin/main` configured and
  pushed with the governance foundation).
- Build tooling: plain Node + Python stdlib only (ADR-003). No TypeScript,
  bundler, or new dependency was introduced.
- Added manifest permission `scripting` (beyond `storage` + `activeTab`) to
  inject the content script on explicit activation. **User-approved** (AGENTS.md
  §12). Rationale and record: `docs/architecture/system-architecture.md` §8,
  `docs/architecture/security-architecture.md` §4, and RCL-001 in
  `docs/requirements/requirements-change-log.md`.

## 1. Implemented source layout

```
src/
  manifest.chromium.json     MV3 base for Chrome/Edge/Brave
  manifest.firefox.json      Firefox-adjusted MV3 base
  shared/
    browser-api.js           thin chrome/browser abstraction (BCR-003)
    messages.js              typed message definitions + validation
    state.js                 activation-preference model (FR-003, FR-010)
    selection.js             selection extraction + sanitisation (SEC-003/004/005)
  background/
    background.js            state ownership, persistence, injection, messaging
  content/
    panel.js                 shadow-DOM floating panel (text content only)
    content.js               selection listener (active only), error containment
  popup/
    popup.html / popup.css / popup.js   state display, activate/deactivate
scripts/
  build-extension.py         emits dist/chromium and dist/firefox (NFR-004)
  governance-check.py        (exists)
tests/
  *.test.mjs                 node:test unit + build + source-safety tests
```

Bundles are produced by concatenating shared modules with each context entry
point into a single classic script per context (background.js, content.js,
popup.js), avoiding an ES-module/bundler dependency per ADR-003.

## 2. Build sequence (each step: implement → test → sync docs → traceability)

| Step | Deliverable | Requirements | Verification |
| --- | --- | --- | --- |
| 1 | Build script emitting both manifest variants | NFR-004 | `node --test` build test; both manifests parsed `T-NFR-004-1` |
| 2 | Manifests with `storage` + `activeTab` + `scripting` | FR-001, SEC-001, BCR-001/002 | manifest test `T-FR-001-*`, `T-SEC-001-1`, `T-BCR-001-1`, `T-BCR-002-1`; load unpacked in Chrome and Firefox `T-FR-001-1/2` (manual, per-browser) |
| 3 | Background state machine + preference storage | FR-003, FR-010 | unit tests `T-FR-003-*`, `T-FR-010-*` |
| 4 | Popup UI (state + toggle) | FR-002, NFR-007 | code + ARIA assertions; interactive check `T-FR-002-1`, keyboard `T-NFR-007-1` (browser, NOT VERIFIED) |
| 5 | Content script: selection detection (active only) | FR-004, SEC-003 | unit tests `T-FR-004-*` |
| 6 | Shadow-DOM floating panel (text content, dismiss, no network) | FR-005..FR-007, SEC-004/005, SEC-009 | DOM-double tests `T-FR-005-*`, `T-FR-006-1`, `T-FR-007-1`, `T-SEC-005-1`; source scans `T-SEC-009-1` |
| 7 | Error containment + API-availability degradation | NFR-005, BCR-003 | failure-injection tests `T-NFR-005-1` (browser, NOT VERIFIED), `T-BCR-003-1` |
| 8 | Latency measurement | NFR-001 | timed check `T-NFR-001-1` (browser, NOT VERIFIED) |
| 9 | Firefox variant validation | BCR-002 | build + structural check done; load + run in Firefox `T-BCR-002-1` (NOT VERIFIED — Firefox not installed) |
| 10 | Final pass | all | `python3 scripts/governance-check.py`, `node --test`, traceability + changelog updates, final report |

## 3. Cross-cutting rules during Phase 1

- Selected text is inserted with `textContent` only; never `innerHTML`, `eval`,
  or script injection (SEC-004/005).
- Content script observes selections only while active; inactive means no
  listeners act (FR-003).
- No network calls of any kind in the MVP (NFR-006, SEC-009); a browser
  network trace with networking disabled is the evidence for `T-SEC-009-1`.
- Every step updates `docs/quality/traceability-matrix.md` with real statuses;
  browser results are recorded **per browser** (BCR-004).
- Docs and code change together (`documentation-sync`), governed by
  `AGENTS.md` §7.

## 4. What Phase 1 explicitly does NOT decide

- Backend service and AI proxy (Phase 2, ADR-002).
- OCR and capture consent UX (Phase 3, ADR-004).
- Store publication, signing, and CI (needs approval; separate phase).

## 5. Evidence produced

- Governance check: PASS (static docs only) — see the final report.
- Unit/build/source tests: `node --test` output with named tests per criterion.
- Build: `python3 scripts/build-extension.py` emits `dist/chromium` and
  `dist/firefox`.
- Browser results: not yet produced. Chrome/Edge and Firefox load, selection,
  panel, keyboard, latency, and network-trace checks are `NOT VERIFIED`; Firefox
  could not be checked because it is not installed. Recorded per browser (BCR-004).
- Manual browser checklist (procedure, not yet executed):
  `docs/quality/manual-verification-checklist.md`.
