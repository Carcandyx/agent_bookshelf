# Decision rules

## Order of evidence

Use the first source that answers the gap. Go down only when the one above is silent.

1. **The ticket's own words**, including the examples and the wording of other criteria. A criterion that implies the answer settles it. Quote it.
2. **The repository's existing behaviour** for the same situation: how a similar route answers success and errors, how a similar query orders results, how existing validation words its messages, what the seed data looks like. Cite `path:line`.
3. **`CLAUDE.md` and the project conventions**: the three layers, parameterised SQL, `ValidationError`, escaped views, no schema change, no new dependency.
4. **The narrowest reading** that still meets every criterion: the one that adds the least behaviour and promises the least.

Do not use "what most apps do" as evidence while 1 to 3 have anything to say.

## Behaviour, not mechanism

A decision says what the finished work must do, in terms someone can observe (input, output, limit, error). It does not say how the code does it. Do not decide a function name, a layer detail, a SQL feature or a library inside a decision. If you have a view on the mechanism, add it as `Hint for the implementor (non-binding): ...` after the decision. The implementor chooses the mechanism and logs it.

## Choosing between readings

- Prefer the reading that keeps the existing user-visible behaviour of everything the ticket does not mention.
- Prefer the reading that is easiest to test from the entry point: a status code and visible output, not an internal detail.
- Prefer the reading that needs no new file type, no new dependency and no data change.
- When two readings are equally supported, choose the one that is safer if wrong (for input handling: stricter; for output: smaller; for errors: a clear message over silent success) and say so in "Alternatives considered".

## Interface gaps

When the ticket does not name the entry point or response shape:

- Reuse the route family and the response style already used for the same kind of page or data (an HTML page with an HTMX swap, or JSON under `/api`). Follow the existing handler that is closest, and cite it.
- For errors, use the status codes and message style the closest existing handler uses. On pages driven by HTMX, check how the existing handlers show an error: HTMX does not swap 4xx responses by default, so pick a response the page can actually display, and say so in the evidence.
- Define the exact names (path, parameter names, field names) in the decision so the tests and the code use the same words.

## Inputs, limits and boundaries

- A limit stated as a placeholder (brackets, "TBD") is a gap: choose a value from the ticket's other numbers or from the closest existing limit in the repository. If there is none, choose a round conventional value and mark the confidence `low`.
- State the boundary exactly (at the limit is allowed or rejected) and what is measured (before or after trimming).

## Confidence

| Level | Means |
|---|---|
| high | The ticket or the repository states it. |
| medium | It follows from convention or the narrowest reading; other readings were plausible. |
| low | A judgement call with no direct evidence. These are what a person should look at first. |

## Blockers

Do not decide, and return the BLOCKER block, when every reading of a gap needs: a new table, column or index or any schema or seed change; a migration; a library that is not already a dependency; a change to a protected file (database files, `.env`, seed data). Do not suggest how to avoid it.

## Consistency

After deciding all gaps, read the criteria again with your answers in place. If two answers cannot both be true, or an answer makes a criterion impossible or trivial, revise before you answer.
