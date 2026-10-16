# Test Strategy — Cross-Browser AI Screen Assistant

- **Document ID:** TEST-STRAT
- **Version:** 1.0.0
- **Last updated:** 2026-10-17
- **Related:** `docs/requirements/acceptance-criteria.md`,
  `docs/quality/traceability-matrix.md`

## 1. Objective

Verify that the implementation satisfies the acceptance criteria in
`acceptance-criteria.md`, and record evidence truthfully. A passing test does
not prove cross-browser compatibility (BCR-004); compatibility claims require a
named, executed check per browser.

## 2. Test levels

| Level | Purpose | Tooling (MVP) |
| --- | --- | --- |
| Static/governance | Document, ID, traceability, and reference integrity | `scripts/governance-check.py` |
| Unit | Pure logic (state, selection extraction, sanitisation helpers) | Node's built-in test runner (`node:test`) |
| Integration | Messaging between content script, background, popup | Node + DOM/messaging doubles |
| Build | Both browser packages emitted from one source tree | `scripts/build-extension.py` + `node:test` |
| Source safety | No code execution, no markup injection, no network calls | `node:test` scans over `src/` |
| End-to-end | Real browser behaviour on loaded extension | Manual checklist per browser (`docs/quality/manual-verification-checklist.md`) until automated tooling is approved |
| Security | Secret scan, no-network check, text-rendering check | governance scan + source scans + DOM-double asserts |

The MVP runs the Unit, Integration, Build, Source-safety, and Static levels with
`node --test`; the source modules are executed in an isolated `node:vm` context
so the shipped files themselves are exercised. End-to-end checks remain manual.

## 3. Test ID scheme

`T-<REQUIREMENT-ID>-<n>`, e.g. `T-FR-004-1`. Tests are named after the criterion
they verify. The traceability matrix maps `AC → T`.

## 4. Deriving tests from acceptance criteria

Every acceptance criterion must have at least one test. Tests are written
against behaviour visible at the extension's boundaries, not internal details,
so they remain valid across refactors.

## 5. Evidence rules

- Record actual command output in the final report.
- A requirement is `VERIFIED` only when all its criteria pass on a named check.
- If a check cannot run (missing browser, unavailable runner), mark
  `NOT VERIFIED` and state why. Never infer success.
- Cross-browser status is recorded per browser; "Chrome passes" never implies
  "Firefox passes".

## 6. Governance validation

Run from the repo root:

```sh
python3 scripts/governance-check.py
```

This is a deterministic static check. It **cannot** judge semantic requirement
changes, security correctness, or runtime behaviour — see
`docs/quality/known-limitations.md`.

## 7. Future tooling (requires approval)

Automated browser E2E (e.g., Playwright with a loaded extension), a linter, and
a TypeScript compiler are candidates for later phases. Adding them changes the
dependency/privacy surface and needs approval per AGENTS.md §12.
