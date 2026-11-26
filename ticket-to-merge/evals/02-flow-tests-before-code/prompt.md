---
max_turns: 80
timeout_seconds: 1800
allowed_tools: [Agent, Skill, Read, Glob, Grep, Edit, Write, Bash]
runs: 3
---
Work through two steps of shipping ticket BOOK-101 with the ticket-to-merge agents. The briefing (docs/tickets/book-101/briefing.md) is COMPLETE and the test list (docs/tickets/book-101/tests.md) is approved. Nobody reviews anything: skip every pause, and the plan review is waived (do not publish a plan page: the implementor plans in text).

Step 1. Dispatch the ticket-to-merge:test-writer agent with this prompt, and wait for its WRITE report.

> MODE: WRITE for ticket BOOK-101.
>
> You may read: docs/tickets/book-101/tests.md ; the Interface section of docs/tickets/book-101/briefing.md ; src/server.ts ; the existing files under tests/ .
> You may not read the implementation, the plan, or anything under src/services/. The work does not exist yet.
>
> Write the tests under tests/ only, in the file tests/routes/book-search.test.ts, run only your new file, make sure each test fails for the right reason, and return the WRITE report.

Step 2. Only after step 1 has returned, dispatch the ticket-to-merge:implementor agent with PHASE 1 (plan by layer, write no code, return the plan in your answer) and then PHASE 2:

> PHASE 2: IMPLEMENT. The plan is approved. Follow the approved plan, layer by layer, repository first. Do not edit anything under tests/. Run npm run test:run as you go. When the ticket's tests pass and the rest of the suite still passes, write docs/tickets/book-101/implementation.md and return the summary, the entry point (HTTP method, path, controller function) and the files changed. If a test looks wrong, return TEST-DISPUTE instead of touching it. If you hit a blocker, return the BLOCKER block. Nobody answers questions during this phase: decide every judgement call the plan did not settle, and write each one in the "Decisions made without the user" table of the record.
>
> APPROVED PLAN
> Controller (src/routes/books.ts): replace the GET /books/search stub. Pass req.query.q to the service, render books/book-grid with { books } (200), or map a ValidationError to books/search-error with { message } (400).
> Service (new src/services/bookService.ts and src/services/errors.ts): searchBooks(query: unknown) checks that q is a single text value, trims it, rejects more than 100 characters (counted as Unicode characters), returns every book for an empty query, otherwise calls the repository. ValidationError carries the message.
> Repository (src/models/book.ts): searchBooks(text) as one constant SQL string with ? placeholders, matching the whole text anywhere in title or in author, case-insensitive including accented letters, ORDER BY title. The text is only ever a bound value.
> Views: a shared src/views/books/book-grid.ejs used by books/index and by the search response, and src/views/books/search-error.ejs with a <p class="error"> and the message.

When both steps are done, tell me in order which agent ran, which files each one changed, and the test result after each step.
