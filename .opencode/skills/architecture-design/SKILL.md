---
name: architecture-design
description: Use when a change affects component boundaries, data flows, trust boundaries, browser integration, or technology choices for the Cross-Browser AI Screen Assistant, or when an Architecture Decision Record (ADR) is needed. Triggers include "architecture", "component boundary", "data flow", "trust boundary", "ADR", "design decision", "technology choice", "manifest strategy", "toolchain".
---

# Skill: architecture-design

Define and evaluate the structure of the system and record significant,
hard-to-reverse decisions as ADRs.

## When to use

- New components, modules, or boundaries are introduced or moved.
- Data flows, trust boundaries, or browser-process boundaries change.
- A technology, library, build tool, or platform choice is made.
- A previously accepted ADR may be superseded.

## Required reference documents

- `docs/architecture/system-architecture.md`
- `docs/architecture/security-architecture.md`
- `docs/architecture/architecture-decisions.md`
- `docs/requirements/requirements.md` (NFR/BCR constraints)

## Inputs

- The requirement(s) driving the design.
- Current architecture docs and ADRs.

## Step-by-step workflow

1. **Read the current design.** Load the architecture docs and any related ADRs.
2. **Identify the boundary/decision.** State precisely what changes.
3. **List options.** At least two real alternatives, including "do nothing" or
   "defer" where relevant.
4. **Evaluate against constraints.** NFR-001..007, SEC-001..010, BCR-001..004,
   and dependency/privacy risk.
5. **Write or update an ADR.** Use the next free `ADR-NNN`. Include context,
   options, decision, reasons, consequences, status. Mark status `ACCEPTED`,
   `PROPOSED`, `SUPERSEDED`, etc.
6. **Update architecture docs** so they match the decision.
7. **Check consistency.** No doc may contradict the new ADR; fix or flag
   contradictions.
8. **Flag approval needs.** Permission, trust-boundary, or dependency changes
   require user approval before implementation.

## Outputs

- New/updated ADR(s).
- Updated `system-architecture.md` and/or `security-architecture.md`.

## Validation requirements

- Every ADR has a unique ID, status, and the required sections.
- Architecture docs reference the ADR for each significant decision.
- No unverified technology is assumed available; state verification status.

## When information is missing

If the requirement or constraint behind a decision is unclear, ask before
writing the ADR. If a technology's compatibility is unknown, record it as
`NOT VERIFIED` and note what check is needed — do not assume it works.

## Documents that must be updated

- `docs/architecture/architecture-decisions.md`
- `docs/architecture/system-architecture.md`
- `docs/architecture/security-architecture.md` (if trust/data flow changes)
- `docs/quality/known-limitations.md` (if a limitation changes)

## Conditions requiring user approval

- Changes to component boundaries or the trust/data-flow architecture.
- New dependencies with privacy/security impact.
- Any change to the permission posture.
