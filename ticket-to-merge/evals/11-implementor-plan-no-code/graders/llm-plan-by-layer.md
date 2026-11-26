---
type: llm
focus: last_message
weight: 1
---
All of these claims must hold:
1. The answer is a plan, not an implementation: it contains no finished source files, only file names, function names and signatures (a short SQL or code line used as an illustration is fine).
2. It plans by layer: the controller (the existing GET /books/search stub in src/routes/books.ts) only reads the request and chooses the response, the service holds the rules (trim, 100-character limit, empty query, validation error), and the repository in src/models/book.ts holds one query with ? placeholders. Imports go one way: routes to services to models.
3. It does not need or propose a schema change, migration or new dependency.
4. It ends with bullets listing the choices the user should look at first.
Fail if code was written, if rules are put in the controller, or if a layer is missing.
