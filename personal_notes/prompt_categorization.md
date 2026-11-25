# Prompt Categorization: Recurrent vs. Special Cases

> **Based on synthetic data.** This categorizes the 20 mocked entries in `prompt_journal.md`. The recurrence judgments are my estimates of what a developer does repeatedly, not measurements from real sessions. Re-check them once real entries exist.

## How I decided

| Category | Test |
|---|---|
| **Recurrent** | The *task type* is generic. It would come up in almost any repo, on most working days, and the prompt shape can be reused as-is. |
| **Special case** | The prompt depends on a specific library, migration, platform or one-time cleanup. The prompt itself rarely repeats, though a lesson from it might. |

**Result:** 13 recurrent, 7 special.

---

## Recurrent (13): automation candidates

### Good habits to codify (6)

| # | Task | Reusable shape | Automation |
|---|---|---|---|
| 01 | Orient in a repo | Read-only; summarize; top-3 risks | `/orient` skill |
| 02 | Test gap analysis | Compare code to tests; table output; report only | Gap-analysis subagent |
| 03 | Write tests like an existing file | Reference file + my edge-case list + run it | Test-writer template |
| 04 | Small bug fix | Symptom / expected / file / repro test first / diff cap | `/fix-bug` template |
| 05 | Feature impact analysis | List every file to change; wait for approval | Planning step in feature prompts |
| 08 | Self-review before commit | Rubric + file:line + "say so if nothing found" | Pre-commit review subagent |

### Recurring failure modes to guard against (7)

| # | Failure | Root cause in my prompting | Guardrail |
|---|---|---|---|
| 11 | Vague feature request | Dropped scope, reuse and location | Prompt linter: "where, reuse what, done when?" |
| 12 | Plausible but wrong "done" | No edge states or acceptance criteria | Mandatory "empty/error/boundary" section |
| 13 | Unbounded diff | Verbs like "improve", "across the app" | Warn when diff exceeds N files without an approved plan |
| 14 | Weak passing tests | No edge-case list; trivial assertions | Assertion-quality check on generated tests |
| 15 | Two tasks in one prompt | Batching when rushed | Rule: one concern per prompt or commit |
| 16 | "Fix whatever fails" weakens tests | Gave license to change the test, not the cause | Standing rule: never weaken or mock a test without asking |
| 20 | Commit with no verification | End-of-session fatigue | `/ship-check`: tests green, no `*.db*` staged, diff summary |

**Why these matter most:** the six good habits (01–05, 08) and seven failures (11–16, 20) cover the whole daily loop of orient, plan, build, test, review, ship. This is the best material for modeling repeated behavior as an agentic process.

---

## Special cases (7): not worth automating directly

| # | Task | Why it's a special case | Salvageable lesson |
|---|---|---|---|
| 06 | HTMX fragment check via curl | Tied to HTMX and EJS in this stack | Generalizes to "ask for an observable artifact for UI changes", but a general `/verify-ui` only pays off if I do UI work often |
| 07 | Decision memo on sql.js persistence | One-off architectural decision | The *template* (3 options, recommendation, what would make it wrong) is reusable; the instance is not. Fold into the decision-memo prompt |
| 09 | Windows compatibility sweep | One-time platform audit | Could become a `/portability-audit` skill only if I ship cross-platform often |
| 10 | Untrack `bookshelf.db-wal` / `-shm` | One-time repo cleanup after the better-sqlite3 migration | The "stage and show, don't commit" habit is already captured in #20 |
| 17 | Persistence fix that made seeding slow | Specific to sql.js's whole-DB `export()` | Lesson already covered by the decision-memo template (07) |
| 18 | Agent used the old better-sqlite3 API | Caused by this repo's library migration | Becomes a one-line CLAUDE.md rule: "DB access goes through `all/get/run` in `src/db/index.ts`" |
| 19 | Error handler broke the JSON API | Specific to this app's HTML + JSON surfaces | Becomes a one-line CLAUDE.md rule about the two surfaces |

**Handling:** don't build skills or hooks for these. Capture the salvageable lessons as short notes in the project's `CLAUDE.md` (18, 19) or in the decision-memo template (07, 17).

---

## Borderline calls

- **05 (feature impact analysis):** it uses the schema-change scenario, but "list every file that must change and wait for approval" is a generic planning step. Classified as recurrent.
- **10 (commit hygiene):** the scenario is one-off, but the underlying "I keep the commit decision" habit recurs. Classified as special, with the habit counted under #20.
- **07 (decision memo):** the topic is special, the prompt structure is recurrent. Classified as special, with its template reused elsewhere.

## Suggested build order

1. `/ship-check` (20): cheapest, and it prevents the most embarrassing failures.
2. Prompt linter for vague requests (11, 12, 13): the largest cluster of failures.
3. Bug-fix and test-writer templates (03, 04, 14, 16).
4. `/orient` and gap-analysis subagents (01, 02).
5. CLAUDE.md guardrails (15, 16, 18, 19).
