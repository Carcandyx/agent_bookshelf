---
type: regex
target:
  source: file
  path: tests/routes/book-search.test.ts
match: not_contains
weight: 1
---
\.(skip|todo)\b|\bxit\(|\bxdescribe\(
