# Skill Catalog — Cross-Browser AI Screen Assistant

- **Document ID:** SKILLCAT
- **Version:** 1.0.0
- **Last updated:** 2026-10-17

## 1. How skill discovery works (opencode)

Skills live at `.opencode/skills/<name>/SKILL.md`. opencode scans that directory
for `**/SKILL.md`, reads each file's YAML frontmatter, and exposes the skill's
`name` and `description` to the model. The model selects a skill by matching the
task to the `description` trigger keywords, then **loads it with the skill
tool**, which injects the skill body (workflow, references, scripts) into the
session.

- The `name` must be lowercase, hyphen-separated, ≤64 chars, and match the
  folder name.
- A skill without a `description` is filtered out and never surfaced.
- Merely mentioning a skill name in prose does **not** load it. The skill tool
  must be invoked. If the tool cannot load a required skill, the agent must say
  so.
- Skill selection is model-driven and strongly guided by the descriptions below;
  it is not hard-enforced by the runtime (see ADR-006).

The catalog is a human-readable mirror of the real skill frontmatter. If the two
disagree, the `SKILL.md` files are authoritative.

## 2. Skills

| Skill | Path | Triggers (description keywords) |
| --- | --- | --- |
| requirement-management | `.opencode/skills/requirement-management/SKILL.md` | new requirement, requirement change, acceptance criteria, FR/NFR/SEC ID, scope, change log |
| architecture-design | `.opencode/skills/architecture-design/SKILL.md` | architecture, component boundary, ADR, design decision, trust boundary, technology choice |
| secure-development | `.opencode/skills/secure-development/SKILL.md` | security, permission, privacy, secret, credential, threat model, untrusted input, capture, OCR |
| browser-extension-development | `.opencode/skills/browser-extension-development/SKILL.md` | browser extension, manifest, MV3, content script, popup, service worker, Firefox, Chrome, message passing |
| testing-and-verification | `.opencode/skills/testing-and-verification/SKILL.md` | test, verify, acceptance criteria, run checks, regression, evidence |
| documentation-sync | `.opencode/skills/documentation-sync/SKILL.md` | docs, documentation, update documents, stale, contradiction, sync |
| github-workflow | `.opencode/skills/github-workflow/SKILL.md` | git, commit, diff, repository hygiene, release, GitHub, pull request |

## 3. Intent → skills table

| Task intent | Skills to load |
| --- | --- |
| New feature | requirement-management, architecture-design (if boundary/decision), browser-extension-development, testing-and-verification, documentation-sync |
| Requirement change | requirement-management, architecture-design (if design impact), affected implementation skill, testing-and-verification, documentation-sync |
| Bug fix | relevant implementation skill, testing-and-verification, documentation-sync (if behaviour/doc changes) |
| Security-sensitive change | secure-development, relevant implementation skill, testing-and-verification |
| Refactoring | architecture-design (if boundaries change), implementation skill, testing-and-verification |
| Docs-only change | documentation-sync (+ requirement-management if requirements affected) |
| Release / GitHub prep | github-workflow, testing-and-verification |

## 4. Reference documents per skill

Each `SKILL.md` states its required reference documents, inputs, outputs,
validation requirements, what to do when information is missing, which documents
to update, and which conditions require user approval.

## 5. `/change` command

`.opencode/commands/change.md` drives the full lifecycle in
`docs/development/workflow.md` for a natural-language change request. It is not
a skill; it is a project command that instructs the agent which skills to load
for the given intent.
