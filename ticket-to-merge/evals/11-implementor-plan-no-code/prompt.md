---
max_turns: 40
timeout_seconds: 900
allowed_tools: [Agent, Skill, Read, Glob, Grep, Edit, Write, Bash]
runs: 3
---
Use the ticket-to-merge:implementor agent for this step. Send it the prompt below as it is, and give me its answer exactly as it returns it, with nothing added or removed.

AGENT PROMPT
PHASE 1: PLAN ticket BOOK-101.

Inputs: docs/tickets/book-101/briefing.md ; docs/tickets/book-101/tests.md ; the failing test files under tests/ for this ticket: tests/routes/book-search.test.ts ; CLAUDE.md ; the repository.

Write no code and write no file: no plan page can be published in this sandbox, so return the plan in your answer. If the ticket cannot be done without a schema change, a migration, a new dependency or a protected file, return the BLOCKER block from the blocker rules and stop.

Otherwise plan the solution by layer (controller, service, repository), and return a short summary and, as bullets, the choices in the plan the user should look at first.
