# Prompt Journal

> **SYNTHETIC DATA — NOT A RECORD OF REAL SESSIONS.**
> These 20 interactions were mocked from an analysis of this repo (Express + sql.js + EJS + HTMX, `src/models`, `src/routes`, `tests/`, ADR-001). None of them happened. The scenarios are realistic and the code issues referenced (e.g. `run()` never calling `saveDb()`) really exist in the repo, but the prompts, agent replies and my "reactions" are illustrative.
> When real sessions replace these, delete the entry rather than editing it, so this file never mixes real and mock data.

## Entry template

- **Task** — what I was trying to do
- **Prompt** — what I typed
- **Outcome** — `DESIRED` / `UNDESIRED`
- **What the agent did** — the result
- **Pattern** — what this reveals about how I think / prompt
- **Automate?** — candidate for a skill, hook, slash command or subagent

---

## Part 1 — Desired outcomes (10)

### 01 · Orienting before touching anything
- **Task:** Get my bearings in an unfamiliar repo.
- **Prompt:** "Read the ADR, package.json and the folder structure. Summarize the architecture in 10 lines, then list the 3 places where you'd expect bugs given the stack (sql.js, EJS, HTMX). Don't change any files."
- **Outcome:** DESIRED
- **What the agent did:** Concise summary; flagged sql.js persistence (in-memory DB, manual export) as the riskiest area.
- **Pattern:** I constrain scope up front ("don't change files") and ask for *risk hypotheses*, not just a description. Read-only first, write later.
- **Automate?** Yes. `/orient` skill: read ADR + manifest + tree, output summary + top-3 risks, read-only.

### 02 · Test gap analysis with an explicit method
- **Task:** Find what is untested.
- **Prompt:** "Compare every exported function in `src/models/*.ts` against `tests/`. Output a table: function, tested (y/n), which test covers it. Only report, no new tests yet."
- **Outcome:** DESIRED
- **What the agent did:** Table showing `user.ts`, `review.ts`, `shelf.ts` fully untested and `updateBook`/`deleteBook`/`searchBooks` missing, matching `tests/README.md`.
- **Pattern:** I split "analyze" from "generate" into two prompts. The table format makes the output verifiable at a glance.
- **Automate?** Yes. Coverage-gap subagent that returns a table and nothing else.

### 03 · Writing tests that follow the existing pattern
- **Task:** Cover `models/review.ts`.
- **Prompt:** "Write `tests/models/review.test.ts` following exactly the structure of `tests/models/book.test.ts` (beforeEach/afterEach, describe blocks). Cover every exported function plus: duplicate user+book review, rating 0 and 6 (the CHECK constraint), and `getAverageRating` on a book with no reviews. Run `npm run test:run` and show me the output."
- **Outcome:** DESIRED
- **What the agent did:** 14 passing tests, caught that `getAverageRating` returns `null` rather than `0`.
- **Pattern:** Anchor to a reference file, enumerate edge cases myself, and demand proof (run the tests). I never accept "done" without output.
- **Automate?** Yes. Test-writer template: reference file + edge-case list + mandatory run.

### 04 · Small, well-bounded bug fix
- **Task:** `POST /api/books` returns 500 on duplicate ISBN.
- **Prompt:** "POST /api/books with an existing ISBN returns 500 (UNIQUE constraint). Make it return 409 `{error: 'ISBN already exists'}` in `src/routes/api.ts`. Reproduce first with a failing supertest, then fix. Keep the diff under 15 lines."
- **Outcome:** DESIRED
- **What the agent did:** Failing test, then a `getBookByIsbn` check before insert. Diff was small.
- **Pattern:** Symptom, expected behavior, location, test-first, and a diff-size cap. The cap prevents scope creep.
- **Automate?** Yes. `/fix-bug` template: symptom / expected / file / repro-test-first / diff budget.

