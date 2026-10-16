# AGENTS.md — Cross-Browser AI Screen Assistant

This file is the root operating contract for every AI agent working in this
repository. Read it first, every session. It is intentionally short; detailed
procedures live in `docs/` and in the project skills under `.opencode/skills/`.

## 1. Project identity

- **Name:** Cross-Browser AI Screen Assistant
- **Purpose:** A cross-browser extension that lets a user select text on a page
  and receive an AI-generated answer/explanation in a floating panel, with
  optional user-authorized OCR as a later capability.
- **Project directory (single working root):**
  `/Users/hasalashehan/Documents/GitHub/cross-browser-ai-screen-assistant`
- **Repository boundary:** All project work stays inside the directory above.
  Never modify sibling projects under `Documents/GitHub/`.

## 2. Source of truth

- Approved product requirements: `docs/requirements/requirements.md`
- Acceptance criteria: `docs/requirements/acceptance-criteria.md`
- Requirement change history: `docs/requirements/requirements-change-log.md`
- Architecture: `docs/architecture/`
- Traceability: `docs/quality/traceability-matrix.md`
- Workflow: `docs/development/workflow.md`
- Definition of Done: `docs/development/definition-of-done.md`
- Skill catalog: `docs/development/skill-catalog.md`

If code and these documents disagree, the documents are the reference and the
disagreement is a defect to be reported and fixed, not silently ignored.

## 3. Mandatory workflow for every request

Every request follows `docs/development/workflow.md`:

```
INTAKE → ANALYSIS → SKILL SELECTION → IMPACT ANALYSIS → SPECIFICATION
→ APPROVAL WHEN REQUIRED → IMPLEMENTATION → TESTING
→ SECURITY REVIEW WHEN RELEVANT → DOCUMENTATION SYNC
→ TRACEABILITY UPDATE → FINAL REPORT
```

Stages may collapse for trivial, non-behavioural edits, but **specification,
testing, and documentation sync must not be skipped when the task materially
affects behaviour, security, compatibility, architecture, or acceptance
criteria.**

## 4. Skill discovery and use

Skills are real opencode skills discovered from `.opencode/skills/<name>/SKILL.md`.
They are loaded with opencode's skill tool; the model selects them by matching
the task to each skill's `description` trigger keywords. The catalog and trigger
table are in `docs/development/skill-catalog.md`.

Selection guidance:

| Task intent | Skills to load |
| --- | --- |
| New feature | requirement-management, architecture-design (if boundary/decision), browser-extension-development, testing-and-verification, documentation-sync |
| Requirement change | requirement-management, architecture-design (if design impact), affected implementation skill, testing-and-verification, documentation-sync |
| Bug fix | relevant implementation skill, testing-and-verification, documentation-sync (if behaviour/doc changes) |
| Security-sensitive change | secure-development + relevant implementation + testing-and-verification |
| Refactoring | architecture-design (if boundaries), implementation skill, testing-and-verification |
| Docs-only | documentation-sync (+ requirement-management if requirements affected) |
| Release/GitHub prep | github-workflow, testing-and-verification |

The agent **must actually invoke** the skill-loading mechanism. If a required
skill cannot be loaded, say so explicitly and do not pretend it was used.

## 5. Handling task types

- **New feature:** add/modify FR/NFR/SEC IDs, write acceptance criteria, add an
  ADR when a boundary or technology decision is involved, implement, test, sync.
- **Bug fix:** identify the violated requirement/acceptance criterion, fix,
  add a regression test, update the traceability status.
- **Refactor:** preserve all requirement behaviour; record architectural changes
  in an ADR; run regression tests.
- **Security change:** always load `secure-development`; document the changed
  threat surface, permissions, and controls.
- **Requirement change:** never silently rewrite an approved requirement. Add a
  record to `requirements-change-log.md`, bump the requirement version, and
  re-verify.

## 6. Traceability

Every requirement must be traceable:
`Requirement ID → Acceptance Criteria → Implementation component → Test ID → Status`.
Update `docs/quality/traceability-matrix.md` whenever any link changes. Never
mark a requirement `VERIFIED` without evidence (a passing, named test/check).

Status vocabulary: `PROPOSED`, `APPROVED`, `IMPLEMENTED`, `VERIFIED`,
`NOT VERIFIED`, `DEFERRED`, `DEPRECATED`, `REJECTED`.

## 7. Documentation synchronization

Any change to behaviour, interfaces, permissions, or requirements must update
the affected documents in the same task. A documentation edit alone does **not**
prove a requirement is implemented or verified.

## 8. Testing and verification

- Derive tests from acceptance criteria (`docs/quality/test-strategy.md`).
- Run the project's actual checks; report real output.
- A passing test does not prove cross-browser compatibility.
- If a check cannot be run, record `NOT VERIFIED` and explain why.
- Governance validation command: `python3 scripts/governance-check.py`
  (run from the repo root).

## 9. Security and privacy constraints

- Least-privilege browser permissions; justify every permission in a requirement.
- Never place API credentials/secrets in extension code; use a backend proxy.
- Treat all web page content as untrusted input; never execute selected text.
- Do not collect or retain page content beyond the active user action.
- No bypass of browser or site security controls; no protected-content circumvention.
- Sensitive capture (screenshots/OCR) requires explicit user action.
- No secrets, tokens, private keys, or personal information in the repo beyond
  the documented mandatory project directory path (SEC-010).
- Document security assumptions and limitations in `docs/architecture/security-architecture.md`.

## 10. Destructive operations and Git

- Inspect `git status` before any Git operation.
- Never run destructive commands (`rm -rf`, `git reset --hard`, force push,
  history rewrites) without explicit human approval.
- Never create a remote repository or push/publish without explicit permission.
- Do not init Git in a parent directory; the repo root is this project directory.
- Do not commit unless explicitly asked.

## 11. Reporting failures and incomplete work

- Report honestly: what ran, what passed, what failed, what was skipped.
- Use `NOT VERIFIED` rather than implying success.
- Surface blockers, missing information, and assumptions explicitly.

## 12. When user approval is required

Request approval before: changing approved requirement scope, adding browser
permissions, changing trust/data-flow architecture, adding dependencies with
privacy/security impact, destructive operations, or any remote/GitHub action.
Small implementation details already covered by approved requirements do not
need separate approval.
