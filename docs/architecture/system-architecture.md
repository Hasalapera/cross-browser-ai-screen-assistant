# System Architecture — Cross-Browser AI Screen Assistant

- **Document ID:** ARCH
- **Version:** 1.0.0
- **Status:** Approved baseline
- **Last updated:** 2026-10-17
- **Related:** `docs/architecture/security-architecture.md`,
  `docs/architecture/architecture-decisions.md`

## 1. Overview

The extension is a browser extension composed of three runtime contexts:

1. **Popup** — the toolbar UI that shows assistant state and primary controls.
2. **Background (service worker in MV3 / background scripts in Firefox)** — the
   coordination layer that owns assistant state and persists preferences.
3. **Content script** — injected into supported pages; observes text selection
   only while the assistant is active, and renders the floating panel in the
   page's DOM (via a shadow root for isolation).

The MVP performs **no** network access. Text captured by the content script is
forwarded to the popup/panel context for local display only.

## 2. Component responsibilities

| Component | Responsibility | Must not do |
| --- | --- | --- |
| Popup | Show state; activate/deactivate; basic settings | Access arbitrary page DOM |
| Background | Own activation state; read/write preferences; route messages | Hold secrets; render page content |
| Content script | Detect selection when active; render/dismiss panel; contain errors | Run always; alter host page beyond its panel; execute selected text |
| Panel (in content script, shadow DOM) | Display selected text as text; dismiss | Use `innerHTML` with untrusted text |

## 3. Data flows (MVP)

```
User selects text
   → Content script listener (only if active)
     → capture selection string
       → render in floating panel (shadow DOM, textContent)
       → (no storage, no network)
User toggles active in Popup
   → send message to Background
     → Background updates state + persists preference
       → Background notifies Content script(s)
```

Captured text never leaves the render path; it is not logged, stored, or sent.

## 4. Browser boundaries and ports

- The extension runs across the browser's process boundary: popup and
  background in the extension process, content script in the page's process.
- Cross-context communication uses the browser messaging API only.
- The content script is isolated from the page's JavaScript world
  (isolated world), which is relied upon for SEC-004/SEC-005.
- A shadow root isolates the panel's styles/DOM from the host page (NFR-005,
  FR-006).

## 5. Trust boundaries

| Zone | Trust | Notes |
| --- | --- | --- |
| Host page content | Untrusted | source of selections and DOM |
| Content script | Trusted code, untrusted input | must treat all page data as hostile |
| Extension popup/background | Trusted | ships with the extension |
| Future backend service | Semi-trusted | Phase 2; holds credentials server-side |

See `security-architecture.md` for controls per boundary.

## 6. AI integration options (Phase 2, deferred)

Options considered (recorded in ADRs when Phase 2 starts):

1. **Backend proxy (preferred).** Extension calls an owned backend over HTTPS;
   the backend holds provider credentials. Satisfies SEC-002/SEC-008.
2. **Direct provider call from extension.** Rejected: requires a client-held
   secret (violates SEC-002) or per-user keys with poor UX.
3. **On-device model.** Considered later; heavy download, limited reach.

No integration is implemented in the MVP.

## 7. OCR options (Phase 3, deferred)

Options: browser-native APIs, WASM OCR (e.g., Tesseract.js), or server-side OCR.
All require explicit per-action user consent (SEC-007). Deferred pending ADR.

## 8. Permission requirements (MVP)

| Permission | Justification | Requirement |
| --- | --- | --- |
| `storage` | Persist activation preference | FR-010, AC-FR-010-1 |
| `activeTab` | Act on the current tab after a user gesture, avoiding broad host access | FR-003/FR-004 |

Broad host permissions (`<all_urls>`) are deliberately avoided for the MVP.
Content-script injection is scoped to user-authorized tabs via `activeTab`
and/or `scripting` with a user gesture, rather than persistent all-site access.
This may be revised by ADR when selection detection needs are validated.

## 9. Failure handling

- The content script wraps selection/panel logic in error containment; failures
  are reported to the background context and never thrown into the page
  (NFR-005, AC-NFR-005-1).
- If a browser API is unavailable, the extension disables the dependent feature
  instead of throwing (BCR-003).

## 10. Future extension points

- A service module boundary so the Phase 2 backend can be added behind a single
  interface.
- A capture/OCR module boundary for Phase 3.
- A build step that emits per-browser manifests from a shared source.
