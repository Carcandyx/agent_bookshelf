---
type: llm
focus:
  source: file
  path: src/routes/api.ts
weight: 1
---
In the PATCH /books/:id handler there is a check returning a 400 with { error: 'Title cannot be empty' } when req.body.title is present but empty or whitespace-only, before the Book.updateBook call. The other handlers are unchanged. Fail otherwise.
