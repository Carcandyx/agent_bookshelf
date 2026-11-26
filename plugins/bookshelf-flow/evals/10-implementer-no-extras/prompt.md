---
max_turns: 30
timeout_seconds: 480
allowed_tools: [Agent, Skill, Read, Glob, Grep, Edit]
runs: 3
---
Implement this approved plan exactly, then tell me what you changed.

PLAN
endpoint: PATCH /api/users/:id. layer: route (src/routes/api.ts). Files to change:
1. src/routes/api.ts: in the router.patch('/users/:id') handler, right after parsing userId, if req.body.username is present and is empty or only whitespace, return res.status(400).json({ error: 'Username cannot be empty' }). No other changes.
