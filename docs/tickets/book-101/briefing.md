# Briefing: BOOK-101 Book search by title or author

Status: COMPLETE
Gaps: 12 decided by gap-resolver, 0 open
Blockers: 0
Source: C:/projects/agent_bookshelf/docs/tickets/book-101/source.md (ticket text pasted by the user). The ID BOOK-101 comes from the folder name `book-101`, not from the ticket text. Decided in GAP-01.

## 1. Goal

A reader can type part of a book's title or author into the search box on the home page and see only the matching books, ignoring case. When the box is empty they see the full list again. Bad input (too long) gets a clear validation message instead of results. (GAP-01, decided by gap-resolver, medium)

## 2. Acceptance criteria

| ID | Criterion (verbatim) | Source |
|---|---|---|
| AC-01 | A query matches title or author: partial, case-insensitive | bullet 1 |
| AC-02 | An empty query returns all books | bullet 2 |
| AC-03 | Input is trimmed | bullet 3, part a |
| AC-04 | over [100] characters returns a validation error | bullet 3, part b |
| AC-05 | SQL is parameterised: no string-built queries | bullet 4 |
| AC-06 | Vitest covers each criterion | bullet 5, part a |
| AC-07 | npm run test:run passes | bullet 5, part b |

## 3. How the criteria connect

Only relations the ticket's words support.

| From | Relation | To | Why (quote or point to the words) |
|---|---|---|---|
| AC-01 | overlaps | AC-02 | Both define what comes back for a query: "A query matches title or author" and "An empty query returns all books". |
| AC-01 | same-output | AC-02 | Both decide the list of books returned. |
| AC-03 | same-input | AC-04 | Both act on the input: "Input is trimmed; over [100] characters returns a validation error". |
| AC-03 | depends-on | AC-04 | Length is measured after trimming (GAP-05, decided). |
| AC-03 | depends-on | AC-02 | A query that is empty after trimming returns all books (GAP-06, decided). |
| AC-05 | constrains | AC-01 | The only SQL the ticket introduces is the title-and-author match (GAP-09, decided: yes). |
| AC-06 | constrains | AC-01 to AC-05 | "Vitest covers each criterion". |
| AC-07 | depends-on | AC-06 | "npm run test:run" passes is judged after the tests exist. |

Order between AC-03 and AC-04: length is measured after trimming (GAP-05). Order between AC-03 and AC-02: a query that is empty after trimming returns all books (GAP-06).

## 4. Interface

| Item | Value |
|---|---|
| Entry point (method and path, or other trigger) | `GET /books/search` (existing stub route, called by the home page search box with HTMX). Returns an HTML fragment that replaces the contents of `#search-results` on `GET /`. No JSON endpoint. (GAP-02, high) |
| Input (names, types, where they come from) | One query-string parameter `q`, text, e.g. `GET /books/search?q=dune`. Missing `q` is treated as empty. A non-single-text `q` (`?q=a&q=b`, `?q[x]=a`) is rejected with the validation error, message `Search query must be a single text value`. Other parameters are ignored and change nothing. (GAP-03 high for name/place/missing, low for repeated or nested `q`; GAP-12 high) |
| Success response (status, shape, fields) | 200, HTML fragment (not a full page, not JSON), same card layout as the home page: per book the title (linking to `/books/<id>`), "by <author>", and the published year when present. All title and author text HTML-escaped. If nothing matches: still 200, no book cards, text `No books found`. (GAP-04, medium) |
| Error response (status, shape, message) | 400 with an HTML fragment: `<p class="error">` containing the message. Length limit message exactly `Search query must be 100 characters or fewer`; non-text `q` message `Search query must be a single text value`. The message does not echo the user's input. On the home page the message must appear in the `#search-results` area, replacing previous results (HTMX 1.9 does not swap 4xx by default; non-binding hint: an `htmx:beforeSwap` listener allowing status 400). (GAP-07, medium) |
| Ordering and limits of results | By title ascending (same as home page list, `ORDER BY title`; "1984" first among seed books). No limit: empty query returns all books (50 with the seed data). Tests must not depend on the relative order of books with identical titles. (GAP-08, high) |

Matching rules:

