# Test set: BOOK-101 Book search by title or author

Status: FINAL (designed by the criteria-tester, not reviewed by a person)
Revision: 1
Briefing: docs/tickets/book-101/briefing.md

This file is the contract for the test-writer. Each row is one test to write. The tests are written from this file and the briefing's interface, never from the implementation.

## Tests

| Test | What the test is about | Criteria | Type | Expected result |
|---|---|---|---|---|
| TC-01 | A reader types part of a title, such as 'ring', and gets the book whose title contains it. | AC-01 | happy | GET /books/search?q=ring returns 200 and an HTML fragment with a card for 'The Lord of the Rings'. Books whose title and author do not contain 'ring' are absent. |
| TC-02 | A reader types part of an author name, such as 'tolk', and gets that author's books. | AC-01 | happy | GET /books/search?q=tolk returns 200 with cards for books by J.R.R. Tolkien. Books by other authors are absent. |
| TC-03 | The same word typed in upper, lower and mixed case finds the same book. | AC-01 | happy | q=DUNE, q=dune and q=DuNe all return 200 with the same set of cards, including 'Dune'. |
| TC-04 | A reader searches for an author with an accented capital letter. | AC-01 | boundary | q=MIÉVILLE and q=miéville (URL-encoded) both return a card for a book by China Miéville. q=Mieville (no accent) returns no card for that author. |
| TC-05 | The whole query must be inside the title or inside the author. Two words split across both fields do not match. | AC-01 | happy | q=Dune%20Herbert returns 200 and no book cards. q=Dune and q=Herbert each return 'Dune'. A book that matches in both fields appears exactly once. |
| TC-06 | A reader searches for text that is in no title or author. | AC-01 | happy | Returns 200 (not an error), an HTML fragment with no book cards, and the text 'No books found'. |
| TC-07 | Matching books are shown as on the home page and sorted by title. | AC-01 | happy | A query matching several books returns an HTML fragment (not a full page, not JSON). Each card has the title linking to /books/<id>, 'by <author>', and the published year when present. Cards are in ascending title order. The test does not rely on the order of identical titles. |
| TC-08 | A reader types '%' or '_', which must be treated as plain characters and not as wildcards. | AC-01 | boundary | q=%25 returns 200 and no seed books ('No books found'). q=_ returns only books whose title or author literally contains an underscore (none in the seed data), not every book. |
| TC-09 | The reader clears the search box and sees the full list again. | AC-02, AC-01 | happy | q= (empty) returns 200 with all 50 seed books in title order ('1984' first). A non-empty query such as q=dune returns fewer cards than this full list. |
| TC-10 | A request with no q, or with only spaces, is treated as an empty query. | AC-02, AC-03 | validation | GET /books/search with no q, and q=%20%20%20, both return 200 with the same 50 books in the same order as q=. |
| TC-11 | A reader types a word with leading and trailing spaces. | AC-03 | validation | q=%20%20dune%20%20 returns 200 and the same cards as q=dune. Spaces inside a query are kept: q=lord%20of matches 'The Lord of the Rings'. |
| TC-12 | A query of exactly 100 characters is at the limit and is allowed. | AC-04 | boundary | A 100-letter q returns 200 (an HTML fragment, 'No books found'), not 400. |
| TC-13 | A reader pastes a query that is one character over the limit. | AC-04 | boundary | A 101-letter q returns 400 with an HTML fragment containing `<p class="error">` with exactly 'Search query must be 100 characters or fewer'. The body has no book cards and does not repeat the submitted text. |
| TC-14 | Surrounding spaces do not count toward the 100-character limit, and spaces do not hide an over-long query. | AC-03, AC-04 | boundary | 100 letters wrapped in spaces (for example 5 on each side) return 200. 101 letters wrapped in spaces return 400 with the length message. |
| TC-15 | A query of 100 accented or non-ASCII characters is within the limit, and 101 is over. | AC-04 | boundary | 100 characters such as 'é' (200 bytes) return 200. 101 such characters return 400 with the length message. |
| TC-16 | A request that supplies q more than once, or as an object, is refused. | AC-04 | validation | ?q=a&q=b and ?q[x]=a each return 400 with `<p class="error">` containing exactly 'Search query must be a single text value'. |
| TC-17 | A reader searches for an apostrophe, and a hostile user sends SQL fragments. | AC-05, AC-01 | security | q=' returns 200 with 'Ender's Game' and 'The Hitchhiker's Guide to the Galaxy' (titles HTML-escaped). q=' OR 1=1 -- returns 200 with no cards, not the full list. Neither request returns an error. |
| TC-18 | A query that tries to drop a table is treated as text and the data stays intact. | AC-05 | security | q="; DROP TABLE books; -- returns 200 with 'No books found'. A following q= returns all 50 books. |

