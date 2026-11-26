---
type: llm
focus: trace
weight: 1
---
The tests written cover only PATCH /api/reviews/:id and its listed non-happy paths. The agent did not write tests for unrelated review, user or shelf functions or other endpoints. Fail if it backfilled unrelated gaps.
