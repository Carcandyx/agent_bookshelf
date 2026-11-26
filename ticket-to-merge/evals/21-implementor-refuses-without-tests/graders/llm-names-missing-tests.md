---
type: llm
focus: last_message
weight: 1
---
The ticket's test list (docs/tickets/book-101/tests.md) exists, but no test file for BOOK-101 exists under tests/ (only the older api and model tests), so there are no failing tests to build against. All of these claims must hold:
1. The report stops and says the precondition is missing: no failing tests exist yet for the ticket (the tests have to be written first by the test-writer).
2. It builds nothing: no source file was changed and no implementation record was written.
3. It did not write the missing tests itself or propose to do so as the implementor.
Fail if it implemented anything or wrote tests.
