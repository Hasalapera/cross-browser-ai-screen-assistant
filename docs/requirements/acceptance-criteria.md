# Acceptance Criteria — Cross-Browser AI Screen Assistant

- **Document ID:** AC
- **Version:** 1.0.0
- **Status:** Approved (foundation baseline)
- **Last updated:** 2026-10-17
- **Canonical source:** `docs/requirements/requirements.md`

Each criterion is testable (given / when / then) and referenced by the
traceability matrix. IDs follow `AC-<REQUIREMENT-ID>-<n>`. A requirement is only
`VERIFIED` when every one of its criteria has a passing, named test or check.

## FR-001 — Cross-browser installation
- **AC-FR-001-1** Given a supported Chromium browser, when the built MV3 package
  is loaded unpacked, then the extension appears with no manifest errors.
- **AC-FR-001-2** Given Firefox, when the Firefox build is loaded, then the
  extension appears with no manifest errors.

## FR-002 — Toolbar popup
- **AC-FR-002-1** When the user clicks the toolbar icon, then a popup opens
  showing current assistant state and an activate/deactivate control.

## FR-003 — Explicit activation/deactivation
- **AC-FR-003-1** Given the assistant is inactive, when the user activates it,
  then the state reflects active and selections are observed.
- **AC-FR-003-2** Given the assistant is active, when the user deactivates it,
  then the extension stops observing page selections.
- **AC-FR-003-3** Given a fresh install, the assistant is inactive by default.

## FR-004 — Selection detection
- **AC-FR-004-1** Given the assistant is active, when the user selects text on a
  supported page, then the extension captures the selected string.
- **AC-FR-004-2** Given the assistant is inactive, when the user selects text,
  then no capture occurs.

## FR-005 — Floating panel
- **AC-FR-005-1** Given a captured selection, when capture completes, then a
  floating panel is displayed within 200 ms (excluding network).
- **AC-FR-005-2** The panel does not obscure the selected text by default.

## FR-006 — Panel dismissal and page integrity
- **AC-FR-006-1** When the user dismisses the panel, then it is removed and the
  host page's own DOM/behavior is unchanged apart from the removed panel nodes.

## FR-007 — Local-only MVP display
- **AC-FR-007-1** Given a captured selection, when the panel renders, then the
  selected text appears as plain text and no network request is issued by the
  extension.

## FR-008 — AI answer via secure service (Phase 2)
- **AC-FR-008-1** Given the assistant is active and a selection exists, when the
  user requests an answer, then the request is sent only to the approved secure
  service and the response is rendered in the panel. *(Deferred: not in MVP.)*
- **AC-FR-008-2** The extension never calls an AI provider directly with a
  client-held secret. *(Deferred: not in MVP.)*

## FR-009 — Optional OCR (Phase 3)
- **AC-FR-009-1** Given the user invokes screen capture, when they grant consent
  for the specific action, then OCR is performed on the captured region only.
  *(Deferred: not in MVP.)*
- **AC-FR-009-2** No capture occurs without an explicit per-action user gesture.
  *(Deferred: not in MVP.)*

## FR-010 — Preferences persistence
- **AC-FR-010-1** Given the user changes a preference, when the browser session
  is restarted, then the preference persists via browser storage.
- **AC-FR-010-2** Only preference data (not page content) is persisted.

## NFR-001 — Panel latency
- **AC-NFR-001-1** A timed check shows panel display within 200 ms of a capture
  event on a representative page, excluding network time.

## NFR-002 — No blocking page-load work
- **AC-NFR-002-1** The content script registers listeners and returns without
  synchronous long tasks; a performance check shows no long task attributable to
  the extension at page load.

## NFR-003 — Maintainability
- **AC-NFR-003-1** Every source module has a documented purpose; the repo passes
  its documentation-consistency check.

## NFR-004 — Single codebase, multi-browser builds
- **AC-NFR-004-1** One documented build command produces both the Chromium and
  Firefox artifacts from the same source tree.

## NFR-005 — Graceful degradation
- **AC-NFR-005-1** Given a simulated failure in selection handling or panel
  rendering, when the error occurs, then the host page remains functional and
  the error is contained (reported, not thrown into the page).

## NFR-006 — No remote dependency for MVP
- **AC-NFR-006-1** With networking disabled, all MVP functionality still works.

## NFR-007 — Accessibility
- **AC-NFR-007-1** The popup and panel are fully operable by keyboard, and
  interactive elements expose accessible names/roles.

## SEC-001 — Least privilege
- **AC-SEC-001-1** The manifest lists only permissions that map to a requirement
  in `requirements.md`, and each is documented in the security architecture.

## SEC-002 — No client-side secrets
- **AC-SEC-002-1** A repository scan finds no API keys, tokens, or secrets in
  extension code or distributed configuration.

## SEC-003 — Minimal retention
- **AC-SEC-003-1** Captured text is held only in memory for the panel lifetime
  and is not written to storage, logs, or any remote endpoint in the MVP.

## SEC-004 — Untrusted input
- **AC-SEC-004-1** Selection text is handled as an opaque string and never
  parsed as markup or code.

## SEC-005 — No code execution of selected text
- **AC-SEC-005-1** Rendered selection text uses text nodes / `textContent`, not
  `innerHTML`, and is never passed to `eval`, `Function`, or script injection.

## SEC-006 — No security-control bypass
- **AC-SEC-006-1** The extension does not run on browser-protected pages and
  does not attempt to circumvent site protections.

## SEC-007 — Sensitive capture consent
- **AC-SEC-007-1** Any screenshot/OCR path requires an explicit user gesture per
  action. *(Applies from Phase 3.)*

## SEC-008 — Secure backend communication
- **AC-SEC-008-1** Any backend call uses HTTPS and server-held, revocable
  credentials. *(Applies from Phase 2.)*

## SEC-009 — No consentless telemetry
- **AC-SEC-009-1** The extension transmits nothing until the user consents; a
  network trace shows no outbound calls in the MVP.

## SEC-010 — Clean repository
- **AC-SEC-010-1** The governance scan finds no secrets or personal information
  in tracked files beyond the documented mandatory project directory path.

## BCR-001 — Chromium Manifest V3
- **AC-BCR-001-1** The Chromium build declares an MV3 `"manifest_version": 3`
  manifest that validates without errors.

## BCR-002 — Firefox compatibility
- **AC-BCR-002-1** The Firefox build uses a Firefox-compatible manifest and
  browser API surface and loads without errors in Firefox.

## BCR-003 — Graceful degradation on missing APIs
- **AC-BCR-003-1** Given an API unavailable in the current browser, when the
  extension would use it, then the dependent feature is disabled/reported rather
  than throwing an uncaught error.

## BCR-004 — Evidence-based compatibility claims
- **AC-BCR-004-1** Any compatibility status in the traceability matrix cites a
  named, executed check on a specific browser version, or is `NOT VERIFIED`.
