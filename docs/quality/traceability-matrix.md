# Traceability Matrix — Cross-Browser AI Screen Assistant

- **Document ID:** TRACE
- **Version:** 1.0.1
- **Last updated:** 2026-10-17
- **Related:** `docs/requirements/requirements.md`,
  `docs/requirements/acceptance-criteria.md`, `docs/quality/test-strategy.md`

Links: **Requirement ID → Acceptance Criteria → Implementation component →
Test ID → Status**. Update whenever any link changes. Never mark `VERIFIED`
without named evidence.

Status vocabulary: `PROPOSED`, `APPROVED`, `IMPLEMENTED`, `VERIFIED`,
`NOT VERIFIED`, `DEFERRED`, `DEPRECATED`, `REJECTED`.

> **Phase 1 note (2026-10-17):** A Phase 1 MVP implementation now exists.
> `VERIFIED` means a named, deterministic local check (Node unit test,
> governance scan, or build) passed. Everything whose acceptance criterion
> requires a live browser stays `IMPLEMENTED` or `NOT VERIFIED`; no browser
> end-to-end harness exists and Firefox is not installed in the build
> environment. Cross-browser claims remain evidence-gated by BCR-004.

> **Messaging-containment fix (2026-10-17):** The background broadcast sent a
> state message to every tab while only tabs with the injected content script
> have a listener; on Chromium the promise form of `tabs.sendMessage` rejected
> with "Could not establish connection. Receiving end does not exist." and the
> synchronous `try/catch` did not catch it, producing an `Uncaught (in promise)`
> error. Background, content, and injection calls now attach rejection handlers;
> benign no-receiver/protected-page errors are contained while unexpected errors
> are reported (NFR-005, BCR-003, FR-003, FR-010). No new permission or
> data-flow change (SEC-001, SEC-009 unchanged).

