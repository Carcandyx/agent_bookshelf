---
type: llm
focus: last_message
weight: 1
---
The report flags that the new DELETE write path (run() in deleteReviewsByBookId, exposed by DELETE /api/reviews/book/:bookId) is not saved to disk, because run() in src/db/index.ts never calls saveDb() (only initDb and closeDb do). Fail if the persistence problem is not mentioned.
