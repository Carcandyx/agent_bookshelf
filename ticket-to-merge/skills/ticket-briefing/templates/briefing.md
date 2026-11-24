# Briefing: {{TICKET-ID}} {{Ticket title}}

Status: DRAFT
Gaps: {{open}} open of {{total}}
Blockers: {{n}}
Source: {{where the ticket text came from}}

## 1. Goal

{{One or two sentences, in the ticket's own words. If the ticket has no goal statement, write: not stated, and add a gap.}}

## 2. Acceptance criteria

| ID | Criterion (verbatim) | Source |
|---|---|---|
| AC-01 | {{exact words}} | {{bullet 1}} |
| AC-02 | {{exact words}} | {{bullet 2}} |

## 3. How the criteria connect

Only relations the ticket's words support. Allowed relations: depends-on, overlaps, constrains, same-input, same-output, conflicts. See the mapping rules.

| From | Relation | To | Why (quote or point to the words) |
|---|---|---|---|
| AC-01 | {{relation}} | AC-02 | {{evidence}} |

## 4. Interface

What the ticket says about how the work is called and what it returns. Anything the ticket does not say is a gap.

| Item | Value |
|---|---|
| Entry point (method and path, or other trigger) | {{value or [[GAP-nn]]}} |
| Input (names, types, where they come from) | {{value or [[GAP-nn]]}} |
| Success response (status, shape, fields) | {{value or [[GAP-nn]]}} |
| Error response (status, shape, message) | {{value or [[GAP-nn]]}} |
| Ordering and limits of results | {{value or [[GAP-nn]]}} |

## 5. Constraints (verbatim)

- {{constraint}}

## 6. Out of scope

{{Only what the ticket itself rules out. If it rules out nothing, write: not stated.}}

## 7. Gaps

| ID | What is missing | Blocks | Who or what could answer | Answer |
|---|---|---|---|---|
| GAP-01 | {{the question, one sentence}} | {{AC ids}} | {{person, document or repository}} | |

## 8. Blockers

{{Needs that the constraints prohibit (schema change, migration, new dependency, protected file). One line each, with the criterion that causes it. If none, write: none.}}

## 9. Named in the ticket and found in the repository

| Name | Found at | Note |
|---|---|---|
| {{file, script or route the ticket names}} | {{path}} | {{one line of fact, no design}} |
