---
max_turns: 25
timeout_seconds: 480
allowed_tools: [Agent, Skill, Read, Glob, Grep, Edit, Write]
runs: 3
---
Write tests for PATCH /api/books/:id. It already rejects an empty title with a 400 and { error: "Title cannot be empty" }. Add the tests to tests/routes/api.test.ts, matching the existing style.
