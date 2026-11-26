---
max_turns: 40
timeout_seconds: 900
allowed_tools: [Agent, Skill, Read, Glob, Grep]
runs: 3
---
Use the ticket-to-merge:code-reviewer agent for this step. Send it the prompt below as it is, and give me its answer exactly as it returns it, with nothing added or removed.

AGENT PROMPT
Review this diff. The full diff is in review.patch at the repository root, and the repository files already contain the change. Changed files: src/db/index.ts, src/models/book.ts, src/routes/books.ts, src/services/bookService.ts, src/services/errors.ts, src/types/sql.js.d.ts, src/views/books/book-grid.ejs, src/views/books/index.ejs, src/views/books/search-error.ejs, tests/routes/book-search.test.ts. The briefing is docs/tickets/book-101/briefing.md and the approved test list is docs/tickets/book-101/tests.md.

Return the JSON array of findings and nothing else. If there is nothing to report, return [].
