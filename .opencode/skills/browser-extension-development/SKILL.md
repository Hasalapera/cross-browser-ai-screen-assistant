---
name: browser-extension-development
description: Use when implementing or changing browser-extension code for the Cross-Browser AI Screen Assistant — manifest configuration, MV3 service worker, content scripts, popup, message passing, storage, or cross-browser (Chrome/Firefox/Edge) compatibility. Triggers include "manifest", "MV3", "content script", "popup", "background", "service worker", "chrome.* / browser.*", "polyfill", "cross-browser", "extension".
---

# Skill: browser-extension-development

Apply browser-extension standards and cross-browser correctness to implementation
and review.

## When to use

- Writing or reviewing manifest, popup, background, or content-script code.
- Changing permissions, content-script registration, or the message protocol.
- Addressing Chrome/Firefox API differences or MV3 specifics.
- Debugging extension runtime behaviour.

## Required reference documents

- `docs/architecture/system-architecture.md`
- `docs/architecture/architecture-decisions.md` (ADR-001, ADR-003)
- `docs/requirements/requirements.md` (FR-*, BCR-*)
- Browser extension reference docs for the target API

## Inputs

- The feature/fix being built or reviewed.
- Target browsers (Chromium MV3, Firefox MV3).

## Step-by-step workflow

1. **Confirm the requirement IDs** the code must satisfy.
2. **Choose the manifest target.** Chromium MV3 for Chrome/Edge; produce the
   Firefox-adjusted variant (background type, `browser` namespace/polyfill).
3. **Respect MV3 constraints.** Service worker background, no persistent
   background, event-driven lifecycle, DOM in the service worker disallowed.
4. **Scope content scripts least-privilege.** Prefer `activeTab` +
   user-gesture injection over persistent `<all_urls>` (SEC-001).
5. **Isolate the panel.** Render in a shadow root; insert selected text as text
   nodes only (SEC-004/005, NFR-005).
6. **Use one API surface.** Call through a browser-agnostic layer; detect and
   degrade on missing APIs (BCR-003).
7. **Validate message protocol.** Typed, validated, length-bounded messages
   between content, background, and popup.
8. **Persist only preferences** in `storage` (FR-010, SEC-003).
9. **Contain errors** so host-page behaviour is never broken (NFR-005).
10. **Check compatibility claims** per browser; mark `NOT VERIFIED` unless run
    on that browser (BCR-004).

## Outputs

- Extension source consistent with the architecture docs.
- A list of the acceptance criteria the code is meant to satisfy.

## Validation requirements

- Manifest parses; only justified permissions present.
- No page content executed or injected as HTML.
- Cross-browser differences handled or explicitly flagged.
- Governance check passes (`python3 scripts/governance-check.py`).

## When information is missing

If a browser API's availability differs between targets, do not assume — verify
against the target browser docs or record `NOT VERIFIED`. If the required
permission is not obviously justified, ask before adding it.

## Documents that must be updated

- `docs/architecture/system-architecture.md` (if component/data flow changes)
- `docs/quality/traceability-matrix.md` (implementation component links)
- `docs/architecture/architecture-decisions.md` (if a platform/toolchain choice
  changes)

## Conditions requiring user approval

- Adding a manifest permission.
- Changing content-script injection scope (e.g., toward `<all_urls>`).
- Introducing a new build/dependency toolchain.
