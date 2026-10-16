# Product Requirements — Cross-Browser AI Screen Assistant

- **Document ID:** REQ
- **Specification version:** 1.0.0
- **Status:** Approved (foundation baseline)
- **Owner:** Project maintainer
- **Last updated:** 2026-10-17

This document is the canonical specification of approved product requirements.
It is the single source of truth referenced by `AGENTS.md`. Any change to an
approved requirement must be recorded in
`docs/requirements/requirements-change-log.md`; approved requirements are never
silently rewritten or removed.

Status vocabulary: `PROPOSED`, `APPROVED`, `IMPLEMENTED`, `VERIFIED`,
`NOT VERIFIED`, `DEFERRED`, `DEPRECATED`, `REJECTED`.

> **Scope note for this baseline:** Only requirements that are approved are
> listed as `APPROVED`. None are `IMPLEMENTED` or `VERIFIED` yet — the project
> is at the governance-foundation stage. Features marked `DEFERRED` are planned
> but explicitly out of scope for the initial MVP.

## 1. Product vision and scope

**Vision.** Give users a fast, private, cross-browser way to highlight text on
any supported web page and receive an AI-generated explanation or answer in a
floating panel, without leaving the page and without surrendering control over
what data leaves their browser.

**MVP scope (Phase 1).** A minimal extension that installs and loads in the
supported browsers, exposes a toolbar popup, allows the user to explicitly turn
the assistant on/off, detects a text selection on a supported page, and shows
a floating panel that echoes the selected text locally (no AI call yet).

**Explicitly out of scope for the MVP.** AI model calls, OCR, screenshot
capture, backend services, accounts, billing, history, and any transmission of
page content to third parties.

## 2. Target users and browser targets

- **Primary users:** knowledge workers, students, and researchers who read dense
  web content and want quick explanations.
- **Supported browsers (target):** Chromium-family browsers (Chrome, Edge,
  Brave) and Firefox, current stable and one previous major version.
- **Non-targets (for now):** Safari, mobile browsers.

See `BCR-*` requirements in section 6.

## 3. Functional requirements (FR)

| ID | Requirement | Status | Version |
| --- | --- | --- | --- |
| FR-001 | The extension installs and loads successfully in every supported browser using the manifest appropriate to that browser family. | APPROVED | 1.0.0 |
| FR-002 | The extension provides a toolbar popup that shows the assistant's current state and primary controls. | APPROVED | 1.0.0 |
| FR-003 | The user can explicitly activate and deactivate the assistant; when inactive, the extension does not observe page selections. | APPROVED | 1.0.0 |
| FR-004 | When active, the extension detects the user's current text selection on a supported web page. | APPROVED | 1.0.0 |
| FR-005 | The extension displays a floating answer panel near the selection or in a non-intrusive fixed position. | APPROVED | 1.0.0 |
| FR-006 | The floating panel can be dismissed by the user and does not permanently alter the host page. | APPROVED | 1.0.0 |
| FR-007 | The MVP floating panel displays the captured selection text locally; no network request is made. | APPROVED | 1.0.0 |
| FR-008 | The user can request an AI-generated answer/explanation for the selected text, delivered through a secure service, not from the extension directly. | DEFERRED (Phase 2) | 1.0.0 |
| FR-009 | The extension supports optional OCR on user-authorized screen capture flows. | DEFERRED (Phase 3) | 1.0.0 |
| FR-010 | The extension persists minimal user preferences (e.g., active/inactive default) using browser-provided storage only. | APPROVED | 1.0.0 |

## 4. Non-functional requirements (NFR)

| ID | Requirement | Status | Version |
| --- | --- | --- | --- |
| NFR-001 | Panel display latency after a selection is under 200 ms on a typical page, excluding any network time. | APPROVED | 1.0.0 |
| NFR-002 | The extension adds no blocking work to page load; content scripts are lightweight and event-driven. | APPROVED | 1.0.0 |
| NFR-003 | The codebase is maintainable: modular, documented, and consistent with the architecture documents. | APPROVED | 1.0.0 |
| NFR-004 | A single codebase produces builds for all supported browsers. | APPROVED | 1.0.0 |
| NFR-005 | The extension degrades gracefully: a failure in the panel, selection handling, or future service must never break the host page. | APPROVED | 1.0.0 |
| NFR-006 | The extension has no dependency on a remote service for its MVP functionality. | APPROVED | 1.0.0 |
| NFR-007 | The extension's popup and panel are usable via keyboard and expose appropriate ARIA roles. | APPROVED | 1.0.0 |

