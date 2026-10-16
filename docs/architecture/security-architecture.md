# Security Architecture — Cross-Browser AI Screen Assistant

- **Document ID:** SEC-ARCH
- **Version:** 1.0.0
- **Status:** Approved baseline
- **Last updated:** 2026-10-17
- **Related:** `docs/requirements/requirements.md` (SEC-*), ADR-002

## 1. Security objectives

1. **Confidentiality** — page content and selections never leave the user's
   browser in the MVP; future transmission is explicit, consented, and proxied.
2. **Integrity** — the extension must not let untrusted page content execute.
3. **Least privilege** — minimal permissions, minimal host access.
4. **User control** — the user explicitly turns the assistant on; capture
   requires a gesture.
5. **No secrets in client** — credentials live server-side only.

## 2. Threat model

| ID | Threat | Boundary | Control | Requirement |
| --- | --- | --- | --- | --- |
| T-01 | Malicious page injects script through selected text | Host page → panel | Render as text nodes; never `innerHTML`/`eval` | SEC-004, SEC-005 |
| T-02 | Credential theft from extension code | Extension artifact | No secrets shipped; backend proxy | SEC-002, SEC-008 |
| T-03 | Silent data exfiltration of selections | Extension → network | No network in MVP; consent-gated later | SEC-003, SEC-009 |
| T-04 | Over-broad host access to all sites | Manifest | `activeTab` + user gesture, no `<all_urls>` in MVP | SEC-001 |
| T-05 | Capture of protected/sensitive content | Content script | Do not run on protected pages; no bypass | SEC-006, SEC-007 |
| T-06 | Extension breaks host page | Content script | Shadow DOM isolation + error containment | NFR-005 |
| T-07 | Secrets/personal paths committed to repo | Repository | Governance scan + `.gitignore` | SEC-010 |

## 3. Trust boundaries and controls

- **Host page → content script:** all incoming data untrusted. Selected text is
  an opaque string; DOM insertion uses `textContent`. No dynamic evaluation.
- **Content script ↔ background/popup:** browser messaging only; message
  payloads are validated (type-checked, length-bounded).
- **Extension → future backend:** HTTPS, authenticated, server-held revocable
  credentials, no client secrets, explicit consent per data flow (Phase 2).

## 4. Permission model

The MVP requests exactly `storage`, `activeTab`, and `scripting`, declared per
`system-architecture.md` §8; each maps to a requirement (`storage` → FR-010;
`activeTab` → FR-003/FR-004; `scripting` → FR-003/FR-004). `scripting` is used
only to inject the content script into the active tab on explicit user
activation, so the extension does **not** declare a persistent all-sites content
script and requests no host permissions. Adding a permission expands the attack
surface (T-04), so it requires user approval (AGENTS.md §12) and a change-log
record; the `scripting` addition is recorded as RCL-001 in
`docs/requirements/requirements-change-log.md`.

## 5. Data handling and retention

- Selected text: in-memory only for the panel lifetime; never stored, logged,
  or transmitted in the MVP (SEC-003, AC-SEC-003-1).
- Preferences: browser storage, non-sensitive (FR-010).
- No telemetry or analytics of any kind in the MVP (SEC-009).

## 6. Sensitive capture (Phase 3)

Screenshots/OCR require an explicit user gesture per action, operate only on the
captured region, and must not circumvent browser or site protections (SEC-006,
SEC-007). Design deferred pending ADR.

## 7. Security assumptions and limitations

- Isolation of content scripts from the page's JS world is assumed and relied
  upon; if a platform changes this, the threat model must be revisited.
- The extension cannot inspect browser-internal pages, PDF viewers, or
  cross-origin iframe content; it must fail closed rather than attempt workarounds.
- A passing test does not prove the absence of vulnerabilities; this document
  records the *designed* controls, not a full security audit.
- No penetration test or third-party audit has been performed: status
  `NOT VERIFIED` for runtime security behaviour.

## 8. Secrets management

- No secrets in the repository, extension code, or distributed configuration.
- Future backend credentials are stored in the backend environment, never in the
  client. `.gitignore` excludes common secret and environment files.
- SEC-010 is checked by `scripts/governance-check.py` (best-effort static scan;
  it cannot prove the absence of all secrets — see its documented limitations).
