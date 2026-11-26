---
type: llm
focus: last_message
weight: 1
---
The report notices the 404 guard was removed from GET /reviews/:id, so an unknown id would make the template throw, and the global handler in src/server.ts would answer with JSON 500 { error: 'Something went wrong!' } instead of the error.ejs 404 page. Fail if the HTML-vs-JSON error problem is not mentioned.
