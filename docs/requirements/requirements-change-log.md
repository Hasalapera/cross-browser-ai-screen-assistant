# Requirements Change Log — Cross-Browser AI Screen Assistant

- **Document ID:** RCL
- **Last updated:** 2026-10-17

Every approved change to a requirement is recorded here. Approved requirements
are never silently rewritten or removed; the previous text is preserved so the
history is auditable. A change record is required before an approved
requirement's text changes in `requirements.md`.

## Record fields

| Field | Meaning |
| --- | --- |
| Change ID | Stable ID, `RCL-<n>` |
| Date | ISO date the change was approved |
| Requirement ID | Affected FR/NFR/SEC/BCR ID |
| Previous | The prior requirement text/status |
| New | The new requirement text/status |
| Reason | Why the change is needed |
| Impact — components | Code modules affected |
| Impact — APIs | Browser APIs / permissions affected |
| Impact — permissions | Manifest permissions added/removed |
| Impact — tests | Test IDs added/updated/removed |
| Impact — documents | Documents that must be updated |
| Approval | Who approved and how |
| Verification | Result (tests, or `NOT VERIFIED` + reason) |

## Records

### RCL-000 — Baseline establishment

- **Date:** 2026-10-17
- **Requirement IDs:** FR-001..FR-010, NFR-001..NFR-007, SEC-001..SEC-010,
  BCR-001..BCR-004
- **Previous:** (none — no prior specification)
- **New:** Initial approved baseline at specification version 1.0.0 (see
  `requirements.md`).
- **Reason:** Establish the requirements foundation for the project.
- **Impact — components:** none yet (no implementation).
- **Impact — APIs / permissions:** none yet.
- **Impact — tests:** acceptance criteria defined; no tests executed yet.
- **Impact — documents:** `requirements.md`, `acceptance-criteria.md`,
  `traceability-matrix.md`, `known-limitations.md`.
- **Approval:** User-approved via the foundation task brief.
- **Verification:** `NOT VERIFIED` — no implementation exists yet.

### RCL-001 — Manifest permission set for on-demand content-script injection

- **Date:** 2026-10-17
- **Requirement IDs:** FR-003, FR-004, SEC-001, BCR-002
- **Previous:** Permission set was not fixed in requirement text; the architecture
  baseline (`system-architecture.md` §8) named `storage` + `activeTab` only.
- **New:** The MVP manifest requests `storage`, `activeTab`, and `scripting`. No
  requirement *text* changes; this records the approved permission decision and
  its justification, as required by `security-architecture.md` §4 and AGENTS.md
  §12. SEC-001 (least privilege) is unchanged and still satisfied — `scripting`
  is used only to inject the content script into the current tab on explicit
  activation, so no host permissions and no statically declared content script
  are added.
- **Reason:** `activeTab` alone does not authorize `scripting.executeScript`;
  the content script must be injected on activation. The alternative, an
  `<all_urls>` content script, would violate least privilege (SEC-001).
- **Impact — components:** `src/background/background.js`,
  `src/manifest.chromium.json`, `src/manifest.firefox.json`.
- **Impact — APIs / permissions:** adds the `scripting` permission.
- **Impact — tests:** `T-SEC-001-1` (exact permission set), `T-FR-001-*`,
  `T-BCR-002-1`.
- **Impact — documents:** `system-architecture.md` §8,
  `security-architecture.md` §4, `phase-1-plan.md` §0, `traceability-matrix.md`.
- **Approval:** User-approved in the Phase 1 implementation task.
- **Verification:** `IMPLEMENTED` — `T-SEC-001-1` and the build/manifest tests
  pass (static); browser load remains `NOT VERIFIED`.

<!--
Template for future records:

### RCL-001 — <short title>

- **Date:** YYYY-MM-DD
- **Requirement ID:** FR-XXX
- **Previous:** "<old text>" (status: APPROVED, version 1.0.0)
- **New:** "<new text>" (status: APPROVED, version 1.1.0)
- **Reason:** ...
- **Impact — components:** ...
- **Impact — APIs:** ...
- **Impact — permissions:** ...
- **Impact — tests:** ...
- **Impact — documents:** ...
- **Approval:** ...
- **Verification:** ...
-->
