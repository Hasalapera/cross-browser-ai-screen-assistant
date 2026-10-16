# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Fixed

- Background state broadcast to tabs without the injected content script
  produced an uncaught promise rejection (`Could not establish connection.
  Receiving end does not exist.`) because the Chromium promise form of
  `tabs.sendMessage`/`scripting.executeScript`/storage rejects asynchronously
  and a synchronous `try/catch` does not catch it. These calls now attach
  rejection handlers: benign no-receiver and protected-page errors are contained
  quietly, while unexpected errors are reported in the extension's own console.
  Regression tests added (`tests/background.test.mjs`,
  `tests/content.test.mjs`). No permission or data-flow change.

## [0.2.0] - 2026-10-17

### Added

- Phase 1 MVP extension skeleton:
  - `src/shared/`: `browser-api.js` (cross-browser API abstraction),
    `messages.js` (typed, validated messaging), `state.js` (activation
    preference model), `selection.js` (selection extraction + sanitisation).
  - `src/background/background.js`: state ownership, storage persistence,
    on-demand content-script injection, state broadcast, error containment.
  - `src/content/`: `content.js` (selection listener, active-only, duplicate
    guard, error containment) and `panel.js` (shadow-DOM floating panel using
    text content only).
  - `src/popup/`: toolbar popup with activate/deactivate and accessible roles.
  - `src/manifest.chromium.json` and `src/manifest.firefox.json` (MV3,
    permissions `storage`, `activeTab`, `scripting`; no host permissions).
  - `scripts/build-extension.py` emits `dist/chromium` and `dist/firefox`.
  - `tests/` (`node:test`): selection, state, messages, browser-api, panel,
    source-safety, manifest, and build tests (33 tests).
- Documentation synced: traceability statuses, permission model, phase plan,
  known limitations, test strategy, README.

### Notes

- `scripting` permission added (user-approved) to inject the content script on
  explicit activation; recorded as RCL-001.
- Browser-level acceptance criteria remain `IMPLEMENTED`/`NOT VERIFIED`; no
  browser end-to-end harness exists and Firefox is not installed.

## [0.1.0] - 2026-10-17

### Added

- Project governance foundation (Phase 0):
  - `AGENTS.md` root operating contract.
  - Requirements baseline: `docs/requirements/requirements.md` (FR/NFR/SEC/BCR
    v1.0.0), `acceptance-criteria.md`, `requirements-change-log.md`.
  - Architecture: `system-architecture.md`, `security-architecture.md`, ADR-001
    through ADR-006.
  - Quality: `test-strategy.md`, `traceability-matrix.md`,
    `known-limitations.md`.
  - Development: `workflow.md`, `definition-of-done.md`, `skill-catalog.md`.
  - Seven opencode skills under `.opencode/skills/` (requirement-management,
    architecture-design, secure-development, browser-extension-development,
    testing-and-verification, documentation-sync, github-workflow).
  - `/change` project command (`.opencode/commands/change.md`).
  - `scripts/governance-check.py` documentation governance checks.
  - `README.md`, `.gitignore`, project `opencode.json`.

### Known limitations

- No extension implementation, tests, AI, OCR, or backend yet; all
  traceability statuses are `NOT VERIFIED` or `DEFERRED`.
