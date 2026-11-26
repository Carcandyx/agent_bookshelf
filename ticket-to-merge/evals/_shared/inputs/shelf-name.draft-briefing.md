# Briefing: BOOK-201 Shelf name rules

Status: DRAFT
Gaps: 6 open of 6
Blockers: 0
Source: docs/tickets/book-201/source.md (ticket text pasted by the user). The ID BOOK-201 comes from the folder name `book-201`, not from the ticket text. See GAP-01.

## 1. Goal

Not stated. [[GAP-01]]

## 2. Acceptance criteria

| ID | Criterion (verbatim) | Source |
|---|---|---|
| AC-01 | A shelf name is trimmed | bullet 1, part a |
| AC-02 | an empty name returns a validation error | bullet 1, part b |
| AC-03 | A name over [limit] characters returns a validation error | bullet 2 |
| AC-04 | Vitest covers each criterion | bullet 3, part a |
| AC-05 | npm run test:run passes | bullet 3, part b |

## 3. How the criteria connect

Only relations the ticket's words support.

| From | Relation | To | Why (quote or point to the words) |
|---|---|---|---|
| AC-01 | same-input | AC-02 | Both act on the shelf name: "A shelf name is trimmed; an empty name returns a validation error". |
| AC-01 | same-input | AC-03 | Both act on the shelf name. |
| AC-04 | constrains | AC-01 to AC-03 | "Vitest covers each criterion". |
| AC-05 | depends-on | AC-04 | "npm run test:run" passes is judged after the tests exist. |

Order between AC-01 and AC-02: the ticket does not say whether "empty" is judged before or after trimming. See GAP-05.

## 4. Interface

| Item | Value |
|---|---|
| Entry point (method and path, or other trigger) | [[GAP-02]] |
| Input (names, types, where they come from) | [[GAP-03]] |
| Success response (status, shape, fields) | The ticket does not say. See GAP-02. |
| Error response (status, shape, message) | [[GAP-06]] |
| Ordering and limits of results | The ticket asks for no list of results. The limit [limit] is in GAP-04. |

## 5. Constraints (verbatim)

- Vitest covers each criterion; npm run test:run passes

## 6. Out of scope

Not stated.

## 7. Gaps

| ID | What is missing | Blocks | Who or what could answer | Answer |
|---|---|---|---|---|
| GAP-01 | The ticket has no title, no ID and no goal sentence. | header, section 1 | Ticket author | |
| GAP-02 | Which entry point takes the shelf name (create a shelf, rename a shelf, or both), and what a success returns. | AC-01 to AC-03 | Ticket author or the repository | |
| GAP-03 | The name, type and source of the input that holds the shelf name. | AC-01 to AC-03 | Ticket author or the repository | |
| GAP-04 | The value of [limit], and whether the count is made on the trimmed name. | AC-03 | Ticket author | |
| GAP-05 | Whether a name that is only spaces counts as empty. | AC-01, AC-02 | Ticket author | |
| GAP-06 | The status, shape and message of the validation error. | AC-02, AC-03 | Ticket author or the repository | |

## 8. Blockers

none

## 9. Named in the ticket and found in the repository

| Name | Found at | Note |
|---|---|---|
| npm run test:run | package.json, scripts | Script exists: `vitest run`. |
| Vitest | package.json, devDependencies | Listed as a dependency. |

STATUS: DRAFT | gaps=6 | blockers=0