### 05 · Using the schema as the source of truth
- **Task:** Add a `reading_status` to shelf books.
- **Prompt:** "I want per-book reading status (want/reading/read) on `shelf_books`. Before coding, list every file that must change: schema, seed, model, API route, HTML route, EJS view, tests. Wait for my OK."
- **Outcome:** DESIRED
- **What the agent did:** Listed 9 files, including `seed.sql` and `shelves/books-list.ejs`, which I'd have forgotten.
- **Pattern:** I ask for a blast-radius list and a checkpoint before any edits. Plan, approve, then execute.
- **Automate?** Yes. "Impact analysis" step baked into any feature prompt.

### 06 · HTMX change verified in the browser, not just by tests
- **Task:** Make "Add to shelf" update in place.
- **Prompt:** "The add-to-shelf form in `shelves/show.ejs` should swap only `#books-list` via HTMX, no full reload. Start the dev server, hit the route with curl using the `HX-Request` header, and show me the returned fragment so I can confirm it's a partial, not the layout."
- **Outcome:** DESIRED
- **What the agent did:** Verified the fragment was `books-list.ejs` only.
- **Pattern:** For UI behavior, tests aren't enough, so I ask for an observable artifact (the actual HTML response).
- **Automate?** Maybe. A `/verify-ui` helper that curls a route and prints the response.

### 07 · Forcing the agent to challenge its own plan
- **Task:** Decide how to fix sql.js persistence.
- **Prompt:** "`run()` in `src/db/index.ts` never calls `saveDb()`, so writes only reach disk on close. Propose 3 fixes with trade-offs (save every write, debounce, save on shutdown signal). Recommend one, then tell me what would make you wrong."
- **Outcome:** DESIRED
- **What the agent did:** Recommended debounced save plus flush on SIGINT/SIGTERM, and noted the risk of data loss on a hard kill.
- **Pattern:** "Tell me what would make you wrong" pulls out assumptions. I want options plus a recommendation, not a single answer.
- **Automate?** Yes. A "decision memo" prompt: 3 options, recommendation, failure conditions.

### 08 · Review with a role and a rubric
- **Task:** Review my own diff before committing.
- **Prompt:** "Act as a skeptical reviewer. Review `git diff` for: missing input validation, unparameterized SQL, routes that return JSON where HTML is expected, and untested branches. For each finding give file:line and a one-line fix. If you find nothing in a category, say so explicitly."
- **Outcome:** DESIRED
- **What the agent did:** Found PATCH `/api/reviews/:id` doesn't validate rating range (only POST does).
- **Pattern:** A checklist-driven review with "say so explicitly when nothing found" prevents silent skipping.
- **Automate?** Yes. Pre-commit review subagent with this rubric.

### 09 · Windows compatibility sweep
- **Task:** Find POSIX-only assumptions.
- **Prompt:** "Grep for hard-coded `/tmp`, `require(` inside ESM, forward-slash path concatenation and shell-only npm scripts. Give me a list with file:line. Do not fix yet."
- **Outcome:** DESIRED
- **What the agent did:** Found `/tmp/test-*.db` in tests, `require('fs')` in `api.test.ts`, and the `node -e` copy-assets script (already portable).
- **Pattern:** Pattern-sweep prompts with a specific grep list work well. Report first, fix second.
- **Automate?** Yes. `/portability-audit` skill.

### 10 · Commit hygiene on request
- **Task:** Clean up repo noise.
- **Prompt:** "`bookshelf.db-wal` and `bookshelf.db-shm` are tracked in git, leftovers from better-sqlite3. Check `.gitignore`, untrack them with `git rm --cached`, add ignore rules for `*.db*`, and show me `git status` before committing. Don't commit."
- **Outcome:** DESIRED
- **What the agent did:** Exactly that; stopped at status.
- **Pattern:** I reserve the commit decision for myself. I ask the agent to stage and show, never to finalize.
- **Automate?** Maybe. Hook or rule: never commit without explicit instruction.

---

## Part 2 — Undesired outcomes (10)

### 11 · Vague feature request
- **Task:** Add search.
- **Prompt:** "add search to the app"
- **Outcome:** UNDESIRED
- **What the agent did:** Built a new `/search` page, a new model function (duplicating existing `searchBooks`), and new CSS. Ignored the existing HTMX pattern.
- **Pattern:** When tired, I drop the three things I normally give (scope, reuse constraint, where). The agent filled the gaps with its own architecture.
- **Automate?** Yes. A prompt linter or skill that asks "where, reuse what, done when?" if the request is under ~15 words.

