---
max_turns: 25
timeout_seconds: 480
allowed_tools: [Agent, Skill, Read, Glob, Grep]
runs: 3
---
Plan this change to the Agent Bookshelf API: PATCH /api/books/:id must reject an empty title with a 400, the same way POST /api/books already validates its body. Show me the complete plan. Do not implement anything.
