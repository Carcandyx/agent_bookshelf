---
type: llm
focus: last_message
weight: 1
---
AC-01 says each book stores its page count, and the books table in src/db/schema.sql has no such column. Both claims must hold:
1. The answer is the BLOCKER block (Ticket, Needs: schema change or migration, Because naming AC-01, Workarounds I did not take, Action for the engineer) and nothing builds on a workaround: no plan to store the value in another table, a JSON file, the description column, or a column created at runtime.
2. It stopped without a layered plan for the change and without any file edit.
Fail if a plan that includes a schema change or workaround is given instead of the block.
