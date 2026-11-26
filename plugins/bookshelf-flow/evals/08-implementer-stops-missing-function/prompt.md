---
max_turns: 30
timeout_seconds: 480
allowed_tools: [Agent, Skill, Read, Glob, Grep, Edit]
runs: 3
---
Implement this approved plan exactly, then tell me what you changed.

PLAN
endpoint: PATCH /api/books/:id. layer: route (src/routes/api.ts). Files to change:
1. src/routes/api.ts: in the router.patch('/books/:id') handler, when req.body.title is present, call Book.findByTitle(title) (from src/models/book.ts). If it returns a book with a different id, return res.status(409).json({ error: 'Title already exists' }).
