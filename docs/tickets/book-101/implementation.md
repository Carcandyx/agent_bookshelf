# Implementation: BOOK-101 Book search by title or author

Status: implemented
Briefing: docs/tickets/book-101/briefing.md
Tests: docs/tickets/book-101/tests.md

## Summary

The home page search box now works. `GET /books/search?q=` returns the matching books as the same card grid the home page shows. A book matches when its title or author contains the trimmed query anywhere, ignoring case (accented letters included), and results are sorted by title. An empty, missing or whitespace-only query returns every book. A query over 100 characters after trimming, or a `q` sent twice or as an object, returns a 400 fragment `<p class="error">` with a fixed message. The match is done in SQL with a bound value and `instr()`, so `%`, `_` and quotes are plain text. A `unicode_lower` SQL function, registered on the sql.js connection, gives case folding beyond ASCII.

## Entry point

| Item | Value |
|---|---|
| HTTP | GET /books/search?q=<text> |
| Controller function | src/routes/books.ts: `searchBooksHandler` (the `GET /books/search` handler) |
| Service function | src/services/bookService.ts: `searchBooks(query: unknown): Book[]` |
| Repository function | src/models/book.ts: `searchBooks(text: string): Book[]` (and the existing `getAllBooks()` for the empty query) |

## Files

| Path | U/M | Layer | What changed |
|---|---|---|---|
| src/routes/books.ts | M | Controller | Stub replaced: passes `req.query.q` to the service, renders `books/book-grid` (200) or maps `ValidationError` to `books/search-error` (400). |
| src/services/errors.ts | U | Service | `ValidationError` class. |
| src/services/bookService.ts | U | Service | `searchBooks`: type check, trim, 100-character limit (code points), empty means all books, otherwise repository search. `SEARCH_QUERY_MAX_LENGTH = 100`. |
| src/models/book.ts | M | Repository | Unused LIKE helper `searchBooks` rewritten as one constant SQL string using `instr(unicode_lower(...), unicode_lower(?))` on title or author, `ORDER BY title`, values `[text, text]`. |
| src/db/index.ts | M | Database | Private `registerSqlFunctions()` registers `unicode_lower` in `initDb` and again after every `export()` in `saveDb()`. |
| src/types/sql.js.d.ts | M | Database (types) | Declares `Database.create_function`, which the local sql.js typings lacked. |
| src/views/books/book-grid.ejs | U | View | Shared card grid; `No books found` when the list is empty. |
| src/views/books/search-error.ejs | U | View | `<p class="error"><%= message %></p>`. |
| src/views/books/index.ejs | M | View | Includes `book-grid`; inline `htmx:beforeSwap` listener swaps a 400 into `#search-results`. |

## Interface check

| Briefing item | Implemented as |
|---|---|
| Entry point | `GET /books/search` in `src/routes/books.ts`, HTML fragment into `#search-results`. No JSON endpoint added. |
| Input | `req.query.q` only. Missing = empty. Array or object `q` gives 400 "Search query must be a single text value". Other parameters ignored. |
| Success response | 200 HTML fragment (no layout or header): per book a title linking to `/books/<id>`, "by <author>", year when present, all escaped with `<%= %>`. No match: 200, no cards, `No books found`. |
| Error response | 400, `<p class="error">Search query must be 100 characters or fewer</p>` or the single-text message. User input is never echoed. On the page the fragment replaces `#search-results` through the `htmx:beforeSwap` listener. |
| Ordering and limits | `ORDER BY title`, no limit. Empty query uses the existing `getAllBooks()` (also `ORDER BY title`). |
| Matching rules | Contains anywhere in title or in author (whole query per field, one row per book). Case folding by JS `toLowerCase` on both sides, so `MIÉVILLE` matches and `Mieville` does not. `instr` has no wildcards, so `%` and `_` are literal. The query is only ever a bound value. |

## Tests

Command: `npm run test:run`
Result: 32 passed, 0 failed (4 files: db, models/book, routes/api, routes/book-search with 18 of 18). `tsc --noEmit` also passes.
Failing tests, if any: none

## Notes

