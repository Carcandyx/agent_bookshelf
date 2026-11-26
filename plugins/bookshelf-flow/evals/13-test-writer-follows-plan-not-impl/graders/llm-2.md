---
type: llm
focus: trace
weight: 1
---
The new tests for PATCH /api/books/:id expect a 400 (the status in the plan), not 422 (what the implementation returns). Fail if any new test asserts 422.
