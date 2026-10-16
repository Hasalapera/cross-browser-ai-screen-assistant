#!/usr/bin/env python3
"""Governance checks for the Cross-Browser AI Screen Assistant.

Deterministic, dependency-free (stdlib only) static checks over the project's
documentation, skills, and configuration.

Usage (from the repository root):
    python3 scripts/governance-check.py

Exit code 0 = all checks passed; 1 = at least one check failed.

LIMITATIONS (read carefully):
  These checks validate STRUCTURE and CROSS-REFERENCES only. They cannot judge
  whether a requirement change was semantically recorded, whether a test really
  proves an acceptance criterion, whether a document's claims are correct, or
  whether the product works. Secret detection is best-effort pattern matching,
  not proof of absence. See docs/quality/known-limitations.md.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

REQ_PREFIX = r"(?:FR|NFR|SEC|BCR)"
REQ_ID = re.compile(rf"^{REQ_PREFIX}-\d{{3}}$")
STATUS_VOCAB = {
    "PROPOSED",
    "APPROVED",
    "IMPLEMENTED",
    "VERIFIED",
    "NOT",
    "DEFERRED",
    "DEPRECATED",
    "REJECTED",
}
# "NOT VERIFIED" is two tokens; handled by allowing the "NOT" first token.
ALLOWED_ROOT_FILE_REFS = {
    "AGENTS.md",
    "README.md",
    "CHANGELOG.md",
    ".gitignore",
    "opencode.json",
    "opencode.jsonc",
}

REQUIRED_FILES = [
    "AGENTS.md",
    "README.md",
    "CHANGELOG.md",
    ".gitignore",
    "opencode.json",
    "docs/requirements/requirements.md",
    "docs/requirements/acceptance-criteria.md",
    "docs/requirements/requirements-change-log.md",
    "docs/architecture/system-architecture.md",
    "docs/architecture/security-architecture.md",
    "docs/architecture/architecture-decisions.md",
    "docs/quality/test-strategy.md",
    "docs/quality/traceability-matrix.md",
    "docs/quality/known-limitations.md",
    "docs/development/workflow.md",
    "docs/development/definition-of-done.md",
    "docs/development/skill-catalog.md",
    "scripts/governance-check.py",
    ".opencode/commands/change.md",
]

REQUIRED_SKILLS = [
    "requirement-management",
    "architecture-design",
    "secure-development",
    "browser-extension-development",
    "testing-and-verification",
    "documentation-sync",
    "github-workflow",
]

SECRET_PATTERNS = [
    (re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"), "private key block"),
    (re.compile(r"\bghp_[A-Za-z0-9]{30,}\b"), "GitHub token"),
    (re.compile(r"\bgithub_pat_[A-Za-z0-9_]{20,}\b"), "GitHub fine-grained token"),
    (re.compile(r"\bsk-[A-Za-z0-9_-]{20,}\b"), "API key (sk-...)"),
    (re.compile(r"\bAKIA[0-9A-Z]{16}\b"), "AWS access key id"),
    (re.compile(r"\bxox[baprs]-[A-Za-z0-9-]{10,}\b"), "Slack token"),
    (
        re.compile(
            r"(?i)\b(api[_-]?key|secret|token|password)\s*[:=]\s*[\"'][^\"'\s]{16,}[\"']"
        ),
        "inline credential assignment",
    ),
]

errors: list[str] = []
warnings: list[str] = []


def err(check: str, msg: str) -> None:
    errors.append(f"[{check}] {msg}")


def warn(check: str, msg: str) -> None:
    warnings.append(f"[{check}] {msg}")


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def frontmatter(path: Path) -> dict[str, str] | None:
    """Parse a simple single-line YAML frontmatter block."""
    if not path.is_file():
        return None
    lines = read(path).splitlines()
    if not lines or lines[0].strip() != "---":
        return None
    fields: dict[str, str] = {}
    for line in lines[1:]:
        if line.strip() == "---":
            return fields
        if ":" in line and not line.startswith((" ", "\t")):
            key, _, value = line.partition(":")
            fields[key.strip()] = value.strip()
    return None


# ---------------------------------------------------------------- check 1
def check_required_files() -> None:
    missing = [f for f in REQUIRED_FILES if not (ROOT / f).is_file()]
    if missing:
        for f in missing:
            err("required-files", f"missing required file: {f}")
    else:
        print(f"[PASS] required-files: {len(REQUIRED_FILES)}/{len(REQUIRED_FILES)} present")


# ---------------------------------------------------------------- check 2
def check_skills() -> None:
    skills_dir = ROOT / ".opencode" / "skills"
    issues = 0
    if not skills_dir.is_dir():
        err("skills", ".opencode/skills/ directory missing")
        return
    found = {p.name for p in skills_dir.iterdir() if p.is_dir()}
    for name in REQUIRED_SKILLS:
        if name not in found:
            err("skills", f"required skill folder missing: {name}")
            issues += 1
    for folder in sorted(found):
        skill_file = skills_dir / folder / "SKILL.md"
        if not skill_file.is_file():
            err("skills", f"{folder}: SKILL.md missing")
            issues += 1
            continue
        fm = frontmatter(skill_file)
        if fm is None:
            err("skills", f"{folder}: missing or malformed frontmatter")
            issues += 1
            continue
        name = fm.get("name", "")
        desc = fm.get("description", "")
        if not name:
            err("skills", f"{folder}: frontmatter has no 'name'")
            issues += 1
        else:
            if name != folder:
                err("skills", f"{folder}: frontmatter name '{name}' != folder name")
                issues += 1
            if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", name):
                err("skills", f"{folder}: name '{name}' not lowercase-hyphen format")
                issues += 1
            if len(name) > 64:
                err("skills", f"{folder}: name longer than 64 chars")
                issues += 1
        if not desc:
            err("skills", f"{folder}: frontmatter has no 'description' "
                          "(skill would be invisible to the model)")
            issues += 1
        elif len(desc) < 20:
            warn("skills", f"{folder}: description is very short")
    if issues == 0:
        print(f"[PASS] skills: {len(found)} skill folders valid "
              f"(all {len(REQUIRED_SKILLS)} required present)")


# ---------------------------------------------------------------- check 3
def check_command() -> None:
    cmd_file = ROOT / ".opencode" / "commands" / "change.md"
    if not cmd_file.is_file():
        err("commands", ".opencode/commands/change.md missing")
        return
    fm = frontmatter(cmd_file)
    if fm is None:
        err("commands", "change.md: missing or malformed frontmatter")
        return
    if not fm.get("description"):
        err("commands", "change.md: frontmatter has no 'description'")
        return
    body = read(cmd_file)
    if "$ARGUMENTS" not in body:
        err("commands", "change.md: template does not use $ARGUMENTS")
        return
    print("[PASS] commands: /change discovered (frontmatter + $ARGUMENTS ok)")


# ---------------------------------------------------------------- check 4
def parse_requirements() -> dict[str, dict[str, str]]:
    reqs: dict[str, dict[str, str]] = {}
    req_file = ROOT / "docs/requirements/requirements.md"
    if not req_file.is_file():
        err("requirements", "docs/requirements/requirements.md missing")
        return reqs
    for line in read(req_file).splitlines():
        if not line.startswith("|"):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) < 4:
            continue
        rid = cells[0]
        if not re.fullmatch(rf"{REQ_PREFIX}-\d+", rid):
            if re.fullmatch(rf"{REQ_PREFIX}-\S+", rid) and not REQ_ID.match(rid):
                err("requirements", f"malformed requirement ID: '{rid}'")
            continue
        if not REQ_ID.match(rid):
            err("requirements", f"malformed requirement ID: '{rid}' "
                                f"(expected {REQ_PREFIX}-NNN)")
            continue
        if rid in reqs:
            err("requirements", f"duplicate requirement ID: {rid}")
            continue
        status = cells[2].split()[0] if cells[2] else ""
        if status not in STATUS_VOCAB:
            err("requirements", f"{rid}: unknown status '{cells[2]}'")
        reqs[rid] = {"status": cells[2], "version": cells[3] if len(cells) > 3 else ""}
    if reqs:
        print(f"[PASS] requirements: {len(reqs)} unique, well-formed IDs "
              f"with valid statuses")
    return reqs


# ---------------------------------------------------------------- check 5
def check_acceptance_criteria(reqs: dict[str, dict[str, str]]) -> set[str]:
    ac_file = ROOT / "docs/requirements/acceptance-criteria.md"
    if not ac_file.is_file():
        err("acceptance-criteria", "acceptance-criteria.md missing")
        return set()
    text = read(ac_file)
    all_acs = set(re.findall(rf"\bAC-{REQ_PREFIX}-\d+-\d+\b", text))
    defined = re.findall(rf"\*\*(AC-{REQ_PREFIX}-\d+-\d+)\*\*", text)

    dupes = {ac for ac in defined if defined.count(ac) > 1}
    for ac in sorted(dupes):
        err("acceptance-criteria", f"AC defined more than once: {ac}")

    ok = True
    for rid in reqs:
        if f"AC-{rid}-" not in text:
            err("acceptance-criteria", f"{rid}: no acceptance criterion defined")
            ok = False
    for ac in sorted(all_acs):
        m = re.match(rf"AC-({REQ_PREFIX}-\d+)-\d+$", ac)
        if m and m.group(1) not in reqs:
            err("acceptance-criteria", f"{ac}: references nonexistent requirement "
                                       f"{m.group(1)}")
            ok = False
    if ok and not dupes:
        print(f"[PASS] acceptance-criteria: {len(all_acs)} criteria; "
              f"every requirement covered")
    return all_acs


# ---------------------------------------------------------------- check 6
def expand_ranges(text: str) -> set[str]:
    """Expand 'FR-001..FR-010' and 'AC-FR-003-1..3' style shorthands."""
    ids = set(re.findall(rf"\b{REQ_PREFIX}-\d{{3}}\b", text))
    for m in re.finditer(rf"\b({REQ_PREFIX})-(\d{{3}})\.\.({REQ_PREFIX})-(\d{{3}})\b", text):
        if m.group(1) == m.group(3):
            for n in range(int(m.group(2)), int(m.group(4)) + 1):
                ids.add(f"{m.group(1)}-{n:03d}")
    return ids


def check_change_log(reqs: dict[str, dict[str, str]]) -> None:
    log_file = ROOT / "docs/requirements/requirements-change-log.md"
    if not log_file.is_file():
        err("change-log", "requirements-change-log.md missing")
        return
    logged = expand_ranges(read(log_file))
    ok = True
    for rid in reqs:
        if rid not in logged:
            err("change-log", f"{rid}: no change-log record mentions this "
                              "requirement (baseline or change)")
            ok = False
    if ok:
        print(f"[PASS] change-log: all {len(reqs)} requirement IDs recorded")


# ---------------------------------------------------------------- check 7
def check_traceability(reqs: dict[str, dict[str, str]], acs: set[str]) -> None:
    trace_file = ROOT / "docs/quality/traceability-matrix.md"
    if not trace_file.is_file():
        err("traceability", "traceability-matrix.md missing")
        return

    def expand_cell(cell: str) -> set[str]:
        cell = re.sub(
            rf"((?:AC|T)-{REQ_PREFIX}-\d+-)(\d+)\.\.(\d+)",
            lambda m: ",".join(
                f"{m.group(1)}{n}" for n in range(int(m.group(2)), int(m.group(3)) + 1)
            ),
            cell,
        )
        return set(re.findall(rf"(?:AC|T)-{REQ_PREFIX}-\d+-\d+", cell))

    rows: dict[str, dict[str, set[str]]] = {}
    ok = True
    for line in read(trace_file).splitlines():
        if not line.startswith("|"):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        if len(cells) != 5 or not REQ_ID.match(cells[0]):
            continue
        rid = cells[0]
        ac_ids, test_ids = expand_cell(cells[1]), expand_cell(cells[3])
        status = cells[4].split()[0] if cells[4] else ""
        if rid not in reqs:
            err("traceability", f"row references nonexistent requirement {rid}")
            ok = False
            continue
        if status not in STATUS_VOCAB:
            err("traceability", f"{rid}: unknown status '{cells[4]}'")
            ok = False
        for ac in sorted(ac_ids):
            if ac not in acs:
                err("traceability", f"{rid}: references nonexistent AC {ac}")
                ok = False
            elif not ac.startswith(f"AC-{rid}-"):
                err("traceability", f"{rid}: AC {ac} belongs to a different "
                                    "requirement")
                ok = False
        for t in sorted(test_ids):
            m = re.match(rf"T-({REQ_PREFIX}-\d+)-\d+$", t)
            if not m:
                err("traceability", f"{rid}: malformed test ID {t}")
                ok = False
            elif m.group(1) != rid:
                err("traceability", f"{rid}: test {t} belongs to a different "
                                    "requirement")
                ok = False
        if not ac_ids:
            err("traceability", f"{rid}: row has no acceptance criteria")
            ok = False
        if not test_ids:
            err("traceability", f"{rid}: row has no test ID")
            ok = False
        rows[rid] = {"ac": ac_ids, "t": test_ids}

    for rid in reqs:
        if rid not in rows:
            err("traceability", f"{rid}: no traceability row")
            ok = False

    for ac in sorted(acs):
        if not any(ac in row["ac"] for row in rows.values()):
            err("traceability", f"{ac}: defined but not referenced by any row")
            ok = False

    if ok:
        print(f"[PASS] traceability: {len(rows)}/{len(reqs)} requirements mapped; "
              f"{len(acs)} ACs all referenced")


# ---------------------------------------------------------------- check 8
def check_json_config() -> None:
    ok = True
    for name in ("opencode.json", "opencode.jsonc"):
        path = ROOT / name
        if not path.is_file():
            continue
        raw = read(path)
        if name.endswith(".jsonc"):
            raw = re.sub(r"^\s*//.*$", "", raw, flags=re.M)
            raw = re.sub(r"/\*.*?\*/", "", raw, flags=re.S)
        try:
            data = json.loads(raw)
            if not isinstance(data, dict):
                err("config", f"{name}: top level must be a JSON object")
                ok = False
            elif "$schema" not in data:
                warn("config", f"{name}: missing $schema")
        except json.JSONDecodeError as exc:
            err("config", f"{name}: invalid JSON: {exc}")
            ok = False
    if ok:
        print("[PASS] config: JSON configuration parses")


# ---------------------------------------------------------------- check 9
def strip_fenced_blocks(text: str) -> str:
    out, in_fence = [], False
    for line in text.splitlines():
        if line.lstrip().startswith("```"):
            in_fence = not in_fence
            continue
        if not in_fence:
            out.append(line)
    return "\n".join(out)


def check_doc_references() -> None:
    """Check backticked project-path references in Markdown resolve on disk."""
    bad = 0
    md_files = [
        p
        for p in ROOT.rglob("*.md")
        if ".git/" not in p.as_posix() and "node_modules" not in p.as_posix()
    ]
    for md in md_files:
        text = strip_fenced_blocks(read(md))
        for token in re.findall(r"`([^`\n]+)`", text):
            token = token.strip()
            if any(ch in token for ch in "*<>|") or " " in token:
                continue
            if token not in ALLOWED_ROOT_FILE_REFS and not token.startswith(
                ("docs/", "scripts/", ".opencode/")
            ):
                continue
            target = ROOT / token.rstrip("/")
            if not target.exists():
                rel = md.relative_to(ROOT).as_posix()
                err("doc-refs", f"{rel}: reference to nonexistent path '{token}'")
                bad += 1
    if bad == 0:
        print(f"[PASS] doc-refs: all backticked project paths resolve "
              f"({len(md_files)} markdown files scanned)")


# ---------------------------------------------------------------- check 10
def check_secrets() -> None:
    findings = 0
    self_path = Path(__file__).resolve()
    scan_files = [
        p
        for p in ROOT.rglob("*")
        if p.is_file()
        and p.resolve() != self_path
        and ".git/" not in p.as_posix()
        and "node_modules" not in p.as_posix()
        and p.suffix not in {".png", ".jpg", ".icns", ".ico", ".zip"}
    ]
    allowed_user_path = str(ROOT)  # documented project directory is permitted
    if (ROOT / ".env").exists():
        err("secrets", ".env file present in repository")
        findings += 1
    for path in scan_files:
        try:
            text = read(path)
        except OSError:
            continue
        rel = path.relative_to(ROOT).as_posix()
        for pattern, label in SECRET_PATTERNS:
            if pattern.search(text):
                err("secrets", f"{rel}: possible {label}")
                findings += 1
        for m in re.finditer(r"/Users/[A-Za-z0-9_.-]+", text):
            if not text[m.start():].startswith(allowed_user_path):
                warn("secrets", f"{rel}: user path outside project dir: {m.group(0)}")
    if findings == 0:
        print(f"[PASS] secrets: best-effort scan clean "
              f"({len(scan_files)} files; pattern-based, not proof)")


# ---------------------------------------------------------------- main
def main() -> int:
    print("=" * 70)
    print("Governance check — Cross-Browser AI Screen Assistant")
    print(f"Root: {ROOT}")
    print("=" * 70)

    check_required_files()
    check_skills()
    check_command()
    reqs = parse_requirements()
    acs = check_acceptance_criteria(reqs)
    check_change_log(reqs)
    check_traceability(reqs, acs)
    check_json_config()
    check_doc_references()
    check_secrets()

    print("-" * 70)
    if warnings:
        print(f"WARNINGS ({len(warnings)}):")
        for w in warnings:
            print(f"  {w}")
    if errors:
        print(f"FAILED — {len(errors)} issue(s):")
        for e in errors:
            print(f"  {e}")
    else:
        print("PASSED — all structural checks succeeded.")
    print()
    print("Limitation: these are static structural checks only. They do not")
    print("validate semantics, runtime behaviour, security, or browser")
    print("compatibility. See docs/quality/known-limitations.md.")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
