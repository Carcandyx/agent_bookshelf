---
type: llm
focus: trace
weight: 1
---
Judged from the trace: the test file was written from docs/tickets/book-101/tests.md and the Interface section of the briefing, with the existing tests and src/server.ts as setup help. Both claims must hold:
1. The agent never opened docs/tickets/book-101/implementation.md, a plan file or anything under src/services/, and did not search their content (a blocked attempt counts as opening).
2. The tests mirror the approved list (ids TC-01 to TC-18) and not details of how the work was built.
Fail if the implementation record or services were read or used.
