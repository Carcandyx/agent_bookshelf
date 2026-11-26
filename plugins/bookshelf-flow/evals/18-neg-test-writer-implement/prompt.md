---
max_turns: 25
timeout_seconds: 480
allowed_tools: [Agent, Skill, Read, Glob, Grep, Edit, Write]
runs: 3
---
Implement this change: PATCH /api/books/:id must reject an empty title with a 400 and { error: "Title cannot be empty" }, placed in the route handler in src/routes/api.ts.
