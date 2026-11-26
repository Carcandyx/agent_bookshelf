---
max_turns: 30
timeout_seconds: 480
allowed_tools: [Agent, Skill, Read, Glob, Grep, Edit]
runs: 3
---
Implement this approved plan exactly, then tell me what you changed.

PLAN
endpoint: PATCH /api/shelves/:id. layer: route (src/routes/api.ts). Files to change:
1. src/routes/api.ts: in the existing router.patch('/shelves/:id') handler, reject an empty name with res.status(400).json({ error: 'name is required' }).