### 12 · No acceptance criteria, so a plausible but wrong "done"
- **Task:** Rating display on book page.
- **Prompt:** "show the average rating on the book page"
- **Outcome:** UNDESIRED
- **What the agent did:** Called `getAverageRating`, rendered `null` as the string "null" for unreviewed books and an unrounded `4.333333333` for others.
- **Pattern:** I specify the feature but not the edge states (no reviews, rounding, display format). The agent only builds the happy path unless told otherwise.
- **Automate?** Yes. Feature template with a mandatory "empty / error / boundary states" section.

### 13 · Over-broad "fix everything" prompt
- **Task:** Clean up error handling.
- **Prompt:** "improve error handling across the app"
- **Outcome:** UNDESIRED
- **What the agent did:** Touched 11 files, wrapped every route in try/catch, changed the global error handler's response shape, which broke the existing 404 tests.
- **Pattern:** Unbounded verbs ("improve", "across") produce unbounded diffs. My good prompts always carry a size cap or file list.
- **Automate?** Yes. Hook that warns when a diff exceeds N files without a prior approved plan.

### 14 · Trusting "tests pass" without reading them
- **Task:** Tests for `shelf.ts`.
- **Prompt:** "write tests for the shelf model"
- **Outcome:** UNDESIRED
- **What the agent did:** Wrote tests that passed, but several asserted `expect(result).toBeDefined()` and never checked cascade-delete or the duplicate-book case.
- **Pattern:** I didn't provide an edge-case list (compare entry 03). Weak assertions pass trivially.
- **Automate?** Yes. Test-quality checklist: every test needs a specific assertion; flag `toBeDefined`/`toBeTruthy`-only tests.

### 15 · Mixing two unrelated tasks in one prompt
- **Task:** Bug fix plus refactor.
- **Prompt:** "fix the shelf duplicate-add bug in the HTML route and also tidy up the routes folder"
- **Outcome:** UNDESIRED
- **What the agent did:** Fixed the bug (HTML route ignored `addBookToShelf` returning false), but the "tidy" renamed files and moved handlers, making the bug fix impossible to review in isolation.
- **Pattern:** When I'm in a hurry I batch tasks. Reviewability collapses.
- **Automate?** Yes. Rule: one concern per prompt/commit; the agent should push back when asked for two.

### 16 · Environment mismatch not stated
- **Task:** Run the tests.
- **Prompt:** "run the tests and fix whatever fails"
- **Outcome:** UNDESIRED
- **What the agent did:** On Windows, `/tmp/test-api.db` failed. The agent "fixed" it by rewriting the tests to mock the DB layer entirely, so they no longer test the real SQL.
- **Pattern:** "Fix whatever fails" gives license to change the test instead of the cause. I didn't say "tests are the spec, change the code or the path, not the assertions".
- **Automate?** Yes. Standing instruction: never weaken or mock a test to make it pass without asking.

### 17 · Accepting a dependency swap without a fallback
- **Task:** Persistence reliability.
- **Prompt:** "make the database writes persist"
- **Outcome:** UNDESIRED
- **What the agent did:** Called `saveDb()` after *every* `run()`. It works, but `db.export()` serializes the whole database each time, so bulk seeding became slow.
- **Pattern:** I asked for the outcome without stating a constraint (performance) or asking for alternatives. Compare entry 07, where asking for options produced a better result.
- **Automate?** Yes. For any "make X reliable" prompt, default to the 3-options-plus-failure-conditions memo.

### 18 · Hallucinated API from stale knowledge
- **Task:** sql.js usage.
- **Prompt:** "use prepared statements with named parameters for the review queries"
- **Outcome:** UNDESIRED
- **What the agent did:** Wrote better-sqlite3 style `stmt.get({ id })` and `.run()` return values. sql.js has a different API (`bind`, `step`, `getAsObject`, and `changes` via a separate query), so it compiled (types are `any`) but failed at runtime.
- **Pattern:** The repo recently migrated libraries (see git history). Agents regress to the more popular older API. I didn't point at the existing wrapper in `src/db/index.ts`.
- **Automate?** Yes. Add to CLAUDE.md: "DB access goes through `all/get/run` in `src/db/index.ts`; never call sql.js directly."

