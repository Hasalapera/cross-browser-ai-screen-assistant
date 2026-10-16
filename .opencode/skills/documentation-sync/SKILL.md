---
name: documentation-sync
description: Use when code, requirements, architecture, or behaviour change so that project documentation must be updated consistently, or when checking docs for contradictions and stale claims. Triggers include "update docs", "documentation", "sync docs", "stale", "contradiction", "outdated docs", "readme", "changelog", "mirror docs".
---

# Skill: documentation-sync

Keep every impacted document consistent with the actual implementation and
verification evidence, and detect contradictions or stale claims.

## When to use

- After a behaviour, interface, permission, or requirement change.
- Before a release or when publishing.
- When reviewing whether documentation still matches reality.

## Required reference documents

- `AGENTS.md` (source-of-truth list, §7 sync rule)
- `docs/requirements/*`, `docs/architecture/*`, `docs/quality/*`,
  `docs/development/*`
- `README.md`, `CHANGELOG.md`

## Inputs

- The list of changed files and behaviours.
- The current document set.

## Step-by-step workflow

1. **Identify impacted documents.** Use `AGENTS.md` §7 and the source-of-truth
   list to decide which docs are touched by the change.
2. **Update for consistency.** Make the docs describe what now exists (or will
   exist after approval). Match status and version fields to reality.
3. **Detect contradictions.** For each impacted doc, check that no other doc
   says something incompatible. Fix or flag the conflict explicitly.
4. **Remove stale claims.** Delete or correct statements that the code no longer
   supports (e.g., "verified" after behaviour changed).
5. **Do not claim implementation via docs.** Documentation updates do not
   implement requirements; keep `VERIFIED`/`IMPLEMENTED` statuses driven by test
   evidence only.
6. **Update `README.md` and `CHANGELOG.md`** when user-visible behaviour,
   setup, or version changes.
7. **Run the governance check** to catch broken references.

## Outputs

- A consistent, contradiction-free document set.
- `README.md` / `CHANGELOG.md` updates where applicable.

## Validation requirements

- Every document reference resolves to an existing file.
- No doc contradicts another on scope, permissions, or status.
- Status/version fields reflect current reality.

## When information is missing

If you cannot tell which document is authoritative, `AGENTS.md` §2 decides.
If a change's user-facing impact is unclear, ask rather than guessing.

## Documents that must be updated

- Whichever of `requirements.md`, `acceptance-criteria.md`, architecture docs,
  quality docs, `workflow.md` are impacted.
- `README.md`, `CHANGELOG.md` for user-visible changes.
- `docs/quality/known-limitations.md` when limitations change.

## Conditions requiring user approval

- Any documentation change that alters approved requirements or security
  commitments (route through requirement-management/secure-development).