| Requirement | Acceptance Criteria | Implementation component | Test ID | Status |
| --- | --- | --- | --- | --- |
| FR-001 | AC-FR-001-1, AC-FR-001-2 | `manifest.*`, `scripts/build-extension.py` | T-FR-001-1, T-FR-001-2 | IMPLEMENTED (build + manifest checks pass; unpacked browser load NOT VERIFIED) |
| FR-002 | AC-FR-002-1 | `src/popup` | T-FR-002-1 | IMPLEMENTED (popup code present; interactive browser check NOT VERIFIED) |
| FR-003 | AC-FR-003-1..3 | `src/background`, `src/content` | T-FR-003-1..4 | IMPLEMENTED (state rules + activation/wiring unit-tested; runtime toggle NOT VERIFIED) |
| FR-004 | AC-FR-004-1, AC-FR-004-2 | `src/shared/selection.js`, `src/content/content.js` | T-FR-004-1, T-FR-004-2 | IMPLEMENTED (sanitiser unit-tested; live selection NOT VERIFIED) |
| FR-005 | AC-FR-005-1, AC-FR-005-2 | `src/content/panel.js` | T-FR-005-1, T-FR-005-2 | IMPLEMENTED (DOM-double tests pass; 200 ms real-browser timing NOT VERIFIED) |
| FR-006 | AC-FR-006-1 | `src/content/panel.js` | T-FR-006-1 | IMPLEMENTED (removal tested via DOM double; host-page integrity in browser NOT VERIFIED) |
| FR-007 | AC-FR-007-1 | `src/content/panel.js` | T-FR-007-1 | IMPLEMENTED (text-only render tested; browser network trace NOT VERIFIED) |
| FR-008 | AC-FR-008-1, AC-FR-008-2 | `services/` (Phase 2) | T-FR-008-1, T-FR-008-2 | DEFERRED |
| FR-009 | AC-FR-009-1, AC-FR-009-2 | `capture/` (Phase 3) | T-FR-009-1, T-FR-009-2 | DEFERRED |
| FR-010 | AC-FR-010-1, AC-FR-010-2 | `src/shared/state.js`, `src/background/background.js` | T-FR-010-1, T-FR-010-2, T-FR-010-3 | IMPLEMENTED (round-trip + persistence-containment unit-tested; session-restart persistence NOT VERIFIED) |
| NFR-001 | AC-NFR-001-1 | `src/content/panel.js` | T-NFR-001-1 | IMPLEMENTED (no automated timing harness; NOT VERIFIED) |
| NFR-002 | AC-NFR-002-1 | `src/content/content.js` | T-NFR-002-1 | IMPLEMENTED (event-driven code; no perf profile run; NOT VERIFIED) |
| NFR-003 | AC-NFR-003-1 | repo-wide | T-NFR-003-1 | VERIFIED (purpose-header test + governance check pass) |
| NFR-004 | AC-NFR-004-1 | `scripts/build-extension.py` | T-NFR-004-1 | VERIFIED (build test emits both browser packages) |
| NFR-005 | AC-NFR-005-1 | `src/content/content.js`, `src/background/background.js` | T-NFR-005-1, T-NFR-005-2 | IMPLEMENTED (content + background messaging containment unit-tested; browser failure injection NOT VERIFIED) |
| NFR-006 | AC-NFR-006-1 | repo-wide | T-NFR-006-1 | IMPLEMENTED (no-network source scan passes; offline run NOT VERIFIED) |
| NFR-007 | AC-NFR-007-1 | `src/popup`, `src/content/panel.js` | T-NFR-007-1 | IMPLEMENTED (ARIA roles/labels present; keyboard run in browser NOT VERIFIED) |
| SEC-001 | AC-SEC-001-1 | `manifest.*` | T-SEC-001-1 | VERIFIED (manifest permission test + governance scan pass) |
| SEC-002 | AC-SEC-002-1 | repo-wide | T-SEC-002-1 | VERIFIED (static secret scan clean; best-effort, not proof) |
| SEC-003 | AC-SEC-003-1 | `src/shared/selection.js`, `src/content/panel.js` | T-SEC-003-1 | IMPLEMENTED (length-capped, in-memory only; runtime retention NOT VERIFIED) |
| SEC-004 | AC-SEC-004-1 | `src/shared/selection.js`, `src/shared/messages.js` | T-SEC-004-1 | IMPLEMENTED (opaque-string handling unit-tested) |
| SEC-005 | AC-SEC-005-1 | `src/content/panel.js` | T-SEC-005-1 | IMPLEMENTED (text-only render + source scan pass; live DOM NOT VERIFIED) |
| SEC-006 | AC-SEC-006-1 | manifests, content-script injection | T-SEC-006-1 | IMPLEMENTED (no host permissions, on-demand injection; runtime NOT VERIFIED) |
| SEC-007 | AC-SEC-007-1 | `capture/` (Phase 3) | T-SEC-007-1 | DEFERRED |
| SEC-008 | AC-SEC-008-1 | `services/` (Phase 2) | T-SEC-008-1 | DEFERRED |
| SEC-009 | AC-SEC-009-1 | repo-wide | T-SEC-009-1 | IMPLEMENTED (no-network source scan passes; browser network trace NOT VERIFIED) |
| SEC-010 | AC-SEC-010-1 | repo-wide | T-SEC-010-1 | VERIFIED (governance secret/user-path scan clean; best-effort) |
| BCR-001 | AC-BCR-001-1 | `manifest.chromium.json` | T-BCR-001-1 | IMPLEMENTED (MV3 manifest valid JSON; browser validation NOT VERIFIED) |
| BCR-002 | AC-BCR-002-1 | `manifest.firefox.json`, `scripts/build-extension.py` | T-BCR-002-1 | IMPLEMENTED (Firefox package built; Firefox load NOT VERIFIED — Firefox not installed) |
| BCR-003 | AC-BCR-003-1 | `src/shared/browser-api.js`, `src/background`, `src/content` | T-BCR-003-1, T-BCR-003-2 | IMPLEMENTED (feature detection + no-receiver/protected-page degradation unit-tested; live degradation NOT VERIFIED) |
| BCR-004 | AC-BCR-004-1 | (process, docs) | T-BCR-004-1 | NOT VERIFIED (no per-browser executed check yet) |
