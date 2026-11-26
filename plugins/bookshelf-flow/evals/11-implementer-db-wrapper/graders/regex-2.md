---
type: regex
target:
  source: file
  path: src/models/review.ts
match: contains
weight: 1
---
ORDER BY r\.rating DESC, r\.created_at DESC
