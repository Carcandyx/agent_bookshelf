# Prompt Journal

> **MOCKED PROMPTS, GROUNDED IN THIS REPO.** These 20 entries are prompts I might plausibly type to change code in this repo (Express + sql.js + EJS + HTMX). None are records of real sessions.
> Every entry points at **repo evidence** (a file, function or git fact) that I checked by reading the code, the git history, or running `npx vitest run` (14/14 passing on Windows on 2026-11-25).
> There are **no invented agent replies**. I don't know what an agent would answer, so I don't write it down. Each entry says instead what code change the prompt should lead to and how to check it.
> "Verified by reading" means I read the code but did not run the app, so confirm by running before relying on it.
> When real sessions replace these, delete the entry instead of editing it, so this file never mixes real and mock data.

## Entry template

- **Task**: what I'm trying to do
- **Prompt**: what I'd type
- **Prompt quality**: `STRONG` (scoped, checkable) / `WEAK` (under-specified)
- **Repo evidence**: what in the repo makes this a real task
- **Expected change**: the code this should produce, and how to check it
- **Pattern**: what this reveals about how I prompt
- **Automate?**: candidate for a skill, hook, slash command or subagent

---

## Part 1: Strong prompts (10)

### 01 · Implement the search stub
- **Task:** Make the homepage search work.
- **Prompt:** "Implement `GET /books/search` in `src/routes/books.ts`. Reuse `Book.searchBooks`. Return only the book-card HTML fragment (same markup as `books/index.ejs`), not the layout. Handle an empty `q` (show all books) and no results (a short message). Don't add new files unless the card markup has to be shared as a partial."
- **Prompt quality:** STRONG
- **Repo evidence:** The route is a stub with `// TODO: Implement search functionality` (`src/routes/books.ts`). `books/index.ejs` already has the HTMX input (`hx-get="/books/search"`, target `#search-results`). `searchBooks` exists in `src/models/book.ts` and has no test.
- **Expected change:** Route calls `Book.searchBooks`, renders a fragment. Check with `curl "localhost:3000/books/search?q=dune"` and with `q=` and a query that matches nothing.
- **Pattern:** I name the file, the function to reuse and the edge states (empty, no match). That blocks a duplicate implementation.
- **Automate?** Yes. Feature template: where, reuse what, edge states, how to check.

### 02 · Test gap analysis, then tests (two prompts)
- **Task:** Close the gaps `tests/README.md` lists for the book model.
- **Prompt:** (1) "Compare every exported function in `src/models/book.ts` against `tests/models/book.test.ts`. Table: function, tested y/n. Report only." Then (2) "Add tests for the untested ones, following the structure already in that file. Run `npm run test:run`."
- **Prompt quality:** STRONG
- **Repo evidence:** `book.test.ts` has `describe` blocks for `getAllBooks`, `getBookById` and `createBook` only. `updateBook`, `deleteBook` and `searchBooks` are untested, and `tests/README.md` says so.
- **Expected change:** New tests inside `book.test.ts`. Check that the test run still passes and that each new test asserts a specific value.
- **Pattern:** I split analysis from generation. The table makes the report checkable at a glance.
- **Automate?** Yes. Gap-analysis subagent that returns a table and nothing else.

### 03 · Tests for the review model, with my edge cases
- **Task:** Cover `src/models/review.ts` (no tests exist).
- **Prompt:** "Write `tests/models/review.test.ts` following the structure of `tests/models/book.test.ts`. Cover every exported function plus: a second review by the same user for the same book, rating 0 and 6, and `getAverageRating` on a book with no reviews. Run `npm run test:run` and show the output."
- **Prompt quality:** STRONG
- **Repo evidence:** `schema.sql` has `UNIQUE(user_id, book_id)` and `CHECK(rating >= 1 AND rating <= 5)` on `reviews`. `getAverageRating` is typed `number | null` and uses SQL `AVG`.
- **Expected change:** New test file. The model has no application-level validation, so the duplicate and range cases should throw from SQLite. The no-reviews case should assert the current value (I expect `null`, but run it to find out).
- **Pattern:** I anchor to a reference file, list the edge cases myself, and ask for proof by running the tests.
- **Automate?** Yes. Test-writer template: reference file + edge-case list + mandatory run.

