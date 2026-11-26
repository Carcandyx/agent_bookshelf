---
name: review-empirically
description: Empirically review the local, uncommitted code changes (staged and unstaged) in Agent Bookshelf against its four known recurring problems - HTMX partials that lose their swap target id, sql.js writes that never reach disk, persistence changes with no constraints, and HTML error pages vs the JSON-only global error handler. Runs the app and probes it instead of just reading the diff. Use whenever the user says "review-empirically", "review my changes", "check my branch/diff before commit", "did I break HTMX / persistence / error handling", or touches hx-* attributes, partials in src/views, src/db/index.ts, src/models write paths, src/server.ts, or any route's error behavior, even if they don't name this skill.
---

# review-empirically

Review the working-tree changes of this repo by **running things**, against the four "Will return" cases in `personal_notes/special_cases_revisit.md` (06, 07/17, 19). Reading a diff is how these bugs got missed the first time: each one looks fine in the source and only shows up when a second request is made, the process is restarted, or an error is thrown from an HTML route.

This skill reports. It does not edit code, write tests or commit (CLAUDE.md: report first, then act; test gaps in user/review/shelf models are deliberate). Probe scripts go in the scratchpad or a temp dir, never in `tests/` or `src/`.

## 1. Scope the change

1. `git status --short` and `git diff HEAD --stat` (staged + unstaged together). Also list untracked files, since new partials/routes are untracked.
2. If the user named a branch that is not checked out, say so: staged/unstaged only exist on the checked-out branch. Review `git diff <base>...<branch>` for that branch's commits and tell the user the working-tree part was skipped.
3. Map each changed file to the checks below. Run **only** the checks whose trigger is hit, but always run `npm run test:run` and the "tracked db files" check. If nothing triggers, say that and stop; do not invent findings.

| Changed                                                                                        | Run check             |
| ---------------------------------------------------------------------------------------------- | --------------------- |
| `src/views/**`, any `hx-*` attribute, a route that returns a fragment                          | A. HTMX target        |
| `src/db/index.ts`, `src/models/*` write functions, new INSERT/UPDATE/DELETE, shutdown handling | B. Persistence        |
| `src/server.ts`, any `res.status(...)`, `error.ejs`, new route, `next(err)` / thrown errors    | C. Two error surfaces |
| anything                                                                                       | D. Baseline           |

## 2. Checks

Start the app on a throwaway DB and port so you never touch `bookshelf.db`:
`PORT=3999` with `startServer('<tempdir>/review.db')` via `npx tsx -e` (import from `src/server.ts`; imports of local files need `.js`). Stop it when done.

### A. HTMX swap target (case 06)

Why: forms use `hx-swap="outerHTML"`. outerHTML replaces the target element with the response, so the response must itself contain an element with the target's id, or the second interaction finds no target. Today `books/reviews-list.ejs` and `shelves/books-list.ejs` start with no `#reviews-list` / `#shelf-books-list` wrapper (the ids live only in `show.ejs`), which is the known open instance.

For every changed or new `hx-target`:

1. Find the target id and which template declares it (`grep -rn "<id>" src/views`).
2. Request the fragment route with the header HTMX sends: `curl -s -H "HX-Request: true" -X <method> ... http://localhost:3999/<route>` (use real routes from `src/routes/*`, real seed ids from `seed.sql`).
3. Check the returned HTML contains `id="<target>"` on its root element when `hx-swap` is `outerHTML`. With `innerHTML` the id must **not** be repeated (it would nest). Flag a mismatch between swap mode and fragment.
4. Check the non-happy paths too: empty list, validation error (400/409 fragments like `<p class="error">`). An error fragment swapped with outerHTML also destroys the target; report it, and note htmx does not swap 4xx/5xx by default, so say which behavior you observed or that you could not run a browser.
5. State plainly that curl proves the fragment, not the browser swap. If you did not run a browser, label the result "fragment verified, swap behavior inferred".

### B. Persistence (cases 07, 17)

Why: `run()` in `src/db/index.ts` never calls `saveDb()`; the file is written only in `initDb` and `closeDb`, so a hard kill loses writes. `saveDb()` exports the whole DB, so calling it per write gets costlier as data grows.