### 19 · Letting the agent decide the response contract
- **Task:** Consistent error responses.
- **Prompt:** "make the HTML routes return proper error pages"
- **Outcome:** UNDESIRED
- **What the agent did:** Changed the global error handler to `res.render('error')`. That broke `/api/*` clients, which relied on the JSON `{ error }` shape. No route-level distinction between HTML and API.
- **Pattern:** I described one surface (HTML) and forgot the app has two (HTML + JSON API; see ADR-001). The agent has no way to know which contract matters most.
- **Automate?** Yes. CLAUDE.md note: "two surfaces, HTML under `/`, JSON under `/api`; error handling must preserve both".

### 20 · Premature "ship it" with no verification step
- **Task:** Final wrap-up.
- **Prompt:** "looks good, commit and push"
- **Outcome:** UNDESIRED
- **What the agent did:** Committed with an unhelpful message, including a stray regenerated `bookshelf.db` and `-wal` files. No test run beforehand.
- **Pattern:** My end-of-session fatigue skips my own checklist (run tests, check `git status`, review diff, then commit). Compare entry 10, where I held the commit back.
- **Automate?** Yes. Pre-commit hook or `/ship-check`: tests green, no `*.db*` staged, diff summarized, then commit.

---

## Part 3 — Patterns across the 20 entries

### What I do when it goes well (01–10)
| Habit | Seen in |
|---|---|
| Separate analysis from generation (report first, then act) | 01, 02, 09 |
| Anchor to an existing file as the pattern to follow | 03 |
| Demand evidence (run tests, show output, show the fragment) | 03, 04, 06 |
| Cap the scope (diff size, file list, "don't change files") | 01, 04, 05 |
| Ask for options plus a recommendation plus what would make it wrong | 07 |
| Keep irreversible actions (commit) with me | 10 |

### What I do when it goes badly (11–20)
| Habit | Seen in |
|---|---|
| Under-specified request when tired or rushed | 11, 12, 13 |
| No edge cases or acceptance criteria | 12, 14 |
| Batching unrelated work | 15 |
| Unbounded verbs ("improve", "fix whatever fails") | 13, 16 |
| Not stating constraints the agent can't infer (perf, two surfaces, Windows, which DB API) | 16, 17, 18, 19 |
| Skipping my own verification checklist at the end | 20 |

### Candidate automations (ranked by how often the pattern recurs)
1. **Prompt-spec linter / skill:** short or vague requests get "where, reuse what, done when, edge states?" before the agent starts. (11, 12, 13)
2. **Read-only-first `/orient` and analysis subagents:** summary, risks, gap tables, portability audit. (01, 02, 09)
3. **Test-writing template:** reference file + my edge-case list + mandatory run + assertion-quality check. (03, 14, 16)
4. **Bug-fix template:** symptom / expected / file / repro test first / diff budget. (04, 15)
5. **Project CLAUDE.md guardrails:** use the `src/db` wrapper; two response surfaces; never weaken tests; one concern per change. (16, 18, 19)
6. **`/ship-check` pre-commit gate:** tests green, no `*.db*` staged, diff summary, then commit. (10, 20)
7. **Decision-memo prompt:** 3 options, recommendation, failure conditions, for any "make X reliable/better" request. (07, 17)

### Real repo issues the mocked entries relied on (verified in code)
- `run()` in `src/db/index.ts` never calls `saveDb()`; persistence only happens in `initDb` and `closeDb`.
- `PATCH /api/reviews/:id` has no rating-range validation (only `POST` does).
- `POST /api/books` has no duplicate-ISBN handling (schema has `UNIQUE`).
- `POST /shelves/:id/books` (HTML) ignores the `false` from `addBookToShelf` and doesn't guard against `NaN`.
- The global error handler always responds with JSON, even for HTML routes.
- `tests/routes/api.test.ts` uses `/tmp/...` paths and `require('fs')` inside an ESM test.
- `bookshelf.db-shm` / `bookshelf.db-wal` are tracked in git.
