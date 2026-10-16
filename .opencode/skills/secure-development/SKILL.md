---
name: secure-development
description: Use when a change touches browser permissions, data handling, secrets, credentials, trust boundaries, untrusted input, capture/OCR, or the security posture of the Cross-Browser AI Screen Assistant. Triggers include "security", "permission", "privacy", "secret", "credential", "threat model", "untrusted input", "XSS", "sanitize", "OCR consent", "data retention".
---

# Skill: secure-development

Apply security controls and review the threat surface for every security-relevant
change. Always load this skill in addition to the implementation and testing
skills for such changes.

## When to use

- Manifest permissions are added, removed, or re-scoped.
- Data is captured, stored, transmitted, or retained.
- Page content (untrusted input) is rendered or handled.
- Secrets/credentials/configuration are introduced.
- Screenshot/OCR capture flows are implemented.
- Any change to the trust or data-flow architecture.

## Required reference documents

- `docs/architecture/security-architecture.md`
- `docs/architecture/system-architecture.md` (§ permission requirements)
- `docs/requirements/requirements.md` (SEC-* and AC mapping)
- `docs/architecture/architecture-decisions.md` (ADR-002 backend proxy)

## Inputs

- The proposed change (diff, behaviour, or design).
- The current threat model and permission model.

## Step-by-step workflow

1. **Classify the change's security relevance:** permissions, data flow, input
   handling, secrets, or capture.
2. **Check the threat model.** For the change, confirm which threats (T-01..T-07)
   apply and how the change interacts with them.
3. **Verify controls:**
   - Least privilege: does any new permission map to a requirement? (SEC-001)
   - No client secrets anywhere. (SEC-002)
   - Retention: does the change store/transmit page content? Justify or remove.
     (SEC-003, SEC-009)
   - Untrusted input: text-only rendering, no `innerHTML`/`eval`/`Function`.
     (SEC-004, SEC-005)
   - No bypass of browser/site controls. (SEC-006)
   - Consent gesture for any capture. (SEC-007)
   - HTTPS + server-held credentials for any backend call. (SEC-008)
4. **Scan for secrets** before commit: run `python3 scripts/governance-check.py`
   and check that no tokens/keys/personal paths were introduced. (SEC-010)
5. **Document the outcome:** update `security-architecture.md` if the threat
   surface, permissions, or controls changed.
6. **Request approval** when permissions, privacy, or trust/data-flow changes are
   involved (AGENTS.md §12).

## Outputs

- Security review findings (issues found, controls applied, residual risk).
- Updated `security-architecture.md` when the threat surface changes.

## Validation requirements

- Every permission in the manifest maps to a stated requirement.
- No secrets in tracked files (governance scan clean or findings explained).
- No code path executes or injects page content as markup.

## When information is missing

Do not proceed with an ambiguous data flow. Ask the user what data leaves the
browser, to where, and under what consent. If a control's correctness cannot be
verified, mark it `NOT VERIFIED` rather than asserting it is safe.

## Documents that must be updated

- `docs/architecture/security-architecture.md`
- `docs/quality/known-limitations.md` (new/changed risk)
- `docs/requirements/requirements.md` / change log (if security scope changes)

## Conditions requiring user approval

- Any added browser permission.
- Any change to what data is collected, stored, or transmitted.
- Any new dependency that executes remote or user content.