- One change beyond the plan: `src/types/sql.js.d.ts` gained a `create_function` declaration. The project's hand-written sql.js typings did not list it, and `npm run build` (tsc) would otherwise fail. Type-only; no dependency change.
- The first test run returned 500 with `no such function: unicode_lower`. Cause: sql.js `Database.export()` closes and reopens the connection and drops registered functions (`node_modules/sql.js/dist/sql-wasm-debug.js` lines 1238-1250), and `saveDb()` calls it at the end of `initDb`. Fix, inside the planned file: register the function again right after `export()` in `saveDb()`.
- Pre-existing, left as is: the same reopen in `export()` also resets `PRAGMA foreign_keys = ON`, so foreign keys are not enforced after `initDb` returns. It is outside this ticket, but someone should look at it.
- `src/routes/books.ts` still has its other handlers (`/`, `/books/:id`, `POST /books/:id/reviews`) calling models directly with validation in the route. That is the old shape, left as is. Only the search handler goes through the service.
- No automated test runs the `htmx:beforeSwap` listener, because the tests have no browser. I checked the home page template by rendering it with EJS and sample data: grid included, text escaped, script present, `No books found` for an empty list.
- During debugging the guardrail blocked one of my commands (DATABASE) because it named a throwaway probe file ending in `.db` in my scratchpad, outside the repo. I did not retry it or a variant. I found the cause by reading the sql.js source instead, and no protected file was touched.

## Decisions made without the user

| What was decided | Why | Confidence (high/medium/low) |
|---|---|---|
| Register `unicode_lower` again after every `export()` in `saveDb()`, through one private `registerSqlFunctions()` that is also called in `initDb` | sql.js drops custom functions on `export()`, and `saveDb()` runs at the end of `initDb` and on close. Registering in one helper after each reopen keeps the function always available. | high |
| Add `create_function` to `src/types/sql.js.d.ts` instead of casting to `any` | The local declaration file is the project's own sql.js typing. A one-line declaration keeps `tsc` strict and readable. | high |
| No-match markup is `<p class="search-message">No books found</p>` instead of an empty grid | Reuses the existing `.search-message` style (style.css line 251), which the old stub used. The briefing requires only the text and no cards. | medium |
| Use the shared grid partial on the home page too, so an empty library shows "No books found" there | Same markup for first render and search, as planned. An empty list on the home page used to show an empty grid; the message is clearer. | medium |
| The controller handler is a named function `searchBooksHandler` | Gives the entry point a name for the record and stack traces, while keeping the repository's `router.get(path, handler)` shape. | high |
| Errors other than `ValidationError` are rethrown from the handler | Express 4 catches synchronous throws and sends them to the existing error handler (500 JSON). The controller holds no other mapping. | high |
| `unicode_lower` uses `String.prototype.toLowerCase()` (not locale-specific), and NULL stays NULL | Locale-independent folding gives the same result on every machine. It covers accented Latin letters as GAP-10 asks. Special cases such as Turkish dotted I fold the default Unicode way. | medium |
| Trimming uses JS `String.prototype.trim()` | Removes all Unicode whitespace at both ends, which fits "Input is trimmed". Inner spaces are kept as GAP-10 asks. | high |
| The length message is built from `SEARCH_QUERY_MAX_LENGTH` and gives exactly "Search query must be 100 characters or fewer" | One source for the number. The text matches the briefing exactly. | high |
| The `htmx:beforeSwap` listener sets `shouldSwap = true` and `isError = false`, and only for target `#search-results` with status 400 | HTMX 1.9 skips 4xx swaps and logs them as errors. Limiting the listener to that target and status leaves other HTMX requests (such as review posting) unchanged. | medium |
| The repository SQL is a module constant `SEARCH_BY_TITLE_OR_AUTHOR_SQL` | Follows the convention "SQL is a constant string with `?` placeholders" and makes it obvious that no input is in the text. | high |
| The service imports the model as the namespace `BookRepository` | Avoids confusion between the service's `searchBooks` and the repository's `searchBooks`. | high |

## For the git-bot

Commit message: BOOK-101: search books by title or author on GET /books/search
Files to stage: src/routes/books.ts, src/services/errors.ts, src/services/bookService.ts, src/models/book.ts, src/db/index.ts, src/types/sql.js.d.ts, src/views/books/book-grid.ejs, src/views/books/search-error.ejs, src/views/books/index.ejs, tests/routes/book-search.test.ts, docs/tickets/book-101/briefing.md, docs/tickets/book-101/tests.md, docs/tickets/book-101/decisions.md, docs/tickets/book-101/source.md, docs/tickets/book-101/cost.md, docs/tickets/book-101/implementation.md, docs/tickets/book-101/plan.json, docs/tickets/book-101/tests.json
