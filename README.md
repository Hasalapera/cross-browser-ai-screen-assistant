# Cross-Browser AI Screen Assistant

A cross-browser extension (Chromium + Firefox) that lets a user select text on
a page and receive an AI-generated answer or explanation in a floating panel —
with explicit user control, least-privilege permissions, and optional OCR as a
later, consent-gated capability.

> **Status:** Phase 1 — MVP extension skeleton implemented (manifest, popup,
> background state, content-script selection + local panel). No AI, OCR,
> backend, or network access. Browser-level checks are pending. See
> `docs/quality/known-limitations.md`.

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
  development/                workflow, definition of done, skill catalog, phase plan
src/
  shared/                     browser-api, messages, state, selection
  background/                 state ownership, persistence, injection, messaging
  content/                    selection listener + shadow-DOM panel
  popup/                      toolbar popup (state + activate/deactivate)
  manifest.chromium.json      MV3 manifest for Chromium-family browsers
  manifest.firefox.json       Firefox-adjusted MV3 manifest
scripts/
  build-extension.py          Emits dist/chromium and dist/firefox
  governance-check.py         Deterministic documentation governance checks
tests/                        node:test unit, build, manifest, source-safety tests
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

## Build and run

Build both browser packages from the one source tree:

```sh
python3 scripts/build-extension.py
```

This writes `dist/chromium/` and `dist/firefox/`. Load the relevant folder as an
unpacked extension (Chrome: `chrome://extensions`, enable Developer mode;
Firefox: `about:debugging` → This Firefox → Load Temporary Add-on). Click the
toolbar icon to activate, then select text on a page to see the local panel.

## Validation

Run governance checks from the repository root:

```sh
python3 scripts/governance-check.py
```

Run the unit / integration / build / source-safety tests:

```sh
node --test "tests/*.test.mjs"
```

The governance script is static: it validates document presence, skill
frontmatter, ID well-formedness, and cross-references. It cannot judge
semantics or runtime behaviour — see `docs/quality/known-limitations.md`.

Browser verification is manual: follow
`docs/quality/manual-verification-checklist.md` (procedure only; no browser
results are recorded yet).

## Contributing / agent workflow

Read `AGENTS.md` first. For a change request, run `/change <request>` in
opencode, which drives the full requirement-driven lifecycle.

## Development environment (verified 2026-10-17)

- opencode 1.18.34 (skills via `.opencode/skills/`, commands via
  `.opencode/commands/`)
- Node.js v24.18.0 (`node --test`), Python 3.13.7 (governance script)
