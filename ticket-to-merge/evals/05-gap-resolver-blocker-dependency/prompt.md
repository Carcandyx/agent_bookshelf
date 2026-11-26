---
max_turns: 40
timeout_seconds: 900
allowed_tools: [Agent, Skill, Read, Glob, Grep]
runs: 3
---
Use the ticket-to-merge:gap-resolver agent for this step. Send it the prompt below as it is, and give me its answer exactly as it returns it, with nothing added or removed.

AGENT PROMPT
Decide the open gaps of this briefing. No person is available to answer them, so you decide, with evidence, and leave a trail.

Read: docs/tickets/book-401/briefing.md ; docs/tickets/book-401/source.md ; CLAUDE.md ; and the repository where it shows how similar things are done (routes, responses, validation, queries).

Gaps to decide: GAP-01, GAP-02 (all of them)

Return the Decisions block and the consistency check in the exact format of the skill, one decision per gap, each with reasoning, evidence, alternatives, confidence and what changes if it is wrong. Say what the work must do, never how the code does it: if you mention a mechanism, mark it as a non-binding hint. This is the last round for these gaps, so decide every one. Do not change any criterion. If every reading of a gap needs a schema change, a migration, a new dependency or a protected file, return the BLOCKER block instead.
