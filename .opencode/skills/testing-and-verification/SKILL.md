---
name: testing-and-verification
description: Use when a change needs tests derived from acceptance criteria, needs checks or builds run, or needs honest reporting of pass/fail results and limitations for the Cross-Browser AI Screen Assistant. Triggers include "test", "verify", "verification", "acceptance criteria", "run checks", "regression", "evidence", "test strategy".
---

# Skill: testing-and-verification

Derive tests from acceptance criteria, run the project's checks, and report
real results — including what could not be verified.

## When to use

- Any change that affects behaviour needs verification.
- Acceptance criteria must be converted into tests.
- A bug fix needs a regression test.
- Final evidence must be collected for a report or release.

## Required reference documents

- `docs/quality/test-strategy.md`
- `docs/requirements/acceptance-criteria.md`
- `docs/quality/traceability-matrix.md`

## Inputs

- The acceptance criteria being verified.
- The available tooling (documented in `test-strategy.md`).

## Step-by-step workflow

1. **Read the criteria** for every affected requirement.
2. **Derive tests.** Each `AC-*` gets ≥1 test with ID `T-<REQ-ID>-<n>`. Prefer
   behaviour over implementation details.
3. **Pick the right level** (unit / integration / manual browser / governance)
   per `test-strategy.md`.
4. **Run the checks** that exist for this project and capture the real output.
   The standing checks are:
   - Governance/docs: `python3 scripts/governance-check.py`
   - Unit tests (when present): `node --test tests/`
5. **Interpret honestly.**
   - Pass → mark `VERIFIED` only for that named check on that browser/platform.
   - Fail → record the failure; do not fix silently without reporting it.
   - Cannot run → mark `NOT VERIFIED` with the reason (missing browser, missing
     tool, not applicable).
6. **Never over-claim.** A passing test does not prove cross-browser
   compatibility; a governance pass does not prove runtime correctness.
7. **Update traceability** statuses with evidence references.

## Outputs

- Tests (IDs mapped to ACs).
- Real command output and a truthful status per requirement.

## Validation requirements

- Every changed AC has a test ID present in the traceability matrix.
- Reported statuses match actual results.
- Cross-browser statuses are recorded per browser.

## When information is missing

If a check cannot be run (no browser installed, tool unavailable), record
`NOT VERIFIED` and state exactly why. Never imply a check passed because it
"should". If an AC is untestable as written, report it and request a clearer
criterion rather than writing a vacuous test.

## Documents that must be updated

- `docs/quality/traceability-matrix.md`
- `docs/quality/test-strategy.md` (if tooling/process changes)
- `docs/quality/known-limitations.md` (unverifiable areas)

## Conditions requiring user approval

- Adding test dependencies/tooling (privacy, supply-chain impact).
- Skipping a mandated check (must be approved and recorded).
