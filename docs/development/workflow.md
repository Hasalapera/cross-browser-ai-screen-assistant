# Development Workflow — Cross-Browser AI Screen Assistant

- **Document ID:** WORKFLOW
- **Version:** 1.0.0
- **Last updated:** 2026-10-17
- **Contract:** referenced by `AGENTS.md`

## 1. The standard lifecycle

```
INTAKE
  → ANALYSIS
    → SKILL SELECTION
      → IMPACT ANALYSIS
        → SPECIFICATION
          → APPROVAL WHEN REQUIRED
            → IMPLEMENTATION
              → TESTING
                → SECURITY REVIEW WHEN RELEVANT
                  → DOCUMENTATION SYNC
                    → TRACEABILITY UPDATE
                      → FINAL REPORT
```

## 2. Stage definitions

| Stage | What happens | Can be collapsed? |
| --- | --- | --- |
| INTAKE | Restate the request; identify the task type (feature, bug, refactor, security, requirement change, docs, release). | No |
| ANALYSIS | Read canonical requirements and relevant architecture; determine whether behaviour/security/compat/acceptance criteria are affected. | No |
| SKILL SELECTION | Load the skills required by the task using opencode's skill tool (see `skill-catalog.md`). Report if a skill cannot be loaded. | Only when no skill applies (e.g., a trivial typo). |
| IMPACT ANALYSIS | List impacted requirements, components, permissions, tests, and documents **before** editing code. | Only for non-behavioural edits. |
| SPECIFICATION | State exactly what will change and how success will be measured (acceptance criteria). | **Not** when behaviour/security/compat/acceptance criteria are affected. |
| APPROVAL | Request approval for scope, permission, privacy, architecture, destructive, or remote changes (AGENTS.md §12). | Yes, when already authorized by approved requirements. |
| IMPLEMENTATION | Change only the approved scope. | No |
| TESTING | Run the checks that prove the acceptance criteria; record real output. | **Not** when behaviour is affected. A docs-only change may skip code tests but still runs the governance check. |
| SECURITY REVIEW | Apply `secure-development` when the permission surface, trust boundary, data flow, or secret handling changes. | Yes, when none of those change (say so explicitly). |
| DOCUMENTATION SYNC | Update every impacted document in the same task. | **Not** when behaviour/interfaces/permissions/requirements change. |
| TRACEABILITY UPDATE | Update `traceability-matrix.md` with truthful statuses. | No (must always reflect reality). |
| FINAL REPORT | Report changed files, tests run, pass/fail, and remaining limitations. | No |

## 3. Rules

1. Specification, testing, and documentation sync **must not be skipped** for
   changes that materially affect behaviour, security, compatibility,
   architecture, or acceptance criteria.
2. Never silently rewrite an approved requirement — use the change log.
3. A documentation update alone does not prove implementation; a passing test
   does not prove cross-browser compatibility.
4. Use `NOT VERIFIED` when a check cannot run, with a reason.
5. If a required skill cannot be loaded, say so; do not claim it was used.

## 4. Task-type shortcuts

- **Trivial, non-behavioural edit** (typo, comment): INTAKE → IMPLEMENTATION →
  governance check. All other stages collapse.
- **Docs-only change:** INTAKE → ANALYSIS → SKILL SELECTION
  (documentation-sync [+ requirement-management if requirements affected]) →
  DOCUMENTATION SYNC → TRACEABILITY UPDATE → FINAL REPORT → governance check.
- **Bug fix:** identify the violated criterion → fix → regression test →
  traceability update → report.
- **Refactor:** preserve behaviour → ADR if boundaries change → regression tests.
- **Security change:** always load `secure-development`; document threat-surface
  and control changes.

## 5. The `/change` command

`.opencode/commands/change.md` encodes this lifecycle so a natural-language
change request runs through it. Invoke with `/change <request>`.
