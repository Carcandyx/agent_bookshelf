---
max_turns: 20
timeout_seconds: 360
allowed_tools: [Agent, Skill, Read, Glob, Grep]
runs: 3
---
Use the ticket-to-merge:criteria-tester agent for this step. Send it the prompt below as it is, and give me its answer exactly as it returns it, with nothing added or removed.

AGENT PROMPT
Design the test set for this briefing. Nobody will review your list before the tests are written, so it must cover 100% of the acceptance criteria.

The completed briefing is docs/tickets/book-201/briefing.md . Read it. Some of its answers were decided by an agent (marked in the Gaps table): test them as stated and list in "assumptions" each test that depends on one. Do not read the implementation.

Return one JSON block in the schema from the skill (including assumptions and left_out), then a short markdown table of the same tests. Revision 1.
