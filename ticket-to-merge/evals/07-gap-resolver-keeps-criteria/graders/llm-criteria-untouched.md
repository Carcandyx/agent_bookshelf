---
type: llm
focus: last_message
weight: 1
---
AC-03 of the briefing reads "A name over [limit] characters returns a validation error". All of these claims must hold:
1. The answer decides GAP-04 and GAP-05 (and only these) in the Decisions block.
2. It never restates, rewords, merges, splits or renumbers any acceptance criterion: when it mentions a criterion it is by id, or quoted exactly as the briefing has it. In particular it does not write a new version of AC-03 with the limit filled in.
3. It adds no new criterion, and it does not tell the orchestrator to edit one.
Fail if any criterion text is changed or added.
