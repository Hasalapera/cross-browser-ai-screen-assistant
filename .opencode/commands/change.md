---
description: Run a complete requirement-driven change lifecycle for a natural-language change request.
---

# /change — Requirement-driven change lifecycle

Change request: $ARGUMENTS

Follow `docs/development/workflow.md` end-to-end for the request above. Do not
skip specification, testing, or documentation sync when the request materially
affects behaviour, security, compatibility, architecture, or acceptance
criteria.

## Procedure

1. **INTAKE & ANALYSIS** — Classify the request (new feature, requirement
   change, bug fix, refactor, security change, docs-only, release). Read
   `docs/requirements/requirements.md` and the relevant `docs/architecture/`
   documents first. Determine whether it changes behaviour, security,
   compatibility, architecture, or acceptance criteria.

2. **SKILL SELECTION** — Using the intent→skill table in
   `docs/development/skill-catalog.md` and `AGENTS.md` §4, actually invoke the
   skill tool to load the required skills for this request's intent. At minimum
   consider: requirement-management, architecture-design, secure-development,
   browser-extension-development, testing-and-verification, documentation-sync,
   github-workflow. If a required skill cannot be loaded, state that explicitly
   and continue with best effort — do not pretend it was used.

3. **IMPACT ANALYSIS** — Before editing any code, list impacted requirement
   IDs, acceptance criteria, implementation components, permissions, tests, and
   documents.

4. **SPECIFICATION** — State exactly what will change and how success is
   measured (acceptance criteria). Decide: new requirement, modification, bug
   fix, or implementation-only.

5. **APPROVAL IF REQUIRED** — If the change adds browser permissions, alters
   approved scope, changes trust/data-flow architecture, adds privacy/security
   dependencies, or is otherwise outside already-authorized requirements,
   request approval (AGENTS.md §12) and stop before implementing. Do not ask for
   approval for small details already covered by approved requirements.

6. **IMPLEMENT** — Only the approved scope.

7. **TEST** — Derive/run the relevant checks; record real output. Use
   `python3 scripts/governance-check.py` always, plus `node --test tests/` when
   tests exist. Mark anything unrunnable `NOT VERIFIED` with a reason.

8. **SECURITY REVIEW (when relevant)** — For permission, data-handling, secret,
   or capture changes, apply secure-development findings to
   `docs/architecture/security-architecture.md`.

9. **DOCUMENTATION SYNC** — Update every impacted document in the same task.

10. **TRACEABILITY UPDATE** — Update `docs/quality/traceability-matrix.md` with
    truthful statuses (never `VERIFIED` without evidence).

11. **FINAL REPORT** — Report changed files, requirement/ADR changes, skills
    loaded, tests run with pass/fail, and remaining limitations.
