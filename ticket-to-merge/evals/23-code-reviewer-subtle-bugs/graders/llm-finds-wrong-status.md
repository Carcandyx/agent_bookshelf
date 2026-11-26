---
type: llm
focus: last_message
weight: 1
---
Planted bug 2: in src/routes/books.ts line 20 the validation error is answered with status 422, while the briefing's Error response row and test TC-13 say 400. A finding counts when it is in src/routes/books.ts within 3 lines of line 20 and says the status should be 400 (not 422) per the briefing. Pass only if such a finding exists.
