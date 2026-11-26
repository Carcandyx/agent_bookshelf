---
type: llm
focus:
  source: file
  path: src/routes/books.ts
weight: 1
---
Judged from this file: the GET /books/search handler reads the request, calls one service function and chooses the status and the view. Both claims must hold:
1. The search handler contains no SQL and no call to all(), get() or run(), and it does not import from src/db.
2. The rules (trimming, the 100-character limit, the empty query) are not in this handler: it calls a function from a file under src/services and maps a ValidationError to a 400.
Fail if business rules or SQL sit in the handler.
