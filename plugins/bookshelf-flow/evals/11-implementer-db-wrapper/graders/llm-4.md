---
type: llm
focus:
  source: file
  path: src/models/review.ts
weight: 1
---
getReviewsByBookId still goes through the all() helper imported from '../db/index.js' (the .js extension is kept) and still passes [bookId] as the positional parameter. Fail otherwise.
