# Special Cases That Will Come Back

> **Based on mocked prompts grounded in this repo, plus my own judgment.** This takes the 7 special cases from `prompt_categorization.md` (06, 07, 09, 10, 17, 18, 19) and asks which ones I will need again, even though they are not daily actions. Every entry rests on something checked in the code, git history or a test run. The "how likely" calls are estimates. Re-check them once real journal entries exist.

## How I decided

A special case belongs here if it has a **known trigger**: a concrete event in this project that will make the same situation come back. Recurrent tasks come back on a schedule. These come back on an event.

| Verdict | Meaning |
|---|---|
| **Will return** | The underlying problem is still open in the repo, or a trigger is already visible |
| **May return** | It depends on a decision I haven't made yet |
| **Pending, one-time** | Still undone today, but once done it won't recur. Only the lesson survives |

**Result:** 4 will return, 2 may return, 1 pending one-time.

---

## Will return (4)

| # | Case | Why it comes back (repo evidence) | What to keep ready |
|---|---|---|---|
| 06 | HTMX swap target missing from partials | Open and unconfirmed. `reviews-list.ejs` and `books-list.ejs` have no wrapper with the id their forms target, and both forms use `hx-swap="outerHTML"`. The app has more HTMX interactions (search results, add/remove on shelves), so any new one can repeat the problem. I read this in the code and **haven't run it in a browser** | For any HTMX change: curl the route with `HX-Request`, show the fragment, and check the fragment keeps the target's id |
| 07 | Decision memo (sql.js persistence) | Open. `run()` never calls `saveDb()`; the only calls are in `initDb` and `closeDb`, and nothing runs `closeDb` on shutdown. Any new architectural choice (another dependency, a new storage approach, an ADR) needs the same memo | The memo prompt: 3 options, a recommendation, what would make it wrong. Record the result in `docs/adr/` |
| 17 | Persistence request with no constraints | Same open problem as 07. `saveDb` writes the whole database (`db.export()` then `writeFileSync`), so saving on every write gets more expensive as data grows | Write the constraints in the prompt (cost, behavior on a hard kill). Batch writes, and check a write survives reopening the file |
| 19 | Error pages vs. the JSON API | Open. HTML routes render `error.ejs` for 404s, but `server.ts` has one global handler that answers every error with JSON, including 500s from HTML routes. Any error-handling change touches both surfaces | List both surfaces first (HTML under `/`, JSON under `/api`) and test one failing request on each |

## May return (2)

| # | Case | Depends on | If it does come back |
|---|---|---|---|
| 09 | Portable test paths | New platform reports or new test files. Today it is hardening, not a bug: all 14 tests pass on Windows (2026-11-25). Git shows a Windows pass in September (`7e5d869`, `c46cfd9`) that didn't touch the tests, and nothing since. The `/tmp` paths and `require('fs')` remain in `tests/db.test.ts`, `tests/models/book.test.ts`, `tests/routes/api.test.ts` and `tests/setup.ts` | Replace with `os.tmpdir()` + `path.join` and a top-level `import`. Run the suite before and after. Don't change assertions |
| 18 | Named-parameters prompt vs. the DB wrapper | Another library change, or a prompt that doesn't mention the wrapper. The migration to sql.js was `2cef3d5`, and the models already use `?` parameters through `all/get/run` | After any migration, grep for the old API and update the `CLAUDE.md` rule. The wrapper rule already exists under "Avoid" |

## Pending, one-time (1)

| # | Case | Why | What survives |
|---|---|---|---|
| 10 | Untrack `bookshelf.db-wal` / `-shm` | Still undone: `git ls-files` lists both, and `.gitignore` covers `*.db`, `*.sqlite` and `*.sqlite3` but not `-wal` or `-shm`. Once untracked and ignored it won't recur, and sql.js doesn't create WAL files | The "show the staged files, don't commit" habit lives in `CLAUDE.md` under "Verify before commit" |

---

## Where each lesson lives

| Lesson | Home |
|---|---|
| Check HTMX fragments keep their target id | This file (06) |
| Decision memo structure | This file (07), and the ADR folder for the results |
| Batch writes, state constraints | This file (17) |
| Two surfaces: HTML and JSON | `CLAUDE.md` under "Avoid", and this file (19) |
| Portable test paths | This file (09), plus Testing notes in `CLAUDE.md` |
| DB access through the wrapper | `CLAUDE.md` under "Avoid" (18) |
| Don't commit without checking | "Verify before commit" in `CLAUDE.md` (10) |

## Review triggers

Re-read this file when:
- I add or change any `hx-*` attribute or an HTMX partial (06)
- I plan a dependency swap or a storage change (07, 17, 18)
- I edit `src/server.ts` or any route's error behavior (19)
- A student reports an install problem on a different OS, or I add test files (09)
- I'm about to commit while `*.db-wal` / `*.db-shm` are still tracked (10)
