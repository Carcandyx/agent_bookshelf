# Decisions made by agents: book-101 Book search

No person answered these. Agents decided them so the flow could run without a human, and each decision is listed with its reasoning so it can be checked. Look first at the rows marked `low`.

Updated by the orchestrator after each stage.

## Summary

| Stage | Decisions | Low confidence |
|---|---|---|
| Briefing gaps | | |
| Test design | | |
| Implementation | | |
| Review and fixes | | |

## 1. Briefing gaps (gap-resolver)

| ID | Decision | Reasoning | Evidence | Confidence | If wrong |
|---|---|---|---|---|---|
| GAP-01 | ID BOOK-101, title "Book search by title or author". Goal: a reader types part of a title or author into the home page search box and sees only matching books, ignoring case; empty box shows the full list; too-long input gets a validation message. | Folder name and log call it "Book search". Every criterion is about searching by title or author. The repo has one unfinished matching feature: the home page search box with a stub backend. | decisions.md:1; src/routes/books.ts:15-16 (TODO); src/views/books/index.ejs:10; README.md:131; source.md bullet 1 | medium | Only the header and goal text change, unless the real goal names a different entry point (GAP-02). |
| GAP-02 | `GET /books/search`, the existing stub route called by the search box with HTMX. Returns an HTML fragment replacing `#search-results` on `GET /`. No JSON endpoint. | The ticket's interface is a placeholder, so the repo decides: method, path and caller are already wired. A new `/api` endpoint would be surface no criterion asks for. Alternatives: `GET /api/books/search` JSON (no caller; currently caught by `/api/books/:id`, returns 404); both endpoints (doubles surface). | src/routes/books.ts:12; src/views/books/index.ejs:11-13; src/server.ts:28; capstone-plan.csv:9; src/routes/api.ts:15 | high | If JSON was intended, tests check `res.body` and a route is added in src/routes/api.ts. Validation and matching rules stay. |
| GAP-03 | One input, query-string `q`, text. Missing `q` = empty query. A non-single-text `q` (`?q=a&q=b`, `?q[x]=a`) is rejected with the GAP-07 validation error, message `Search query must be a single text value`. | Existing input is `name="q"`, stub reads `req.query.q`. A repeated or nested `q` cannot be trimmed or matched as one text; rejecting is stricter and safer. Alternatives: first value of repeated `q` (silent guess); treat as empty (silent success on malformed input); 500 (undefined). | src/views/books/index.ejs:8; src/routes/books.ts:13; decision-rules.md "Choosing between readings" | high for name, place and missing case; low for the repeated/nested `q` rule | For the repeated/nested rule, one or two tests expect 200 with results for the first value instead of 400. |
| GAP-04 | 200, HTML fragment (not full page, not JSON) in the home page card layout: title linking to `/books/<id>`, "by <author>", year when present. All text escaped. No match: still 200, no cards, text `No books found`. | The swap target already holds a grid of cards; same markup means an empty query restores the page as first rendered. Fields are those the home page shows. Escaping is a CLAUDE.md rule. Alternatives: JSON array (lost with GAP-02); empty fragment on no match (shows nothing); extra fields (not shown on the page). | src/views/books/index.ejs:19-30; src/views/shelves/books-list.ejs:3; CLAUDE.md | medium | Tests that look for card text or `No books found` change expected strings. Matching and status codes unaffected. |
| GAP-05 | Limit 100 characters, measured after trimming, counted as Unicode characters. 0 to 100 accepted (100 allowed), 101+ rejected with the GAP-07 error. 100 letters with surrounding spaces accepted. | 100 is the only number given (brackets mark a placeholder but nothing else is offered). "over" excludes 100. The bullet states trimming first. Alternatives: raw length (rejects inputs valid once trimmed); reject at exactly 100; another value (no source). | source.md bullet 3; decision-rules.md "Inputs, limits and boundaries"; no limit anywhere in the repo | medium | Boundary tests (100 ok, 101 rejected, 100 + spaces ok) change to the new number or to raw length. |
| GAP-06 | Whitespace-only `q`, empty `q` and missing `q` all return all books, same response as GAP-04, order from GAP-08. | AC-03 trims first; an all-whitespace query becomes empty and AC-02 applies. Searching literal spaces would contradict trimming. Alternatives: literal-space query; validation error (no criterion supports it). | source.md bullets 2 and 3; capstone-plan.csv:2 | high | One test (whitespace-only returns all 50 seed books) flips. |
| GAP-07 | 400 with `<p class="error">` fragment. Length message exactly `Search query must be 100 characters or fewer`; non-text `q` message `Search query must be a single text value`. Does not echo user input. On the home page the message must appear in `#search-results`, replacing previous results. | Every existing validation failure answers 400 with that HTML shape (error styling exists). HTMX 1.9 does not swap 4xx by default, so the page must be made to show the 400 message, rather than switch to a 200 that hides the error. Alternatives: 200 error fragment (looks like success); 422 (unused here); JSON `{ error }` (JSON API style). Non-binding hint: an `htmx:beforeSwap` listener allowing 400; the length check as a service throwing `ValidationError`. | src/routes/books.ts:44; src/routes/shelves.ts:44; src/routes/api.ts:30,137,141; src/public/css/style.css:295; package.json:43 | medium | Status code or message string in the error tests changes. The page-display part might be dropped. Matching unaffected. |
| GAP-08 | Title ascending (as the home page list; "1984" first among seed books). No limit: empty query returns every book (50 with seed data), a matching query returns every match. Tests must not depend on order of identical titles. | Both existing book-list queries order by title; the result replaces that list. "all books" rules out a cap. Alternatives: relevance order; id order; page size. | src/models/book.ts:15,25; tests/models/book.test.ts:23-24; source.md bullet 2 | high | Order assertions and the query ordering change; if a limit was intended, a pagination parameter is added and the "all 50" test changes. |
| GAP-09 | Yes. The query text, including any pattern built around it, reaches the database only as a bound value. Injection-style text (`'`, `' OR 1=1 --`, `"; DROP TABLE books; --`) is plain text: 200, only books whose title or author literally contain it (`'` returns "Ender's Game", "The Hitchhiker's Guide to the Galaxy"), never an error, never a data change (50 books remain). | The title-and-author match is the only new SQL; CLAUDE.md states the rule including LIKE patterns. The observable checks make AC-05 testable from the entry point. Alternative: a general code-quality reading (lost). | source.md bullet 4; CLAUDE.md Conventions; src/models/book.ts:23-27; src/db/seed.sql:31-32 | high | Nothing breaks; the rule is required anyway, at most the injection tests are extra. |
| GAP-10 | Contains-anywhere. Case-insensitive including accented letters (`MIÉVILLE` and `miéville` match "China Miéville"), not accent-insensitive (`Mieville` does not match). Literal characters: `%` and `_` are not wildcards (`%` returns no seed books). Inner spaces kept. | "partial" plus the existing `%query%` helper means contains. "case-insensitive" is unqualified. Literal matching follows from "a query matches". Alternatives: prefix-only; ASCII-only case folding (as the existing LIKE helper); accent-insensitive; `%`/`_` as wildcards. Non-binding hint: SQLite LIKE and `lower()` fold ASCII only and LIKE treats `%`/`_` as wildcards unless escaped (`ESCAPE`); the query stays a bound value. | source.md bullet 1; src/models/book.ts:23; src/db/seed.sql:50; capstone-plan.csv:2 | high for contains-anywhere; medium for accent case folding and literal `%`/`_` | Prefix meant: middle-of-text tests flip. ASCII-only: the `MIÉVILLE` test is dropped. Wildcards meant: the `%`/`_` tests flip. |
| GAP-11 | Either field on its own, whole query. `Dune Herbert` returns no books; `Dune` and `Herbert` each return "Dune". A book matching both fields appears once. | The ticket says "title or author": a per-field OR; the existing helper does this. Alternatives: joined text; per-word matching. | source.md bullet 1; src/models/book.ts:25 | high | The `Dune Herbert` test flips; the rule gains word splitting or concatenation. |
| GAP-12 | The query `q` only. "Input" in AC-03 and AC-04 means `q`. Other query-string parameters are ignored and change neither results nor validation. | The search box sends one field; every criterion speaks of "a query". Existing GET handlers ignore unexpected parameters. Alternatives: trim/limit on other inputs; reject unknown parameters (no basis). | src/views/books/index.ejs:6-15; source.md bullets 1-3; src/routes/api.ts:10-13; src/routes/books.ts:7-10 | high | If another input was intended, new inputs, validation and tests are added; `q` decisions stay. |

