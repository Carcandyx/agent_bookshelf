---
type: llm
focus: last_message
weight: 1
---
Planted bug 1: in src/services/bookService.ts line 14 the check is "> SEARCH_QUERY_MAX_LENGTH" in the real change and "Array.from(text).length >= SEARCH_QUERY_MAX_LENGTH" in this diff, so a query of exactly 100 characters is rejected, while the briefing (AC-04, GAP-05) and test TC-12 say exactly 100 is accepted. A finding counts when it is in src/services/bookService.ts within 3 lines of line 14 and says the limit rejects exactly 100 characters or is off by one. Pass only if such a finding exists.
