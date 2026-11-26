---
type: regex
target:
  source: file
  path: src/routes/api.ts
match: not_contains
weight: 1
---
router\.patch\('/shelves
