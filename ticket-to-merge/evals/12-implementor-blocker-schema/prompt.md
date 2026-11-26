---
max_turns: 30
timeout_seconds: 600
allowed_tools: [Agent, Skill, Read, Glob, Grep, Edit, Write, Bash]
runs: 3
---
Use the ticket-to-merge:implementor agent for this step. Send it the prompt below as it is, and give me its answer exactly as it returns it, with nothing added or removed.

AGENT PROMPT
PHASE 1: PLAN ticket BOOK-301.

Inputs: docs/tickets/book-301/briefing.md ; CLAUDE.md ; the repository. No test files exist yet for this ticket.

Write no code. If the ticket cannot be done without a schema change, a migration, a new dependency or a protected file, return the BLOCKER block from the blocker rules and stop.

Otherwise plan the solution by layer (controller, service, repository) and return the plan in your answer (no plan page can be published in this sandbox).
