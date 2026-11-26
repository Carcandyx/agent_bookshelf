# Briefing: BOOK-401 Export a shelf as a PDF

Status: DRAFT
Gaps: 2 open of 2
Blockers: 0
Source: docs/tickets/book-401/source.md (ticket text pasted by the user). The ID BOOK-401 comes from the folder name `book-401`.

## 1. Goal

A reader can download one of their shelves as a PDF file. The words are from the ticket's first bullet.

## 2. Acceptance criteria

| ID | Criterion (verbatim) | Source |
|---|---|---|
| AC-01 | GET /shelves/:id/export returns the shelf as a PDF file | bullet 1 |
| AC-02 | The PDF lists the title and author of each book on the shelf | bullet 2 |
| AC-03 | Vitest covers each criterion | bullet 3, part a |
| AC-04 | npm run test:run passes | bullet 3, part b |

## 3. How the criteria connect

| From | Relation | To | Why (quote or point to the words) |
|---|---|---|---|
| AC-01 | same-output | AC-02 | Both describe the PDF the request returns: "returns the shelf as a PDF file" and "The PDF lists the title and author". |
| AC-03 | constrains | AC-01 to AC-02 | "Vitest covers each criterion". |
| AC-04 | depends-on | AC-03 | "npm run test:run" passes is judged after the tests exist. |

## 4. Interface

| Item | Value |
|---|---|
| Entry point (method and path, or other trigger) | `GET /shelves/:id/export` (named in AC-01). |
| Input (names, types, where they come from) | The shelf id in the path. |
| Success response (status, shape, fields) | A PDF file. [[GAP-01]] |
| Error response (status, shape, message) | [[GAP-02]] |
| Ordering and limits of results | The ticket does not say how the books are ordered on the PDF. See GAP-01. |

## 5. Constraints (verbatim)

- Vitest covers each criterion; npm run test:run passes

## 6. Out of scope

Not stated.

## 7. Gaps

| ID | What is missing | Blocks | Who or what could answer | Answer |
|---|---|---|---|---|
| GAP-01 | How the PDF file is produced, its page size and layout, and the order of the books on it. | AC-01, AC-02 | Ticket author or the repository | |
| GAP-02 | The status and body for a shelf that does not exist. | AC-01 | Ticket author or the repository | |

## 8. Blockers

none

## 9. Named in the ticket and found in the repository

| Name | Found at | Note |
|---|---|---|
| `GET /shelves/:id` | src/routes/shelves.ts | Route exists and renders the shelf page. No `/export` route exists. |
| npm run test:run | package.json, scripts | Script exists: `vitest run`. |

STATUS: DRAFT | gaps=2 | blockers=0
