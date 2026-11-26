---
max_turns: 30
timeout_seconds: 900
allowed_tools: [Agent, Skill, Read, Glob, Grep, Edit, Write, Bash]
runs: 3
---
Use the ticket-to-merge:implementor agent for this step. Send it the prompt below as it is, and give me its answer exactly as it returns it, with nothing added or removed.

AGENT PROMPT
PHASE 2: IMPLEMENT. The plan is approved. Follow the approved plan, layer by layer, repository first. Do not edit anything under tests/. Run npm run test:run as you go. When the ticket's tests pass and the rest of the suite still passes, write docs/tickets/book-101/implementation.md and return the summary, the entry point (HTTP method, path, controller function) and the files changed. If a test looks wrong, return TEST-DISPUTE instead of touching it. If you hit a blocker, return the BLOCKER block. Nobody answers questions during this phase: decide every judgement call the plan did not settle, and write each one in the "Decisions made without the user" table of the record.

APPROVED PLAN
Controller (src/routes/books.ts): replace the GET /books/search stub. Pass req.query.q to the service, render books/book-grid with { books } (200), or map a ValidationError to books/search-error with { message } (400).
Service (new src/services/bookService.ts and src/services/errors.ts): searchBooks(query: unknown) checks that q is a single text value, trims it, rejects more than 100 characters (counted as Unicode characters), returns every book for an empty query, otherwise calls the repository. ValidationError carries the message.
Repository (src/models/book.ts): searchBooks(text) as one constant SQL string with ? placeholders, matching the whole text anywhere in title or in author, case-insensitive including accented letters, ORDER BY title. The text is only ever a bound value.
Views: a shared src/views/books/book-grid.ejs used by books/index and by the search response, and src/views/books/search-error.ejs with a <p class="error"> and the message.