### 04 · Duplicate ISBN on book creation
- **Task:** `POST /api/books` with an existing ISBN.
- **Prompt:** "`POST /api/books` with an ISBN that already exists should return 409 `{ error: 'ISBN already exists' }` instead of an unhandled error. Reproduce with a failing supertest in `tests/routes/api.test.ts` first, then fix in `src/routes/api.ts`. Keep the diff under 15 lines."
- **Prompt quality:** STRONG
- **Repo evidence:** `books.isbn` is `UNIQUE` in `schema.sql`. The route calls `Book.createBook` with no existence check, and `POST /api/reviews` shows the check-then-409 pattern to copy. Verified by reading: a thrown SQLite error would reach the global handler, which answers 500.
- **Expected change:** One new failing test, then a small check before insert. Check that the new test goes red then green.
- **Pattern:** Symptom, expected response, location, test first, and a diff cap.
- **Automate?** Yes. `/fix-bug` template: symptom / expected / file / repro first / diff budget.

### 05 · PATCH review skips the rating check
- **Task:** Make `PATCH /api/reviews/:id` as strict as `POST`.
- **Prompt:** "`POST /api/reviews` rejects ratings outside 1..5 with 400, but `PATCH /api/reviews/:id` doesn't check. Add the same check to PATCH, with a failing test first. Don't touch POST."
- **Prompt quality:** STRONG
- **Repo evidence:** In `src/routes/api.ts`, POST has `if (rating < 1 || rating > 5)`. PATCH passes `req.body` straight to `Review.updateReview`.
- **Expected change:** A 400 on `rating: 6` for PATCH. Check with a test, and confirm the POST tests still pass.
- **Pattern:** I point at the working sibling code and say what must not change.
- **Automate?** Yes. Part of the `/fix-bug` template.

### 06 · HTMX swap removes its own target
- **Task:** Make "Add a Review" and "Add to Shelf" work more than once per page load.
- **Prompt:** "The forms in `books/show.ejs` and `shelves/show.ejs` use `hx-swap=\"outerHTML\"` with targets `#reviews-list` and `#shelf-books-list`. The partials they return (`books/reviews-list.ejs`, `shelves/books-list.ejs`) don't contain an element with that id. Start the dev server, POST with the `HX-Request` header, show me the returned fragment, then propose the smallest fix. Wait for my OK."
- **Prompt quality:** STRONG
- **Repo evidence:** Verified by reading: `reviews-list.ejs` starts with an `if` and no wrapper id, and `books-list.ejs` starts with `<div class="shelf-books">`. After the first swap, the target id would no longer exist. I have **not** run this in a browser.
- **Expected change:** A fragment that carries the id, or `innerHTML` swap. Check by submitting twice in the browser.
- **Pattern:** For UI changes, I ask for an observable artifact (the actual HTML) rather than trusting tests.
- **Automate?** Maybe. A `/verify-ui` helper that curls a route with `HX-Request` and prints the fragment.

### 07 · Decision memo on persistence
- **Task:** Decide how database writes reach disk.
- **Prompt:** "`run()` in `src/db/index.ts` never calls `saveDb()`. Writes only reach disk in `initDb` and `closeDb`, and nothing calls `closeDb` on shutdown. Propose 3 options with trade-offs (save per write, debounce, save on SIGINT/SIGTERM). Recommend one and tell me what would make that recommendation wrong. Don't edit code yet."
- **Prompt quality:** STRONG
- **Repo evidence:** `grep saveDb` finds it only inside `initDb`, its own definition, and `closeDb`. `saveDb` exports the whole database with `db.export()`. There are no signal handlers in `src` or `bin`.
- **Expected change:** A memo (no code). If I approve an option, a follow-up prompt implements it and a test checks that a write survives re-opening the database file.
- **Pattern:** "Tell me what would make you wrong" surfaces assumptions. I want options plus a recommendation.
- **Automate?** Yes. Decision-memo prompt template.

