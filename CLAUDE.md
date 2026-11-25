# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Agent Bookshelf: a Goodreads-lite teaching playground for AI-agents courses (TypeScript, Express, EJS + HTMX, SQLite via sql.js). Students run it locally and use agents to do homework. **Gaps are deliberate** — the README says contributions should preserve them (e.g. no tests for the user/review/shelf models, incomplete book/API tests). Don't "helpfully" fill them in unless asked.

## Commands

- `npm run dev` — run `src/server.ts` with tsx watch (port 3000, override with `PORT`)
- `npm run build` — `tsc` to `dist/`, then `copy-assets` (copies `schema.sql`, `seed.sql`, `views/`, `public/` into `dist/`). `postinstall` runs the build too.
- `npm start` / `npx agent-bookshelf` — run the built `dist/server.js` (`bin/agent-bookshelf.js` imports `dist/server.js`)
- `npm test` (watch) / `npm run test:run` (once)
- Single test: `npx vitest run tests/models/book.test.ts` or `npx vitest run -t "test name"`

## Architecture

- `src/server.ts` wires Express: EJS views, JSON/urlencoded body parsing, static `src/public`, and four routers: `books` (`/`, HTML), `shelves` (`/shelves`), `reviews` (`/reviews`), `api` (`/api`, JSON). It exports `app` (used by supertest) and `startServer(dbPath?)`, which awaits `initDb` before listening. The server auto-starts only when run as the main module.
- `src/db/index.ts` is a thin wrapper over **sql.js** (SQLite compiled to WASM, in-memory), not better-sqlite3. Key consequences:
  - `initDb(path?)` is **async** and must be awaited. It loads the file at `path` (default `./bookshelf.db`) if it exists, applies `schema.sql`, seeds from `seed.sql` if `users` is empty, and writes the DB back to disk.
  - Persistence is manual: `saveDb()` exports the whole in-memory DB to the file. Check that mutations persist (`closeDb()` saves) when changing write paths.
  - Helpers `get` / `all` / `run` / `query` operate on the module-level singleton DB; `run` returns `{changes, lastInsertRowid}`. Models call these directly, so `initDb` must have run first.
  - The WASM file is located at `node_modules/sql.js/dist` relative to `src/db` or `dist/db`.
- `src/models/*` (book, user, review, shelf) hold the SQL and TypeScript row interfaces; routes call models, never SQL directly. Code uses ESM, so imports of local files need the `.js` extension.
- Views in `src/views` (`layout.ejs`, `partials/`, per-feature folders). HTMX fragments are separate partial templates such as `books/reviews-list.ejs` and `shelves/books-list.ejs`. HTMX is vendored at `src/public/htmx.min.js`.
- `dist/` is gitignored in `.gitignore` but a comment there says it's meant to be committed so `npx` works without a build. Check this before assuming either way. `src/db/schema.sql`, `seed.sql`, `src/views` and `src/public` must stay listed in `package.json` `files` and in `copy-assets`.

## Testing notes

- Tests live in `tests/` (Vitest, globals on, `tests/**/*.test.ts`). Each test file calls `await initDb('/tmp/<name>.db')` in `beforeEach` and `closeDb()` plus unlink in `afterEach`.
- `tests/setup.ts` is **not** registered in `vitest.config.ts` (no `setupFiles`) and calls `initDb` without `await`. Don't rely on it.
- Test DB paths are hard-coded `/tmp/...` and the tests call `require('fs')` inside ESM files. All 14 tests currently pass on Windows (checked 2026-11-25), so treat both as portability debt, not as bugs.

## Docs

`docs/adr/001-architecture.md` records the stack decision. `personal_notes/` holds the user's own prompt journal and notes, not project docs, except that its recurrent patterns are summarized below.

## Working patterns (MUST follow / MUST avoid)

Derived from the recurrent patterns in `personal_notes/prompt_categorization.md`. The journal behind it is mocked, with every entry tied to a verifiable repo fact, so refine these once real sessions exist. They cover the daily loop of plan, build, test and ship.

### Follow

- **Report first, then act.** For analysis, audits and decisions, report findings (or options with a recommendation and what would make it wrong) and wait before editing.
- **Analyze test gaps before writing tests.** Compare code to existing tests and report the gaps. Don't write anything until asked.
- **Write tests like an existing file.** Use a reference test file as the pattern, cover the edge cases the user lists, and run the tests.
- **Fix bugs narrowly.** Work from symptom, expected behavior, file and repro. Write a failing repro test first, keep the diff small, and use the working sibling code (for example `POST /api/reviews` validation) as the pattern.
- **Plan before building.** For any feature or schema change, list every file that must change, including risks to an existing `bookshelf.db` (schema uses `CREATE TABLE IF NOT EXISTS`, so new columns won't appear in an existing file), and wait for approval before editing.
- **Cover the non-happy paths.** Every feature and its tests need explicit empty, error and boundary states, plus acceptance criteria. "It works on the happy path" is not done.
- **Keep one concern per prompt and per commit.**
- **Verify before commit.** Tests green, no `*.db*` files staged (`bookshelf.db-wal` and `-shm` are tracked in git and not covered by `.gitignore`), and a diff summary shown. The user makes the commit decision.

### Avoid

- **Guessing at vague requests.** If where to put it, what to reuse, or what "done" means is unclear, ask first.
- **Unbounded diffs.** Don't treat words like "improve" or "across the app" as license to touch many files without an approved plan.
- **Weak tests.** No trivial assertions, and no passing tests that don't exercise edge cases.
- **Weakening or mocking a test to make it pass.** If a test fails, fix the cause, or ask before changing the test. "Fix whatever fails" does not grant permission to alter tests.
- **Hallucinated mock data.** Mock data in tests, seeds and `.md` files must be backed by implemented code. See `.claude/rules/mock-data-grounding.md`.
- **Bypassing the DB wrapper.** Database access goes through `all/get/run` in `src/db/index.ts`, never sql.js directly.
- **Breaking one of the two response surfaces.** HTML lives under `/`, JSON under `/api`. The global error handler in `server.ts` answers JSON for everything, and `/api` clients depend on it, so error-handling changes must preserve both.
- **Bundling two tasks into one change.** Split them and raise it if a request mixes concerns.
