# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
versions follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

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