### 08 · New field: impact analysis before coding
- **Task:** Add a reading status (want/reading/read) to books on a shelf.
- **Prompt:** "I want a `reading_status` per book on a shelf (`shelf_books`). Before editing anything, list every file that must change, in order, and call out any risk for an existing `bookshelf.db`. Wait for my OK."
- **Prompt quality:** STRONG
- **Repo evidence:** `shelf_books` is defined in `schema.sql` and populated in `seed.sql` (around line 80). It is read by `ShelfBook` and `addBookToShelf` in `src/models/shelf.ts`, by the shelf routes in `src/routes/api.ts` and `src/routes/shelves.ts`, and rendered by `shelves/books-list.ejs`. `schema.sql` uses `CREATE TABLE IF NOT EXISTS`, and `initDb` seeds only when `users` is empty, so an existing database file would **not** pick up a new column.
- **Expected change:** A file list that includes the existing-database risk. Check that the list names schema, seed, model, both routes, the view and tests.
- **Pattern:** I ask for a blast-radius list and a checkpoint before any edit.
- **Automate?** Yes. Impact-analysis step in any feature prompt.

### 09 · Make test paths portable
- **Task:** Remove POSIX-only paths and `require` from the tests.
- **Prompt:** "The tests hard-code `/tmp/...` DB paths and call `require('fs')` inside ESM files: `tests/db.test.ts`, `tests/models/book.test.ts`, `tests/routes/api.test.ts`, `tests/setup.ts`. Use `os.tmpdir()` with `path.join` and a top-level `import { unlinkSync } from 'fs'`. Change tests only, no assertions. Run `npm run test:run` before and after, and show both."
- **Prompt quality:** STRONG
- **Repo evidence:** The `/tmp` and `require('fs')` lines are in the four files above (grep). The project's history includes two Windows-compatibility commits (`7e5d869`, `c46cfd9`) that did not touch the tests. The suite currently passes on Windows, so this is hardening, not a bug fix.
- **Expected change:** Same 14 tests, same assertions, different paths. Check with the before/after output.
- **Pattern:** Report-then-fix, a narrow file list, "no assertion changes", and proof by running.
- **Automate?** Maybe. A `/portability-audit` skill only if I ship cross-platform often.

### 10 · Untrack the SQLite sidecar files
- **Task:** Stop the database sidecar files from showing up in every commit.
- **Prompt:** "`bookshelf.db-wal` and `bookshelf.db-shm` are tracked by git. Untrack them with `git rm --cached`, add `*.db-wal` and `*.db-shm` to `.gitignore`, and show me `git status`. Don't commit."
- **Prompt quality:** STRONG
- **Repo evidence:** `git ls-files` lists both files. `.gitignore` has `*.db`, `*.sqlite` and `*.sqlite3` but nothing that matches `-wal` or `-shm`. Most commits in `git log --stat` include binary changes to them.
- **Expected change:** Two staged deletions and a `.gitignore` edit, left uncommitted. Check `git status`.
- **Pattern:** I keep the commit decision. The agent stages and shows.
- **Automate?** Maybe. A standing rule: never commit without an explicit instruction.

---

## Part 2: Weak prompts (10)

Each of these is under-specified. The evidence column says what the prompt leaves out that the repo makes necessary. The "better version" is what I'd add.

### 11 · "add search to the app"
- **Task:** Search.
- **Prompt:** "add search to the app"
- **Prompt quality:** WEAK
- **Repo evidence:** Search is already half built: a stub route with a TODO, an HTMX input wired to it, and `searchBooks` in the model. The prompt names none of that.
- **Expected change (if specific):** See entry 01. A vague prompt leaves "where" and "reuse what" open, so the result may duplicate `searchBooks`.
- **Pattern:** When rushed, I drop scope, reuse and location.
- **Automate?** Yes. A prompt linter: "where, reuse what, done when?" for requests under about 15 words.

### 12 · "show the average rating on the book list"
- **Task:** Ratings on the homepage cards.
- **Prompt:** "show the average rating on the book list"
- **Prompt quality:** WEAK
- **Repo evidence:** `getAverageRating(bookId)` returns one book's average and is `null` when there are no reviews. `books/show.ejs` guards with `if (averageRating)` and formats with `toFixed(1)`. `books/index.ejs` receives plain books and has no rating data, and the prompt doesn't say what unrated books show or how to avoid one query per book.
- **Better version:** "...show it on each card in `books/index.ejs`, one decimal like `show.ejs`, 'No ratings' for books without reviews, using a single query, not one per book."
- **Pattern:** I describe the feature but not the empty state, format or query shape.
- **Automate?** Yes. Feature template with a required "empty / error / boundary states" section.

