---
name: requirement-management
description: Use when a request adds, changes, or removes product requirements or acceptance criteria, manages FR/NFR/SEC/BCR IDs, scope, versions, or the requirements change log for the Cross-Browser AI Screen Assistant. Triggers include "new requirement", "requirement change", "acceptance criteria", "FR-", "NFR-", "SEC-", "change log", "scope", "spec".
---

# Skill: requirement-management

Maintain the canonical requirements baseline and its change history. This skill
owns the specification side of the lifecycle (INTAKE → SPECIFICATION → change
log → traceability handoff).

## When to use

- A request introduces, modifies, defers, or removes product behaviour,
  security, compatibility, or acceptance criteria.
- A requirement's status or version must change.
- Acceptance criteria need to be written or updated for a requirement.
- You must decide whether a request needs a new requirement or is covered by an
  existing one.

## Required reference documents

- `docs/requirements/requirements.md`
- `docs/requirements/acceptance-criteria.md`
- `docs/requirements/requirements-change-log.md`
- `docs/quality/traceability-matrix.md`
- `docs/architecture/architecture-decisions.md` (if design impact)

## Inputs

- The natural-language request.
- Current requirements baseline and change log.

## Step-by-step workflow

1. **Classify.** Decide: new requirement, requirement modification, requirement
   removal/deferral, bug fix, or implementation-only task. State your choice.
2. **Check coverage.** Search `requirements.md` for an existing ID that already
   covers the request. If covered, do not invent a duplicate — cite the ID.
3. **Assign IDs.** New requirements get the next free ID in the correct prefix:
   `FR-`, `NFR-`, `SEC-`, `BCR-`. Never reuse or renumber existing IDs.
4. **Write the requirement.** One requirement = one testable statement. No
   implementation detail; state the observable outcome.
5. **Write acceptance criteria.** In `acceptance-criteria.md`, add
   `AC-<REQ-ID>-<n>` given/when/then criteria.
6. **Record the change.** For any change to an approved requirement, add a record
   to `requirements-change-log.md` (never overwrite the old text). Bump the
   requirement version.
7. **Hand off impact.** List impacted components, permissions, tests, and
   documents for IMPACT ANALYSIS; hand the tests to testing-and-verification.
8. **Update status/version** fields in `requirements.md`.
9. **Do not mark IMPLEMENTED/VERIFIED.** Only testing evidence does that.

## Outputs

- Updated `requirements.md`, `acceptance-criteria.md`,
  `requirements-change-log.md`.
- A concise impact list for the next stage.

## Validation requirements

- Every requirement has ≥1 acceptance criterion.
- IDs are unique, well-formed, and stable.
- No approved requirement text is silently rewritten.
- Every approved change has a change-log record.

## When information is missing

Ask the user (via the question tool) for: the intended behaviour, the affected
browsers, and whether the change is in or out of MVP scope. Do not guess at
security or scope; a wrong assumption changes the baseline. If the request is
ambiguous between two IDs, present both and ask.

## Documents that must be updated

- `docs/requirements/requirements.md`
- `docs/requirements/acceptance-criteria.md`
- `docs/requirements/requirements-change-log.md`
- `docs/quality/traceability-matrix.md` (links for new/changed IDs)

## Conditions requiring user approval

- Changing approved requirement scope.
- Adding/removing browser permissions.
- Adding or deferring requirements that change the MVP boundary.
