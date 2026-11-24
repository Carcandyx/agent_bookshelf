# Coverage rules

## What a good test row looks like

- **Title:** two to five words. "Partial title match".
- **What:** one sentence in plain words describing a scenario a user could actually be in. "Opening book 1 shows its title and its reviews."
- **Criteria:** the AC ids it proves. Usually one, sometimes two.
- **Expected:** what can be seen at the entry point (a status, a field, a count, a list that does or does not contain a given book). Never "calls function X".

## Types

| Type | Use for |
|---|---|
| happy | The normal path the criterion describes. |
| validation | Input that must be rejected or cleaned (empty, too long, padded with spaces). |
| boundary | Exactly at, just under, just over a stated limit. Only when the briefing states a limit. |
| security | Input meant to break the query (quotes, SQL fragments, wildcard characters). Only for criteria about safety, such as parameterised SQL. |
| regression | Existing behaviour that this ticket must not break. Only when the briefing says to keep something unchanged. |

## Likelihood (be honest)

| Value | Meaning |
|---|---|
| common | A normal user does this every day. |
| occasional | Happens now and then, or a careful user would try it. |
| rare | Needs unusual input or timing. Keep only if a criterion cannot be shown any other way. |

Rare tests are allowed, but at most one in four tests may be rare (`validate.mjs` checks this), and a rare test must be tied to a criterion that cannot be shown any other way. Nobody reviews the list, so you make the cut: scenarios you drop go into `left_out` with a reason.

## Realism filter

Before you keep a test, ask: would this scenario happen in real use of the feature, or only in a puzzle? Drop tests that only exist to exercise odd characters, huge inputs, or timing, unless a criterion is about exactly that (parameterised SQL is about quotes and SQL fragments, so a quote-character test is realistic there).

## Coverage check (do this before you answer)

1. Every AC in the briefing appears in the `coverage` list.
2. Every AC has at least one test, with one exception: a criterion that is about the tests themselves ("Vitest covers each criterion", "the suite passes") is met by the whole set. List it with an empty `tests` array and a `note` that says so.
3. Every test appears in the `coverage` list under each criterion it names.
4. If a criterion cannot be fully shown by tests, say how far the tests go in `notes`.
5. For every relation in the briefing's "How the criteria connect" table, at least one test exercises both criteria together (for example trim and length limit in the same input), unless the relation is `constrains` and the constrained criterion is already tested under the constraint.
6. Count: if there are fewer than one test per criterion, or more than four per criterion on average, re-check. Too few means gaps. Too many usually means rare cases or duplicates.

## Corrections

When the orchestrator sends validation problems:

- Keep the ids of tests that stay. New tests get the next free ids.
- Fix exactly what is reported, re-run the coverage check, and raise `revision` by one.
- Never hide an uncovered criterion: if a criterion can only be partly tested, say how far the tests go in `notes`.