### 13 · "improve error handling across the app"
- **Task:** Error handling.
- **Prompt:** "improve error handling across the app"
- **Prompt quality:** WEAK
- **Repo evidence:** `parseInt(req.params.id)` is used without a NaN check in every router. `server.ts` has one global handler that always answers JSON. HTML routes render `error.ejs` for 404 and send inline `<p class="error">` fragments for 400. "Improve" and "across" give no limit on which of these to touch.
- **Better version:** One concern and one file list, such as "return 400 for a non-numeric id in `src/routes/api.ts` only, with tests".
- **Pattern:** Unbounded verbs produce unbounded diffs. My good prompts carry a size cap or a file list.
- **Automate?** Yes. Hook that warns when a diff touches more than N files without an approved plan.

### 14 · "write tests for the shelf model"
- **Task:** Shelf tests.
- **Prompt:** "write tests for the shelf model"
- **Prompt quality:** WEAK
- **Repo evidence:** `src/models/shelf.ts` has behavior worth naming: `addBookToShelf` returns `false` for a duplicate, deleting a shelf cascades to `shelf_books` (schema `ON DELETE CASCADE`, with `PRAGMA foreign_keys = ON` in `initDb`), and `UNIQUE(user_id, name)` limits shelf names. The prompt lists none of them, and no shelf tests exist.
- **Better version:** See entry 03: a reference file, an explicit edge-case list, and a run.
- **Pattern:** Without my edge-case list, assertions tend toward "is defined".
- **Automate?** Yes. Test-quality check: every test needs a specific assertion.

### 15 · Two tasks in one prompt
- **Task:** Bug fix plus cleanup.
- **Prompt:** "fix the shelf duplicate-add bug in the HTML route and also tidy up the routes folder"
- **Prompt quality:** WEAK
- **Repo evidence:** The real bug is in `POST /shelves/:id/books` (`src/routes/shelves.ts`): it ignores the `false` from `addBookToShelf` and calls `parseInt(bookId)` with no NaN check. "Tidy up" has no defined target, so any rename or move would also land in the bug-fix diff.
- **Better version:** Two prompts and two commits. The bug fix first, with a failing test.
- **Pattern:** When in a hurry I batch work, and reviewability collapses.
- **Automate?** Yes. Rule: one concern per prompt and per commit.

### 16 · "run the tests and fix whatever fails"
- **Task:** Run the tests.
- **Prompt:** "run the tests and fix whatever fails"
- **Prompt quality:** WEAK
- **Repo evidence:** On 2026-11-25 all 14 tests pass on Windows, so there is nothing to fix. The prompt still invites changes, and it doesn't say whether the tests or the code are the source of truth.
- **Better version:** "Run `npm run test:run` and report. If something fails, tell me which test and why. Don't change a test without asking."
- **Pattern:** "Fix whatever fails" gives license to change the check instead of the cause.
- **Automate?** Yes. Standing instruction: never weaken or mock a test without asking.

### 17 · "make the database writes persist"
- **Task:** Persistence.
- **Prompt:** "make the database writes persist"
- **Prompt quality:** WEAK
- **Repo evidence:** `run()` never saves, and `saveDb` writes the whole database each time (`db.export()` then `writeFileSync`). The prompt gives no constraint on cost or on how a hard kill should behave, and no alternatives are requested.
- **Better version:** Entry 07: three options, a recommendation and failure conditions first.
- **Pattern:** I ask for the outcome without constraints or alternatives.
- **Automate?** Yes. Default to the decision-memo prompt for any "make X reliable" request.

### 18 · "use prepared statements with named parameters"
- **Task:** Review queries.
- **Prompt:** "use prepared statements with named parameters for the review queries"
- **Prompt quality:** WEAK
- **Repo evidence:** Every query in `src/models/review.ts` is already parameterized with `?` through the `all/get/run` wrappers in `src/db/index.ts`, which take an array of params. The project migrated from better-sqlite3 to sql.js in `2cef3d5`. The prompt doesn't mention the wrapper, so a change could bypass it.
- **Better version:** "Keep using `all/get/run` from `src/db/index.ts`. Don't call sql.js directly. Change only the queries in `review.ts`, and explain what named parameters would add."
- **Pattern:** I don't say which layer the code must go through.
- **Automate?** Yes. A `CLAUDE.md` rule: DB access goes through the wrapper.

