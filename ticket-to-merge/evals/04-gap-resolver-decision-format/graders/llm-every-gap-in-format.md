---
type: llm
focus: last_message
weight: 1
---
The briefing has six open gaps (GAP-01 to GAP-06). All of these claims must hold:
1. There is exactly one decision per gap, and each has the fields Decision, Reasoning, Evidence, Alternatives considered, Confidence (high, medium or low) and If wrong.
2. No gap is left as "unknown" or "to be confirmed", and the answer has no BLOCKER block.
3. Evidence cites the ticket's words, CLAUDE.md or real repository paths (for example the POST /shelves route in src/routes/api.ts, or the UNIQUE(user_id, name) constraint in src/db/schema.sql), not invented files.
4. The decisions agree with each other (for example the limit chosen in GAP-04 and the empty-name rule of GAP-05 do not contradict) and the Consistency check says how that was checked.
Fail if any claim does not hold.
