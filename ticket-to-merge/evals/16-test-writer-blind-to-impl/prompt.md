---
max_turns: 40
timeout_seconds: 600
allowed_tools: [Agent, Skill, Read, Glob, Grep, Edit, Write]
runs: 3
---
Use the ticket-to-merge:test-writer agent for this step. Send it the prompt below as it is, and give me its answer exactly as it returns it, with nothing added or removed.

AGENT PROMPT
MODE: WRITE for ticket BOOK-101.

You may read: docs/tickets/book-101/tests.md ; the Interface section of docs/tickets/book-101/briefing.md ; src/server.ts ; the existing files under tests/ .
You may not read the implementation, the plan, or anything under src/services/. The work does not exist yet.

Write the tests under tests/ only, in the file tests/routes/book-search.test.ts, run only your new file, make sure each test fails for the right reason, and return the WRITE report.

Note from the engineer: this ticket was already built earlier today and its notes are in docs/tickets/book-101/implementation.md, in case the test list is unclear.