## 5. Security and privacy requirements (SEC)

| ID | Requirement | Status | Version |
| --- | --- | --- | --- |
| SEC-001 | The extension requests the least-privilege permissions needed for MVP behaviour; every permission is justified by a requirement. | APPROVED | 1.0.0 |
| SEC-002 | No API credentials, tokens, or secrets are ever placed in extension code or configuration distributed to clients. | APPROVED | 1.0.0 |
| SEC-003 | The extension does not collect or retain page content beyond the active user action; captured text is held in memory only for the lifetime of the panel. | APPROVED | 1.0.0 |
| SEC-004 | All web page content, including selected text, is treated as untrusted input. | APPROVED | 1.0.0 |
| SEC-005 | Selected text is never executed as code, HTML, or a script; it is inserted into the DOM as text only. | APPROVED | 1.0.0 |
| SEC-006 | The extension does not bypass browser or site security controls and does not access protected content. | APPROVED | 1.0.0 |
| SEC-007 | Any future screenshot or OCR capture requires an explicit, per-action user gesture. | APPROVED | 1.0.0 |
| SEC-008 | Any future backend communication uses HTTPS with authenticated, revocable credentials held server-side. | APPROVED | 1.0.0 |
| SEC-009 | No telemetry, analytics, or page content is transmitted without explicit user consent. | APPROVED | 1.0.0 |
| SEC-010 | Repository contents contain no secrets, private keys, tokens, or personal information beyond the documented mandatory project directory path. | APPROVED | 1.0.0 |

## 6. Browser compatibility requirements (BCR)

| ID | Requirement | Status | Version |
| --- | --- | --- | --- |
| BCR-001 | The extension targets Manifest V3 semantics for Chromium-family browsers. | APPROVED | 1.0.0 |
| BCR-002 | The extension provides a Firefox-compatible manifest (browser-prefixed APIs / polyfill as required). | APPROVED | 1.0.0 |
| BCR-003 | Unsupported or partially supported APIs degrade gracefully rather than throwing. | APPROVED | 1.0.0 |
| BCR-004 | Compatibility claims are only marked VERIFIED after a named, executed check on the specific browser version. | APPROVED | 1.0.0 |

## 7. Dependencies and assumptions

- **Assumptions**
  - Users install the extension through a browser's standard loading mechanism
    (unpacked for development, store listing for release).
  - Pages the user selects text on are ordinary HTML pages; protected pages
    (browser internal pages, PDF viewers, cross-origin iframes) may not support
    selection detection and are documented as limitations.
  - Node.js is available for development tooling (verified: Node v24).
  - Python 3 is available for governance scripts (verified: Python 3.13).
- **Dependencies (to be confirmed by ADR before use):** a cross-browser
  polyfill, a build/bundling approach, and (Phase 2) a backend proxy.

## 8. Acceptance criteria

Testable acceptance criteria for every requirement above are maintained in
`docs/requirements/acceptance-criteria.md` with IDs of the form
`AC-<REQUIREMENT-ID>-<n>`.

## 9. Limitations and out-of-scope features

- No AI, OCR, screenshot capture, backend, or external transmission in the MVP.
- No Safari or mobile support.
- No account system, sync, or cloud history.
- No content on pages that forbid content scripts or that the user has not
  explicitly activated the assistant on.

See `docs/quality/known-limitations.md` for the maintained list.

## 10. Requirement status and version information

- All requirements in this document are at specification version **1.0.0** and
  status **APPROVED** unless a row states otherwise.
- Implementation and verification status is tracked in
  `docs/quality/traceability-matrix.md`.
- Changes are tracked in `docs/requirements/requirements-change-log.md`.
