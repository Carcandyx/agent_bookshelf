---
max_turns: 30
timeout_seconds: 480
allowed_tools: [Agent, Skill, Read, Glob, Grep, Edit]
runs: 3
---
Implement this approved plan exactly, then tell me what you changed.

PLAN
endpoint: GET /api/reviews/book/:bookId. layer: model (src/models/review.ts). Files to change:
1. src/models/review.ts: in getReviewsByBookId, change the query's ORDER BY from 'r.created_at DESC' to 'r.rating DESC, r.created_at DESC'. No other changes.
