Reviewed `ticket/ABC-123-add-note` against `main`: 4 files, 112 lines of diff. Briefing and test list were not provided, so C-4 and T-1 were not checked.

2 findings: 1 high, 1 medium, 0 low; 0 dropped.

| # | Severity | Rule | File:line | Issue |
|---|---|---|---|---|
| 1 | high | S-1 | src/models/book.ts:31 | The query is built by putting the user's text inside the SQL string, so a quote in the text changes the query. |
| 2 | medium | A-2 | src/routes/books.ts:17 | The length check and the trimming are done in the route handler. These are business rules and belong in a service. |

```json
[
  {
    "file": "src/models/book.ts",
    "line": 31,
    "severity": "high",
    "rule": "S-1",
    "issue": "The query is built by putting the user's text inside the SQL string, so a quote in the text changes the query.",
    "evidence": "all(`SELECT * FROM books WHERE title LIKE '%${query}%' OR author LIKE '%${query}%' ORDER BY title`)"
  },
  {
    "file": "src/routes/books.ts",
    "line": 17,
    "severity": "medium",
    "rule": "A-2",
    "issue": "The length check and the trimming are done in the route handler. These are business rules and belong in a service.",
    "evidence": "const q = String(req.query.q ?? '').trim(); if (q.length > 100) { return res.status(400)..."
  }
]
```
