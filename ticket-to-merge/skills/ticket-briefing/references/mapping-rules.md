# Mapping rules

## What to extract

| From the ticket | Goes to |
|---|---|
| Title, ID, goal sentence | Header and section 1 |
| Each acceptance criterion | Section 2, verbatim, one per row |
| Anything about how it is called or what it returns | Section 4 |
| "No...", "Never...", "Keep..." statements | Section 5, verbatim |
| Things the ticket says are not part of the work | Section 6 |
| Files, scripts, routes, tools the ticket names | Section 9 (after checking they exist) |

## Relations between criteria

Use only these words, and only when the ticket's text supports them.

| Relation | Meaning | Example |
|---|---|---|
| depends-on | B cannot be judged unless A has already happened. | "Names over 50 characters are rejected" depends-on "Names are trimmed", if the ticket says the length is measured on the trimmed name. |
| overlaps | A and B talk about the same behaviour from two sides. | "A filter matches by genre" overlaps "No filter returns all books" (both define what comes back for a filter). |
| constrains | A limits how B may be met. | "SQL is parameterised" constrains "A filter matches by genre". |
| same-input | A and B act on the same input value. | Trim and length limit both act on the name. |
| same-output | A and B decide the same output. | Filtering and the empty filter both decide the list of books returned. |
| conflicts | A and B cannot both be true as written. | Rare. Record it and add a gap asking which one wins. |

A relation the ticket's words do not support is a gap, not a relation. Example: the ticket does not say whether trimming happens before the length check, so "is the limit measured before or after trimming?" is a gap even though most people would assume after.

## What counts as a gap

Open a gap when any of these is true:

1. The ticket does not say it, but a later step would need it (interface rows, success and error shapes, ordering, limits).
2. The ticket's words allow more than one reading ("partial match": anywhere in the text, or only at the start?).
3. Two criteria would need an order or priority the ticket does not give.
4. A value is shown as a placeholder in the ticket (brackets, TBD, "[100]", "[endpoint and response shape]").
5. The ticket names something that cannot be found in the repository.
6. You are about to write "probably", "presumably", "usually", "by default", or "should be". Stop and write a gap instead.

Do not open a gap for things that belong to later stages: which test cases to write, which layer holds which code, which function names to use, which mechanism or library does the work (including a mechanism a previous decision hinted at). Those are not missing information about the ticket.

One question per gap. Ask it so a colleague could answer it in one sentence.

## What counts as a blocker

A blocker is a need that the standing constraints prohibit. List it, with the criterion that causes it, and do not suggest how to avoid it.

- The ticket requires a new table, column, index or any change to the schema or the seed data.
- The ticket requires a migration.
- The ticket requires a library that is not already a dependency.
- The ticket requires a change to a protected file (database files, `.env`, seed data).

If the ticket does not require any of these, write `none`. Do not write "no blockers expected".

## What you must never do

- Fill a gap, even with a default that is common.
- Reword a criterion to make it clearer. Quote it.
- Merge two criteria into one, or split one without saying so.
- Add a criterion the ticket did not state (for example "should be fast", "should log errors").
- Propose tests, code, files, layers or libraries.