Consistency check (gap-resolver): trimming first drives both whitespace-only (GAP-06) and the length check (GAP-05); the match rules (GAP-09, 10, 11) satisfy AC-01 and AC-05; every answer is observable at `GET /books/search?q=` so AC-06 is coverable by supertest. No answer needs a schema change, migration, new dependency or protected file; no criterion changed.

## 2. Test design (criteria-tester)

| What was decided | Why | Confidence |
|---|---|---|
| TC-04 assumes accented letters fold case and are not accent-insensitive; seed has 'China Miéville' (GAP-10) | Follows the briefing decision | medium |
| TC-08 assumes `%` and `_` are literal; no seed text contains `_` (GAP-10) | Follows the briefing decision | medium |
| TC-05 assumes per-field matching (GAP-11) | Follows the briefing decision | high |
| TC-06 assumes no match = 200 with `No books found` (GAP-04) | Follows the briefing decision | medium |
| TC-07 assumes card layout and title-ascending order (GAP-04, GAP-08) | Follows the briefing decision | medium |
| TC-09 assumes 50 seed books, '1984' first (GAP-08) | Follows the briefing decision | high |
| TC-10 assumes whitespace-only and missing `q` behave like empty (GAP-06, GAP-03) | Follows the briefing decision | high |
| TC-12 assumes limit 100, exactly 100 accepted (GAP-05) | Follows the briefing decision | medium |
| TC-13 assumes 400, `<p class="error">`, exact message, no echo (GAP-07) | Follows the briefing decision | medium |
| TC-14 assumes length measured after trimming (GAP-05) | Follows the briefing decision | medium |
| TC-15 assumes the limit counts Unicode characters, not bytes (GAP-05) | Follows the briefing decision | medium |
| TC-16 assumes repeated or nested `q` is rejected with 400 and the single-text message (GAP-03) | Follows the briefing decision, which marks this low confidence | low |
| TC-17 assumes injection-style text is plain text; seed has the two apostrophe titles (GAP-09) | Follows the briefing decision | high |
| TC-18 assumes injection-style text is plain text and never changes data (GAP-09) | Follows the briefing decision | high |
| Left out: other query parameters ignored (GAP-12) | Rare; not an acceptance criterion; small check on top of TC-11 | medium |
| Left out: code-level check that SQL is not string-built | Internal structure; TC-17 and TC-18 show its effect | high |
| Left out: browser behaviour (`htmx:beforeSwap`, error replacing earlier results) | Non-binding hint in the briefing; tests are supertest only | medium |
| Left out: HTML escaping of hostile title/author text | Needs data the seed lacks; TC-17 covers escaping with apostrophe titles | medium |
| Left out: separate "match in both fields appears once" test | Folded into TC-05 | high |
| Left out: very long input (10,000 chars) or timing | Rare; TC-13 shows the over-limit rule | high |
| Left out: regression of existing home page list | Briefing states no such relation | medium |
| Left out: JSON endpoint or other HTTP methods | Briefing says no JSON endpoint | high |
| AC-05 can only be shown by behaviour: no black-box test proves the query text never appears in the SQL text | Limit of entry-point testing; the review step checks the code | high |

## 3. Implementation (implementor)

Copied from the "Decisions made without the user" section of `implementation.md`. The plan itself was reviewed by the user on the plan page.

| What was decided | Why | Confidence |
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

## 4. Review and fixes (orchestrator)

| Finding | Severity | What was done | Why |
|---|---|---|---|

## 5. Test disputes and other calls

| What | Ruling | Why |
|---|---|---|
| Plan review: the user replied "All good, continue" with no plan changes. | approved as published | No decision above was changed at the plan review. |
| The guardrail blocked one implementor debugging command (it named a throwaway `.db` probe file in the scratchpad). | not retried; cause found by reading sql.js source | No protected file was touched. |
| Pre-existing bug noticed by the implementor: sql.js `export()` resets `PRAGMA foreign_keys`, so foreign keys are not enforced after `initDb`. | left as is | Outside this ticket (see implementation.md Notes). |
| Run started with a dirty tree: `.gitignore`, `README.md` modified; untracked `.claude/`, `CLAUDE.md`, `Capstone Brief · Ticket to Merge.pdf`, `capstone-plan.csv`, `ticket-to-merge/`. The git-bot stages named files only. | continue | Per ship-ticket step 1.4. |
