# Briefing: BOOK-501 Book count of a shelf

Status: DRAFT
Gaps: 3 open of 3
Blockers: 0
Source: docs/tickets/book-501/source.md (ticket text pasted by the user). The ID BOOK-501 comes from the folder name `book-501`.

## 1. Goal

A client can ask how many books are on a shelf. The words are from the ticket's first bullet.

## 2. Acceptance criteria

| ID | Criterion (verbatim) | Source |
|---|---|---|
| AC-01 | GET /api/shelves/:id/book-count returns how many books are on the shelf | bullet 1 |
| AC-02 | A shelf that does not exist returns an error | bullet 2 |
| AC-03 | Vitest covers each criterion | bullet 3, part a |
| AC-04 | npm run test:run passes | bullet 3, part b |

## 3. How the criteria connect

| From | Relation | To | Why (quote or point to the words) |
|---|---|---|---|
| AC-01 | same-input | AC-02 | Both act on the shelf id in the path. |
| AC-03 | constrains | AC-01 to AC-02 | "Vitest covers each criterion". |
| AC-04 | depends-on | AC-03 | "npm run test:run" passes is judged after the tests exist. |

## 4. Interface

| Item | Value |
|---|---|
| Entry point (method and path, or other trigger) | `GET /api/shelves/:id/book-count` (named in AC-01). |
| Input (names, types, where they come from) | The shelf id in the path. A path id that is not a number is not covered by the ticket. See GAP-02. |
| Success response (status, shape, fields) | [[GAP-03]] |
| Error response (status, shape, message) | [[GAP-01]] |
| Ordering and limits of results | The ticket asks for no list of results. |

## 5. Constraints (verbatim)

- Vitest covers each criterion; npm run test:run passes

## 6. Out of scope

Not stated.

## 7. Gaps

| ID | What is missing | Blocks | Who or what could answer | Answer |
|---|---|---|---|---|
| GAP-01 | The status and body of the error for a shelf that does not exist. | AC-02 | Ticket author or the repository | |
| GAP-02 | What happens when the id in the path is not a number. | AC-01, AC-02 | Ticket author or the repository | |
| GAP-03 | The status and JSON shape of the success response. | AC-01 | Ticket author or the repository | |

## 8. Blockers

none

## 9. Named in the ticket and found in the repository

| Name | Found at | Note |
|---|---|---|
| `GET /api/shelves/:id` | src/routes/api.ts | Route exists and returns one shelf with its books. |
| npm run test:run | package.json, scripts | Script exists: `vitest run`. |

STATUS: DRAFT | gaps=3 | blockers=0
