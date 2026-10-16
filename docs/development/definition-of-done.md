# Definition of Done — Cross-Browser AI Screen Assistant

- **Document ID:** DOD
- **Version:** 1.0.0
- **Last updated:** 2026-10-17

A task is Done only when **all** applicable items below are true. "Not
applicable" must be stated explicitly with a reason; silence is not an exemption.

## 1. Scope and specification

- [ ] The task type is identified and the correct skills were actually loaded
      (or the inability to load them is reported).
- [ ] Impacted requirements, components, permissions, tests, and documents are
      listed.
- [ ] Behaviour changes are specified with testable acceptance criteria.
- [ ] Required approvals were obtained before implementation (AGENTS.md §12).

## 2. Implementation

- [ ] Only the approved scope was implemented.
- [ ] Code follows the architecture documents and existing conventions.
- [ ] No secrets, tokens, or personal machine paths were introduced.
- [ ] Selected page text is never executed or injected as markup (SEC-004/005).

## 3. Testing and verification

- [ ] Every new/changed acceptance criterion has a named test or check.
- [ ] The relevant checks were actually run and real output recorded.
- [ ] Failures that cannot be resolved are recorded, not hidden.
- [ ] Unrunnable checks are marked `NOT VERIFIED` with a reason.
- [ ] Cross-browser claims are verified per browser (BCR-004) or marked
      unverified.

## 4. Documentation and traceability

- [ ] Every impacted document was updated in the same task.
- [ ] `requirements-change-log.md` records any approved requirement change.
- [ ] `traceability-matrix.md` reflects truthful statuses.
- [ ] `known-limitations.md` updated if a limitation changed.

## 5. Governance and report

- [ ] `python3 scripts/governance-check.py` passes (or its failures are
      explained and tracked).
- [ ] The final report lists changed files, tests run, pass/fail, and remaining
      limitations.

## 6. Explicitly not part of Done

- A documentation edit is not proof of implementation.
- A passing test is not proof of cross-browser compatibility.
- A green governance check is not proof of security or runtime correctness.