### 19 · "make the HTML routes return proper error pages"
- **Task:** Error pages.
- **Prompt:** "make the HTML routes return proper error pages"
- **Prompt quality:** WEAK
- **Repo evidence:** HTML routes already `render('error', ...)` for 404s. Only the global handler in `server.ts` answers every error with JSON, including HTML routes' 500s, and `/api` clients rely on that JSON. The prompt names one surface and the app has two.
- **Better version:** "In `server.ts`, make the global handler render `error.ejs` only when the path isn't under `/api`. `/api` keeps JSON. Add one test for each surface."
- **Pattern:** I describe one surface and forget the other.
- **Automate?** Yes. A `CLAUDE.md` note: two surfaces (HTML under `/`, JSON under `/api`).

### 20 · "looks good, commit and push"
- **Task:** Wrap-up.
- **Prompt:** "looks good, commit and push"
- **Prompt quality:** WEAK
- **Repo evidence:** `bookshelf.db-wal` and `bookshelf.db-shm` are tracked and appear as binary changes in most commits in the history. The prompt skips running the tests, checking `git status` and reading the diff.
- **Better version:** "Run the tests, show `git status` and a diff summary, make sure no `*.db*` files are staged, then wait for me to say commit."
- **Pattern:** End-of-session fatigue skips my own checklist.
- **Automate?** Yes. `/ship-check`: tests green, no `*.db*` staged, diff summary, then commit.

---

## Part 3: Patterns across the 20 entries

### What a strong prompt has (01–10)
| Habit | Seen in |
|---|---|
| Separate analysis from generation (report first, then act) | 02, 06, 07, 08, 09 |
| Anchor to an existing file or sibling code | 01, 03, 05 |
| Demand evidence (run tests, show the fragment, show git status) | 03, 06, 09, 10 |
| Cap the scope (diff size, file list, "don't touch X") | 04, 05, 09 |
| Ask for options plus a recommendation plus what would make it wrong | 07 |
| Name the edge states up front | 01, 03 |
| Keep irreversible actions (commit) with me | 10 |

### What a weak prompt is missing (11–20)
| Gap | Seen in |
|---|---|
| Where it goes and what to reuse | 11, 18 |
| Edge states and format | 12, 14 |
| A size limit or file list | 13 |
| One concern at a time | 15 |
| Which side is the source of truth (test vs. code) | 16 |
| Constraints and alternatives | 17 |
| Which surface (HTML or JSON) | 19 |
| My own verification checklist | 20 |

### Candidate automations
1. **Prompt linter / skill:** short requests get "where, reuse what, done when, edge states?" (11, 12, 13)
2. **Read-only-first analysis prompts:** orient, gap tables, portability grep. (02, 06, 08, 09)
3. **Test-writing template:** reference file + edge-case list + mandatory run + assertion quality. (02, 03, 14, 16)
4. **Bug-fix template:** symptom / expected / file / repro first / diff budget. (04, 05, 15)
5. **`CLAUDE.md` guardrails:** use the `src/db` wrapper; two response surfaces; never weaken tests; one concern per change. (16, 18, 19)
6. **`/ship-check` pre-commit gate:** tests green, no `*.db*` staged, diff summary, then commit. (10, 20)
7. **Decision-memo prompt:** 3 options, recommendation, failure conditions. (07, 17)

### Repo facts these entries rely on
Checked by reading code, git history or running the suite:
- `GET /books/search` in `src/routes/books.ts` is a TODO stub, and `Book.searchBooks` exists without tests.
- `run()` in `src/db/index.ts` never calls `saveDb()`. Nothing calls `closeDb()` on shutdown.
- `PATCH /api/reviews/:id` has no rating-range check. `POST` has one.
- `POST /api/books` has no duplicate-ISBN check, and the schema has `UNIQUE`.
- `POST /shelves/:id/books` ignores the `false` from `addBookToShelf` and has no NaN guard.
- `books/reviews-list.ejs` and `shelves/books-list.ejs` have no wrapper with the id their forms target (verified by reading, **not run in a browser**).
- The global error handler in `server.ts` always responds with JSON.
- The tests use `/tmp/...` paths and `require('fs')`, and **all 14 pass on Windows**.
- `bookshelf.db-wal` and `bookshelf.db-shm` are tracked in git and `.gitignore` doesn't cover them.
- The better-sqlite3 to sql.js migration is commit `2cef3d5`. The Windows commits are `7e5d869` and `c46cfd9`.
