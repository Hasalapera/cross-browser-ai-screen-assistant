# Known Limitations — Cross-Browser AI Screen Assistant

- **Document ID:** LIMIT
- **Version:** 1.0.1
- **Last updated:** 2026-10-17

These limitations are documented so they are not mistaken for defects or for
verified functionality. Each is either a deliberate scope boundary or an
unverified area.

## 1. Product scope limitations (MVP)

- No AI answers, OCR, screenshot capture, backend service, accounts, sync, or
  history. These are deferred (FR-008, FR-009).
- No Safari or mobile support.
- Selection detection is limited to ordinary HTML pages. Browser-internal pages,
  PDF viewers, and cross-origin iframe content are not supported (SEC-006).

## 2. Verification limitations

- A Phase 1 MVP implementation exists (extension skeleton, background state,
  content-script selection/panel, popup, unit tests). Deterministic local checks
  (`node --test`, `scripts/build-extension.py`, `scripts/governance-check.py`)
  pass for the requirements that do not need a browser.
- Anything whose acceptance criterion requires a live browser is recorded as
  `IMPLEMENTED`, not `VERIFIED`: popup rendering, live selection capture, real
  panel display and latency, keyboard operation, and runtime network traces.
  No automated browser end-to-end harness exists yet (see `test-strategy.md` §7).
- Messaging errors are now contained deterministically at the unit level
  (background broadcast/injection and content error reporting attach rejection
  handlers; `tests/background.test.mjs`, `tests/content.test.mjs`). This was a
  real defect: a state broadcast to a tab without the injected content script
  produced an uncaught promise rejection in the service worker. The *live*
  service-worker console is still not asserted by any automated check.
- Cross-browser compatibility is **not** verified. Firefox is **not installed**
  in the build environment, so the Firefox package is built and structurally
  checked but never loaded; a Chrome pass would not imply a Firefox pass
  (BCR-004).
- No security audit, penetration test, or static analysis tool has been run.
  The security architecture records designed controls, not proof of correctness.
  `SEC-002`/`SEC-010` are `VERIFIED` only in the sense of a clean *best-effort*
  pattern scan, which is not proof of absence.

## 3. Governance-check tool limitations

`scripts/governance-check.py` is a **deterministic static check**. It verifies
structure and cross-references (files exist, IDs are well-formed and unique,
every requirement has an acceptance criterion, references resolve). It **cannot**:

- Determine whether a requirement *change* was semantically recorded.
- Judge whether a test actually proves a criterion.
- Detect secrets with certainty (best-effort patterns only).
- Validate runtime behaviour, permissions at runtime, or browser compatibility.

Passing the governance check means the documentation is internally consistent,
not that the product works.

## 4. Assumptions that could change

- Content-script isolation from the page JS world is assumed; a platform change
  would invalidate parts of the threat model.
- `activeTab` + user gesture is assumed sufficient for MVP selection detection.
  If broader access proves necessary, it is an approved-change + ADR event.
