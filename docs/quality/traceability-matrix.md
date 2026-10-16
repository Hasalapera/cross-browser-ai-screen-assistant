# Traceability Matrix — Cross-Browser AI Screen Assistant

- **Document ID:** TRACE
- **Version:** 1.0.0
- **Last updated:** 2026-10-17
- **Related:** `docs/requirements/requirements.md`,
  `docs/requirements/acceptance-criteria.md`, `docs/quality/test-strategy.md`

Links: **Requirement ID → Acceptance Criteria → Implementation component →
Test ID → Status**. Update whenever any link changes. Never mark `VERIFIED`
without named evidence.

Status vocabulary: `PROPOSED`, `APPROVED`, `IMPLEMENTED`, `VERIFIED`,
`NOT VERIFIED`, `DEFERRED`, `DEPRECATED`, `REJECTED`.

> **Baseline note:** No implementation exists yet. Implementation components are
> planned targets for Phase 1 and are marked `TBD`. All test IDs are planned;
> status is `NOT VERIFIED` (nothing has run).

| Requirement | Acceptance Criteria | Implementation component (planned) | Test ID | Status |
| --- | --- | --- | --- | --- |
| FR-001 | AC-FR-001-1, AC-FR-001-2 | `manifest.*`, build script | T-FR-001-1, T-FR-001-2 | NOT VERIFIED |
| FR-002 | AC-FR-002-1 | `popup/` | T-FR-002-1 | NOT VERIFIED |
| FR-003 | AC-FR-003-1..3 | `background/`, `content/` | T-FR-003-1..3 | NOT VERIFIED |
| FR-004 | AC-FR-004-1, AC-FR-004-2 | `content/selection` | T-FR-004-1, T-FR-004-2 | NOT VERIFIED |
| FR-005 | AC-FR-005-1, AC-FR-005-2 | `content/panel` | T-FR-005-1, T-FR-005-2 | NOT VERIFIED |
| FR-006 | AC-FR-006-1 | `content/panel` | T-FR-006-1 | NOT VERIFIED |
| FR-007 | AC-FR-007-1 | `content/panel` | T-FR-007-1 | NOT VERIFIED |
| FR-008 | AC-FR-008-1, AC-FR-008-2 | `services/` (Phase 2) | T-FR-008-1, T-FR-008-2 | DEFERRED |
| FR-009 | AC-FR-009-1, AC-FR-009-2 | `capture/` (Phase 3) | T-FR-009-1, T-FR-009-2 | DEFERRED |
| FR-010 | AC-FR-010-1, AC-FR-010-2 | `background/storage` | T-FR-010-1, T-FR-010-2 | NOT VERIFIED |
| NFR-001 | AC-NFR-001-1 | `content/panel` | T-NFR-001-1 | NOT VERIFIED |
| NFR-002 | AC-NFR-002-1 | `content/` | T-NFR-002-1 | NOT VERIFIED |
| NFR-003 | AC-NFR-003-1 | repo-wide | T-NFR-003-1 | NOT VERIFIED |
| NFR-004 | AC-NFR-004-1 | build script | T-NFR-004-1 | NOT VERIFIED |
| NFR-005 | AC-NFR-005-1 | `content/` | T-NFR-005-1 | NOT VERIFIED |
| NFR-006 | AC-NFR-006-1 | repo-wide | T-NFR-006-1 | NOT VERIFIED |
| NFR-007 | AC-NFR-007-1 | `popup/`, `content/panel` | T-NFR-007-1 | NOT VERIFIED |
| SEC-001 | AC-SEC-001-1 | manifests | T-SEC-001-1 | NOT VERIFIED |
| SEC-002 | AC-SEC-002-1 | repo-wide | T-SEC-002-1 | NOT VERIFIED |
| SEC-003 | AC-SEC-003-1 | `content/panel` | T-SEC-003-1 | NOT VERIFIED |
| SEC-004 | AC-SEC-004-1 | `content/` | T-SEC-004-1 | NOT VERIFIED |
| SEC-005 | AC-SEC-005-1 | `content/panel` | T-SEC-005-1 | NOT VERIFIED |
| SEC-006 | AC-SEC-006-1 | content script registration | T-SEC-006-1 | NOT VERIFIED |
| SEC-007 | AC-SEC-007-1 | `capture/` (Phase 3) | T-SEC-007-1 | DEFERRED |
| SEC-008 | AC-SEC-008-1 | `services/` (Phase 2) | T-SEC-008-1 | DEFERRED |
| SEC-009 | AC-SEC-009-1 | repo-wide | T-SEC-009-1 | NOT VERIFIED |
| SEC-010 | AC-SEC-010-1 | repo-wide | T-SEC-010-1 | NOT VERIFIED |
| BCR-001 | AC-BCR-001-1 | `manifest.chromium` | T-BCR-001-1 | NOT VERIFIED |
| BCR-002 | AC-BCR-002-1 | `manifest.firefox` | T-BCR-002-1 | NOT VERIFIED |
| BCR-003 | AC-BCR-003-1 | `content/`, `background/` | T-BCR-003-1 | NOT VERIFIED |
| BCR-004 | AC-BCR-004-1 | (process, docs) | T-BCR-004-1 | NOT VERIFIED |
