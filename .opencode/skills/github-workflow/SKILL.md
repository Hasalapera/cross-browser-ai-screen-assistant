---
name: github-workflow
description: Use when working with Git for the Cross-Browser AI Screen Assistant — repository hygiene, inspecting git status/diffs, staging, safe commit preparation, release/tagging, and preparing (but not performing) GitHub publication without unauthorized remote actions. Triggers include "commit", "git status", "diff", "staging", "repo hygiene", "release", "github", "push", "pull request", "gitignore".
---

# Skill: github-workflow

Maintain repository hygiene and prepare safe Git/GitHub operations while never
performing unauthorized remote or destructive actions.

## When to use

- Preparing a commit, reviewing a diff, or tidying the working tree.
- Preparing a release or GitHub publication.
- Checking that no secrets or unwanted files are staged.

## Required reference documents

- `AGENTS.md` §10 (destructive ops and Git) and §12 (approval)
- `.gitignore`, `README.md`, `CHANGELOG.md`
- `docs/quality/known-limitations.md`

## Inputs

- `git status` / `git diff` output.
- The intended change set.

## Step-by-step workflow

1. **Inspect before acting.** Always run `git status` and `git diff` first and
   summarize the true state of the working tree.
2. **Check the boundary.** Confirm changes are confined to the project directory
   and unrelated/sibling files are untouched.
3. **Hygiene scan.** Ensure no secrets, credentials, personal machine paths,
   build caches, `.env`, or generated artifacts would be staged (SEC-010). Check
   `.gitignore` covers them.
4. **Run governance.** `python3 scripts/governance-check.py` before staging.
5. **Review the diff.** Look for unrelated modifications, missing documentation
   sync, and leaked data.
6. **Stage only intended files.** Never `git add -A` blindly.
7. **Prepare the commit message** from real content, matching repo style.
8. **Stop for approval** before committing, pushing, tagging, or publishing
   unless explicitly authorized. Never push or create a remote without explicit
   permission.
9. **Never run destructive commands** (`rm -rf`, `git reset --hard`, force push,
   history rewrite) without explicit human approval.

## Outputs

- A reviewed, accurate statement of repository state.
- A staged, review-ready change set (commit/publish only with approval).

## Validation requirements

- No secrets or personal paths staged.
- All staged changes are related to the task.
- Governance check passes or its failures are explained.

## When information is missing

If repository history or remotes are unclear, report the observed facts rather
than assuming. If a prior commit is ambiguous, ask before amending.

## Documents that must be updated

- `CHANGELOG.md` for user-visible/version changes.
- `README.md` for setup or feature-set changes.

## Conditions requiring user approval

- Every commit, push, tag, or publish unless already authorized in the request.
- Any destructive Git operation.
- Creating a remote repository.
