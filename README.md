# Cross-Browser AI Screen Assistant

A cross-browser extension (Chromium + Firefox) that lets a user select text on
a page and receive an AI-generated answer or explanation in a floating panel —
with explicit user control, least-privilege permissions, and optional OCR as a
later, consent-gated capability.

> **Status:** Phase 0 — governance foundation only. No extension code, AI,
> OCR, or backend exists yet. See `docs/quality/known-limitations.md`.

## Repository layout

```
AGENTS.md                     Root operating contract for all agent sessions
opencode.json                 Project opencode config ($schema only)
.opencode/
  skills/<name>/SKILL.md      7 project skills (real opencode skills)
  commands/change.md          /change lifecycle command
docs/
  requirements/               requirements, acceptance criteria, change log
  architecture/               system, security, ADRs
  quality/                    test strategy, traceability, limitations
  development/                workflow, definition of done, skill catalog
scripts/governance-check.py   Deterministic documentation governance checks
```

## How this project is governed

- **Single source of truth for requirements:**
  `docs/requirements/requirements.md`.
- **Every request follows** the lifecycle in `docs/development/workflow.md`:
  INTAKE → ANALYSIS → SKILL SELECTION → IMPACT ANALYSIS → SPECIFICATION →
  APPROVAL WHEN REQUIRED → IMPLEMENTATION → TESTING → SECURITY REVIEW WHEN
  RELEVANT → DOCUMENTATION SYNC → TRACEABILITY UPDATE → FINAL REPORT.
- **Skills** are discovered from `.opencode/skills/` by opencode and selected by
  task intent (table in `docs/development/skill-catalog.md` and `AGENTS.md`).
- **Traceability** requirement → acceptance criteria → component → test → status
  lives in `docs/quality/traceability-matrix.md`.
- **Requirement changes** are recorded in
  `docs/requirements/requirements-change-log.md` (never silently rewritten).

## Validation

Run governance checks from the repository root:

```sh
python3 scripts/governance-check.py
```

Unit tests (none yet; planned with Phase 1 implementation):

```sh
node --test tests/
```

The governance script is static: it validates document presence, skill
frontmatter, ID well-formedness, and cross-references. It cannot judge
semantics or runtime behaviour — see `docs/quality/known-limitations.md`.

## Contributing / agent workflow

Read `AGENTS.md` first. For a change request, run `/change <request>` in
opencode, which drives the full requirement-driven lifecycle.

## Development environment (verified 2026-10-17)

- opencode 1.18.34 (skills via `.opencode/skills/`, commands via
  `.opencode/commands/`)
- Node.js v24.18.0 (`node --test`), Python 3.13.7 (governance script)