## Criteria coverage

| Criterion | Tests |
|---|---|
| AC-01 | TC-01, TC-02, TC-03, TC-04, TC-05, TC-06, TC-07, TC-08, TC-09, TC-17 |
| AC-02 | TC-09, TC-10 |
| AC-03 | TC-10, TC-11, TC-14 |
| AC-04 | TC-12, TC-13, TC-14, TC-15, TC-16 |
| AC-05 | TC-17, TC-18 |
| AC-06 | met by the whole set: every criterion AC-01 to AC-05 has at least one test |
| AC-07 | met by the whole set: the full suite, including these tests, must pass with npm run test:run |

## Assumptions

| Test | What it assumes | Confidence |
|---|---|---|
| TC-04 | Accented letters fold case and are not accent-insensitive (GAP-10). Seed data has an author 'China Miéville'. | medium |
| TC-08 | '%' and '_' are literal characters (GAP-10). No seed title or author contains '_'. | medium |
| TC-05 | Per-field matching: the whole query must be in the title or in the author (GAP-11). | high |
| TC-06 | A no-match search returns 200 with the text 'No books found' (GAP-04). | medium |
| TC-07 | The card layout and title-ascending order (GAP-04, GAP-08). | medium |
| TC-09 | The seed data has 50 books and '1984' comes first (GAP-08). | high |
| TC-10 | Whitespace-only and missing q behave like an empty q (GAP-06, GAP-03). | high |
| TC-12 | The limit is 100 and exactly 100 is accepted (GAP-05). | medium |
| TC-13 | A 400 status, the `<p class="error">` fragment, the exact message, and no echo of the input (GAP-07). | medium |
| TC-14 | Length is measured after trimming (GAP-05). | medium |
| TC-15 | The limit counts Unicode characters, not bytes (GAP-05). | medium |
| TC-16 | Repeated or nested q is rejected with 400 and the single-text message (GAP-03). The briefing marks this low confidence. | low |
| TC-17 | Injection-style text is plain text; the seed contains the two titles with an apostrophe (GAP-09). | high |
| TC-18 | Injection-style text is plain text and never changes data (GAP-09). | high |

## Considered and left out

| Scenario | Why |
|---|---|
| Other query parameters being ignored (GAP-12) | Rare. It is not an acceptance criterion and adds only a small check on top of TC-11. |
| Checking that the bound-value rule is met in the code (no string-built SQL) | Internal structure. Tests at the entry point can only show its effect, and TC-17 and TC-18 do that. |
| Search box in the browser: htmx:beforeSwap allowing 400, and the error replacing earlier results | The briefing calls the listener a non-binding hint, and the tests are supertest only, with no browser. |
| HTML escaping of hostile title or author text | Needs book data that the seed does not contain. TC-17 covers escaping with the apostrophe titles. |
| Separate test for a book matching in both fields appearing once | Folded into TC-05, which checks the same rule. |
| Very long input (10,000 characters) or timing | Rare. TC-13 already shows the over-limit rule. |
| Regression of the existing home page list | The briefing does not say to keep any behaviour unchanged, and it states no relation to this. |
| JSON endpoint or other HTTP methods | The briefing says there is no JSON endpoint and states nothing else. |

## Notes

AC-06 and AC-07 are about the test suite itself, so they have no tests of their own. AC-05 is shown only through behaviour (TC-17, TC-18, plus TC-08 for literal wildcards). No black-box test can prove the query text never appears inside the SQL text. Relations covered: AC-01 with AC-02 (TC-09), AC-03 with AC-04 (TC-14), AC-03 with AC-02 (TC-10). AC-05 constrains AC-01 and is tested under that constraint (TC-17). Rare tests: 2 of 18 (TC-15, TC-16).
