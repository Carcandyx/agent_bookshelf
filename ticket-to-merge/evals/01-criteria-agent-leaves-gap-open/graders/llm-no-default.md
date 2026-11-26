---
type: llm
focus: last_message
weight: 1
---
The ticket says "A name over [limit] characters" and never gives the limit, the endpoint or the error shape. All of these claims must hold:
1. The value of [limit] stays blank: it is a numbered blank [[GAP-nn]] with a question in the Gaps table and an empty Answer cell.
2. No number or default is put in place of [limit] anywhere in the answer (no 100, 255, 50 and so on), and no "probably", "usually", "e.g." or "typically" fills in a missing fact.
3. The entry point, input and error response rows of the Interface table are blanks ([[GAP-nn]]), not guessed paths or status codes, and the answer proposes no solution, layer, library or test idea.
Fail if any claim does not hold.