- Contains-anywhere: a book matches when its title or its author contains the trimmed query as continuous text at any position. `ring` matches "The Lord of the Rings"; `tolk` matches "J.R.R. Tolkien". (GAP-10, high)
- Case-insensitive including accented letters: `MIÉVILLE` and `miéville` both match "China Miéville". Not accent-insensitive: `Mieville` does not match. (GAP-10, medium)
- Literal characters: `%` and `_` are not wildcards; a query of `%` returns no seed books. Spaces inside the query are kept as typed. (GAP-10, medium)
- Per-field OR: the whole query must be contained in the title or in the author. `Dune Herbert` returns no books; `Dune` and `Herbert` each return "Dune". A book matching in both fields appears once. (GAP-11, high)
- Trim and limit: the limit is 100 characters measured on the trimmed query, counted as Unicode characters; 0 to 100 accepted, 101 or more rejected; 100 letters with surrounding spaces accepted. (GAP-05, medium)
- Whitespace-only, empty and missing `q` all return all books with the same response and order. (GAP-06, high)
- Injection-style text (`'`, `' OR 1=1 --`, `"; DROP TABLE books; --`) is plain text: 200, only books whose title or author literally contain it (e.g. `'` returns "Ender's Game" and "The Hitchhiker's Guide to the Galaxy"), never an error, never a data change (all 50 books still present afterwards). (GAP-09, high)
- The query text, including any pattern built around it, reaches the database only as a bound value, never inside SQL text. (GAP-09)

Non-binding hints for the implementor (not requirements): one EJS partial for the book grid shared by `books/index` and the search response; the length check as a service throwing `ValidationError` (`src/services/errors.ts` may need creating) mapped to 400 by the controller; SQLite LIKE and `lower()` fold ASCII only and LIKE treats `%` and `_` as wildcards unless escaped (`ESCAPE`). No schema change or new dependency is needed.

## 5. Constraints (verbatim)

- SQL is parameterised: no string-built queries
- Vitest covers each criterion; npm run test:run passes

## 6. Out of scope

Not stated.

## 7. Gaps

| ID | What is missing | Blocks | Who or what could answer | Answer |
|---|---|---|---|---|
| GAP-01 | The ticket has no title, no ID and no goal sentence. | header, section 1 | Ticket author | ID BOOK-101, title "Book search by title or author", goal as in section 1. decided by gap-resolver (medium) |
| GAP-02 | Entry point that takes the query. | AC-01 to AC-04 | Ticket author | `GET /books/search`, HTML fragment into `#search-results`. decided by gap-resolver (high) |
| GAP-03 | Input name, type, source. | AC-01 to AC-04 | Ticket author | Query-string `q`, text; missing = empty; repeated/nested `q` rejected with 400. decided by gap-resolver (high; low for the repeated/nested rule) |
| GAP-04 | Success response. | AC-01, AC-02 | Ticket author | 200 HTML fragment, card layout, escaped, `No books found` when none. decided by gap-resolver (medium) |
| GAP-05 | Length limit and how measured. | AC-03, AC-04 | Ticket author | 100, on the trimmed input, exactly 100 allowed, Unicode characters. decided by gap-resolver (medium) |
| GAP-06 | Whitespace-only query. | AC-02, AC-03 | Ticket author | Treated as empty: returns all books. decided by gap-resolver (high) |
| GAP-07 | Validation error response. | AC-04 | Ticket author | 400, `<p class="error">` fragment, messages as in section 4, shown in `#search-results`. decided by gap-resolver (medium) |
| GAP-08 | Order and limit of results. | AC-01, AC-02 | Ticket author | Title ascending, no limit. decided by gap-resolver (high) |
| GAP-09 | Parameterised SQL applies to the match. | AC-05, AC-01 | Ticket author | Yes; injection-style text is plain text. decided by gap-resolver (high) |
| GAP-10 | Meaning of "partial". | AC-01 | Ticket author | Contains anywhere; case-insensitive incl. accented letters; literal `%` and `_`. decided by gap-resolver (high; medium for accents and literal `%` `_`) |
| GAP-11 | Title and author together or separately. | AC-01 | Ticket author | Either field on its own, whole query; appears once. decided by gap-resolver (high) |
| GAP-12 | Which "Input" the trim and limit apply to. | AC-03, AC-04 | Ticket author | `q` only; other parameters ignored. decided by gap-resolver (high) |

## 8. Blockers

none

## 9. Named in the ticket and found in the repository

| Name | Found at | Note |
|---|---|---|
| npm run test:run | C:/projects/agent_bookshelf/package.json line 26 | Script exists: `vitest run`. |
| Vitest | C:/projects/agent_bookshelf/package.json line 53 | Listed as a dependency: `^2.1.8`. |
| `GET /books/search` (named by decision GAP-02) | C:/projects/agent_bookshelf/src/routes/books.ts line 12 | Route exists as a stub that returns a "coming soon" message. |
| `#search-results` and the search box (named by decision GAP-02) | C:/projects/agent_bookshelf/src/views/books/index.ejs lines 5-19 | Input with `hx-get="/books/search"` and `hx-target="#search-results"` exists. |

STATUS: COMPLETE | gaps=0 | blockers=0
