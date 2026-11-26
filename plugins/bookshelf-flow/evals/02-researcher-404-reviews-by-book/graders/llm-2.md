---
type: llm
focus: last_message
weight: 1
---
Both claims must hold:
1. The existence check goes in the route handler in src/routes/api.ts using the existing Book.getBookById, mirroring GET /api/books/:id (404 with { error: 'Book not found' }).
2. It proposes no schema change, migration or new dependency.
Fail if either claim is missing.
