# Briefing: BOOK-301 Page count on books

Status: COMPLETE
Gaps: 2 decided by gap-resolver, 0 open
Blockers: 0
Source: docs/tickets/book-301/source.md (ticket text pasted by the user). The ID BOOK-301 comes from the folder name `book-301`.

## 1. Goal

A reader can see how many pages a book has. (decided by gap-resolver, medium)

## 2. Acceptance criteria

| ID | Criterion (verbatim) | Source |
|---|---|---|
| AC-01 | Each book stores its page count | bullet 1 |
| AC-02 | GET /api/books/:id returns page_count | bullet 2 |
| AC-03 | A page count below 1 is rejected | bullet 3 |
| AC-04 | Vitest covers each criterion | bullet 4, part a |
| AC-05 | npm run test:run passes | bullet 4, part b |

## 3. How the criteria connect

| From | Relation | To | Why (quote or point to the words) |
|---|---|---|---|
| AC-01 | depends-on | AC-02 | The page count that is returned is the one each book stores: "Each book stores its page count" and "returns page_count". |
| AC-01 | same-input | AC-03 | Both act on the page count value. |
| AC-04 | constrains | AC-01 to AC-03 | "Vitest covers each criterion". |
| AC-05 | depends-on | AC-04 | "npm run test:run" passes is judged after the tests exist. |

## 4. Interface

| Item | Value |
|---|---|
| Entry point (method and path, or other trigger) | `GET /api/books/:id` (named in AC-02). Stored values are set through `POST /api/books` and `PATCH /api/books/:id`. (GAP-01, decided by gap-resolver, medium) |
| Input (names, types, where they come from) | JSON field `page_count`, integer, in the body of `POST /api/books` and `PATCH /api/books/:id`. |
| Success response (status, shape, fields) | 200, the book JSON with an extra field `page_count` (integer, or null when never set). |
| Error response (status, shape, message) | 400 `{ "error": "Page count must be at least 1" }` for a value below 1. (GAP-02, decided by gap-resolver, medium) |
| Ordering and limits of results | The ticket asks for no list of results. |

## 5. Constraints (verbatim)

- Vitest covers each criterion; npm run test:run passes

## 6. Out of scope

Not stated.

## 7. Gaps

| ID | What is missing | Blocks | Who or what could answer | Answer |
|---|---|---|---|---|
| GAP-01 | Which entry points set the page count. | AC-01 | Ticket author | `POST /api/books` and `PATCH /api/books/:id`. decided by gap-resolver (medium) |
| GAP-02 | Status and message for a page count below 1. | AC-03 | Ticket author or the repository | 400 with `{ "error": "Page count must be at least 1" }`, like the other validation errors in `src/routes/api.ts`. decided by gap-resolver (medium) |

## 8. Blockers

none

## 9. Named in the ticket and found in the repository

| Name | Found at | Note |
|---|---|---|
| `GET /api/books/:id` | src/routes/api.ts | Route exists and returns the book row as JSON. |
| npm run test:run | package.json, scripts | Script exists: `vitest run`. |

STATUS: COMPLETE | gaps=0 | blockers=0