1. Read the diff of `src/db/index.ts` and the changed models: does any new write path call `saveDb()`, and where (per write, debounced, on shutdown)?
2. Run a restart test in a single script: `initDb(tmp)` -> perform the changed write through the model/route -> **do not** call `closeDb()` -> start a fresh `initDb(tmp)` (or a fresh process) -> read the row back. Report whether it survived. Then repeat with `closeDb()` first to show the contrast.
3. If the change adds a `saveDb()` per write, time N inserts (e.g. 200) before/after and report the numbers; flag a per-write full export if it is in a loop or batch.
4. If shutdown handling was added (SIGINT/SIGTERM), check it saves once and does not break `startServer`/supertest usage (the `app` export must still import without side effects).
5. Schema change: schema uses `CREATE TABLE IF NOT EXISTS`, so a new column will not appear in an existing `bookshelf.db`. Run `initDb` against a copy of the current `bookshelf.db` and query the new column; report if it fails.
6. A new storage approach, dependency swap or ADR-worthy decision without a memo in `docs/adr/` is a finding (3 options, a recommendation, what would make it wrong).
7. DB access must go through `all/get/run`; grep the diff for direct sql.js use or the old better-sqlite3 API and for named parameters (case 18).

### C. HTML vs JSON error surfaces (case 19)

Why: HTML routes render `error.ejs` for 404s, but `server.ts` has a single global handler that answers **every** uncaught error with JSON `{ error: 'Something went wrong!' }`, including 500s from HTML routes, and `/api` clients depend on JSON.

1. List both surfaces touched: HTML under `/`, `/shelves`, `/reviews`; JSON under `/api`.
2. Drive one failing request per surface with curl, showing status, `Content-Type` and body:
   - HTML 404: `/books/999999`, `/shelves/...`, `/reviews/999999` (existing behavior: `error.ejs`, 404).
   - API 404/400/409: e.g. `GET /api/books/999999`, `POST /api/reviews` with a rating outside 1-5 (existing messages in `src/routes/api.ts`).
   - A forced 500 on each surface if the diff changed the handler (temporarily throw in a scratch copy of the route, never in the working tree).
3. Compare to baseline: run the same requests on `git stash`-free baseline by using `git worktree add <tmp> HEAD` and running there. Any change in status, content type or message on `/api` is a break; a changed HTML error page is a break unless the user asked for it.
4. If the diff changes `server.ts`'s handler, confirm `/api` still gets JSON and say what HTML routes get now.

### D. Baseline (always)

- `npm run test:run`; report pass/fail counts (14 pass at 2026-11-25). Do not edit or weaken a failing test; report the failure with output.
- `git ls-files | grep -E "\.db(-wal|-shm)?$"` and `git diff --cached --name-only`: flag any `*.db*` file staged. `bookshelf.db-wal` and `-shm` are tracked and not in `.gitignore`; do not stage or "fix" them unless asked.
- New tests that use hard-coded `/tmp/...` or `require('fs')` repeat case 09 (portability debt); mention as low severity.

## 3. Report

Findings first, ordered by severity, each tied to evidence you produced. Use this shape:

```
## Scope
<files reviewed, staged/unstaged/untracked, checks run and why>

## Findings
1. [BREAK | REPEATS KNOWN PATTERN | RISK | OK] <case id + title>
   Evidence: <command run and the relevant output, or file:line>
   Why it matters: <one sentence>
   Suggested fix (not applied): <one sentence>

## Not verified
<what you could not run (e.g. no browser for the htmx swap) and what that leaves open>

## Pre-commit
Tests: <n passed/failed>. Staged *.db* files: <none|list>. Commit decision is yours.
```

Labels: **BREAK** = a behavior that worked at baseline now fails. **REPEATS KNOWN PATTERN** = introduces a new instance of 06/07/17/19. **RISK** = plausible but not reproduced. Never report something you did not observe as a BREAK, and say "no issues found in the checks run" when that is the case rather than padding the list. Keep one concern per finding.

Clean up: kill the server, remove temp DBs and any worktree you created (`git worktree remove`), and confirm `git status` is unchanged from step 1.
