# Prompt Categorization: Recurrent vs. Special Cases

> **Based on mocked prompts grounded in this repo.** This categorizes the 20 entries in `prompt_journal.md`, rewritten on 2026-11-25 so each one ties to something verifiable in the code or git history. The recurrence judgments are my estimates of what a developer does repeatedly, not measurements from real sessions. Re-check them once real entries exist.

## How I decided

| Category | Test |
|---|---|
| **Recurrent** | The *task type* is generic. It would come up in almost any repo, on most working days, and the prompt shape can be reused as-is. |
| **Special case** | The prompt depends on a specific library, platform, persistence design or one-time cleanup. The prompt itself rarely repeats, though a lesson from it might. |

**Result:** 13 recurrent, 7 special.

---

## What changed from the first version

The first journal contained invented agent behavior and scenarios that the repo didn't support (for example, a Windows `/tmp` failure when all 14 tests pass on Windows, or an average-rating display bug when `books/show.ejs` already handles `null`). Those entries were replaced. As a result:

- Entries now carry **Repo evidence** and **Expected change** instead of an invented "what the agent did".
- Part 2 is now **weak prompts** (under-specified), not "undesired outcomes", since I can't know what an agent would have done.
- Two earlier habits no longer have an entry behind them and were dropped: **"orient first"** (it produces no code) and **"self-review before commit"** (no code-producing prompt). Neither is in `CLAUDE.md` any more.
- Three entries are new in substance: **06** (a real HTMX target problem, found by reading the partials), **08** (the existing-database risk of adding a column) and **05** (PATCH rating check).

---

## Recurrent (13): automation candidates

### Good habits to codify (6)

| # | Task | Reusable shape | Automation |
|---|---|---|---|
| 01 | Implement a stubbed feature | Name the file, the function to reuse, and empty/no-match states | Feature template: where, reuse what, edge states, how to check |
| 02 | Test gap analysis, then tests | Compare code to tests; table; report only; then add tests in the existing file | Gap-analysis subagent |
| 03 | Write tests like an existing file | Reference file + my edge-case list + run it | Test-writer template |
| 04 | Small bug fix | Symptom / expected / file / failing test first / diff cap | `/fix-bug` template |
| 05 | Fix one route to match its sibling | Point at the working code, say what must not change | Part of `/fix-bug` |
| 08 | Feature impact analysis | List every file to change and the data risks; wait for approval | Planning step in feature prompts |

### Recurring weak-prompt gaps to guard against (7)

| # | Gap | What the prompt left out | Guardrail |
|---|---|---|---|
| 11 | Vague feature request | Scope, reuse and location | Prompt linter: "where, reuse what, done when?" |
| 12 | Missing edge states | Empty state, format, query shape | Mandatory "empty/error/boundary" section |
| 13 | Unbounded verbs | A limit on files or concerns | Warn when a diff exceeds N files without an approved plan |
| 14 | Tests with no edge-case list | Behaviors worth asserting | Assertion-quality check on generated tests |
| 15 | Two tasks in one prompt | One concern per change | Rule: one concern per prompt or commit |
| 16 | "Fix whatever fails" | Whether tests or code are the source of truth | Standing rule: never weaken or mock a test without asking |
| 20 | Commit with no verification | A checklist before commit | `/ship-check`: tests green, no `*.db*` staged, diff summary |

**Why these matter most:** the six strong prompts and seven weak ones cover the daily loop of plan, build, test and ship. This is the best material for modeling repeated behavior as an agentic process.

---

## Special cases (7): not worth automating directly

| # | Task | Why it's a special case | Salvageable lesson |
|---|---|---|---|
| 06 | HTMX swap target missing from partials | Tied to HTMX and EJS in this stack | "For UI changes, ask for the actual response" generalizes, but a `/verify-ui` skill only pays off if UI work is frequent |
| 07 | Decision memo on sql.js persistence | One-off architectural decision | The *template* (3 options, recommendation, what would make it wrong) is reusable; the instance is not |
| 09 | Portable test paths | Tied to this suite's `/tmp` paths and `require('fs')`; tests already pass on Windows | A `/portability-audit` skill only if I ship cross-platform often |
| 10 | Untrack `bookshelf.db-wal` / `-shm` | One-time cleanup of files left by the old database library | "Stage and show, don't commit" is already covered in 20 |
| 17 | Persistence request with no constraints | Specific to sql.js's whole-database `export()` | Covered by the decision-memo template (07) |
| 18 | Named-parameters prompt vs. the DB wrapper | Caused by this repo's wrapper and its library migration | One-line `CLAUDE.md` rule: DB access goes through `all/get/run` in `src/db/index.ts` |
| 19 | Error pages vs. the JSON API | Specific to this app's HTML + JSON surfaces | One-line `CLAUDE.md` rule about the two surfaces |

**Handling:** don't build skills or hooks for these. Capture the salvageable lessons as short notes in `CLAUDE.md` (18, 19) or in the decision-memo template (07, 17).

---

## Borderline calls

- **01 (implement the search stub):** the instance is a one-time homework gap, but "implement a stubbed feature with reuse and edge states" recurs. Classified as recurrent by shape.
- **05 (PATCH rating check):** repo-specific, but the shape ("make this route match its working sibling") is generic. Classified as recurrent, grouped with 04.
- **08 (feature impact analysis):** it uses a schema-change scenario, but "list every file that must change and wait for approval" is a generic planning step. Classified as recurrent.
- **07 (decision memo):** the topic is special, the prompt structure is recurrent. Classified as special, with its template reused elsewhere.
- **10 (commit hygiene):** the cleanup is one-off, but the habit recurs. Classified as special, with the habit counted under 20.

## Suggested build order

1. `/ship-check` (20): cheapest, and it prevents the most avoidable mistakes.
2. Prompt linter for vague requests (11, 12, 13): the largest cluster of gaps.
3. Bug-fix and test-writer templates (03, 04, 05, 14, 16).
4. Gap-analysis subagent and the impact-analysis step (02, 08).
5. `CLAUDE.md` guardrails (15, 16, 18, 19).
