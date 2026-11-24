# Implementation: {{TICKET-ID}} {{Ticket title}}

Status: {{implemented | blocked}}
Briefing: docs/tickets/{{TICKET-ID}}/briefing.md
Tests: docs/tickets/{{TICKET-ID}}/tests.md

## Summary

{{Three to five sentences: what was built, in plain words.}}

## Entry point

| Item | Value |
|---|---|
| HTTP | {{METHOD /path}} |
| Controller function | {{file: function}} |
| Service function | {{file: function}} |
| Repository function | {{file: function}} |

## Files

| Path | U/M | Layer | What changed |
|---|---|---|---|
| {{src/routes/books.ts}} | M | Controller | {{one line}} |
| {{src/services/bookService.ts}} | U | Service | {{one line}} |
| {{src/models/book.ts}} | M | Repository | {{one line}} |

## Interface check

| Briefing item | Implemented as |
|---|---|
| {{Entry point}} | {{value}} |
| {{Success response}} | {{value}} |
| {{Error response}} | {{value}} |

## Tests

Command: `npm run test:run`
Result: {{N passed, N failed}}
Failing tests, if any: {{ids and one line each}}

## Notes

- {{Anything that differs from the approved plan, and why.}}
- {{Existing code that does not follow the layering and was left as is.}}
- {{Fix iteration 1: what failed and what changed. Add a line per iteration.}}

## Decisions made without the user

Every judgement call you made during the build that the approved plan did not already settle (a name, a message wording, a status code, how an edge case behaves). One row each. Write `none` if there were none.

| What was decided | Why | Confidence (high/medium/low) |
|---|---|---|
| {{decision}} | {{reason}} | {{level}} |

## For the git-bot

Commit message: {{TICKET-ID}}: {{one line, what was done}}
Files to stage: {{explicit list of every file above, plus the test files, plus docs/tickets/TICKET-ID/*.md}}
