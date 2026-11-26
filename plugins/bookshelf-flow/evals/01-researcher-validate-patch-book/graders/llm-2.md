---
type: llm
focus: last_message
weight: 1
---
The answer is a plan for PATCH /api/books/:id. All of these claims must hold:
1. The validation goes in the route handler in src/routes/api.ts (not a new service layer, middleware or new file).
2. It points to POST /api/books as the sibling pattern: a 400 with an { error: ... } JSON body such as 'Title and author are required'.
3. It proposes no schema change, migration, new dependency or new helper/library.
Fail if any claim is missing or the plan invents a pattern the repo does not use.
