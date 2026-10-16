# Phase 1 Implementation Plan — Basic Extension MVP

- **Document ID:** PHASE1
- **Version:** 1.0.0
- **Status:** Planned (governance foundation reviewed and validated first)
- **Last updated:** 2026-10-17

Scope: implement the approved MVP requirements only — FR-001..FR-007, FR-010,
NFR-001..NFR-007, SEC-001..SEC-006, SEC-009, SEC-010, BCR-001..BCR-004.
**No** AI (FR-008), OCR (FR-009), screenshot capture, backend, or external
transmission. This plan does not begin implementation; it is the reviewed plan
required by Stage E of the foundation task.

## 0. Pre-implementation approvals to request

- Authorization to make the initial Git commit (a local `main` branch exists;
  nothing has been committed and no remote is configured).
- Any addition of build tooling beyond plain Node (ADR-003 starts with plain
  ES modules + a Node build script; TypeScript/bundlers need a later ADR).

## 1. Proposed source layout

```
src/
  manifest.chromium.json     MV3 base for Chrome/Edge/Brave
  manifest.firefox.json      Firefox-adjusted MV3 base
  background/
    service-worker.js        state ownership, preference persistence, messaging
  content/
    inject.js                selection listener (active only), error containment
    panel.js                 shadow-DOM floating panel (textContent only)
  popup/
    popup.html / popup.js    state display, activate/deactivate, settings
  shared/
    browser-api.js           thin chrome/browser abstraction (BCR-003)
    messages.js              typed message definitions + validation
scripts/
  build-extension.py         emits dist/chromium and dist/firefox (NFR-004)
  governance-check.py        (exists)
tests/
  unit tests for selection extraction, message validation, state machine
  (node --test)
```

## 2. Build sequence (each step: implement → test → sync docs → traceability)

| Step | Deliverable | Requirements | Verification |
| --- | --- | --- | --- |
| 1 | Build script emitting both manifest variants | NFR-004 | `node --test` + parse both manifests; `T-NFR-004-1` |
| 2 | Manifests with only `storage` + `activeTab` | FR-001, SEC-001, BCR-001/002 | JSON validation; permission-justification review `T-SEC-001-1`; load unpacked in Chrome and Firefox `T-FR-001-1/2` (manual, per-browser) |
| 3 | Background state machine + preference storage | FR-003, FR-010 | unit tests `T-FR-003-*`, `T-FR-010-*` |
| 4 | Popup UI (state + toggle) | FR-002, NFR-007 | unit/manual `T-FR-002-1`; keyboard check `T-NFR-007-1` |
| 5 | Content script: selection detection (active only) | FR-004, SEC-003 | unit tests `T-FR-004-*` |
| 6 | Shadow-DOM floating panel (textContent, dismiss, no network) | FR-005..FR-007, SEC-004/005, SEC-009 | DOM-assertion tests `T-FR-005-*`, `T-FR-006-1`, `T-FR-007-1`, `T-SEC-005-1`, `T-SEC-009-1` |
| 7 | Error containment + API-availability degradation | NFR-005, BCR-003 | failure-injection tests `T-NFR-005-1`, `T-BCR-003-1` |
| 8 | Latency measurement | NFR-001 | timed check `T-NFR-001-1` (manual or scripted) |
| 9 | Firefox variant validation | BCR-002 | load + run in Firefox (manual checklist) `T-BCR-002-1` |
| 10 | Final pass | all | `python3 scripts/governance-check.py`, `node --test tests/`, traceability + changelog updates, final report |

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

## 5. Expected Phase 1 evidence

- Governance check: PASS (static docs only).
- Unit tests: `node --test tests/` output with named tests per AC.
- Manual browser checklist results for Chrome/Edge and Firefox, recorded
  per browser, or `NOT VERIFIED` where a browser cannot be tested.
