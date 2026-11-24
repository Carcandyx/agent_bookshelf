# Blockers: when to stop

Tickets in this project never involve a schema change or a migration. The same goes for new dependencies. If you cannot meet the acceptance criteria without one of these, you do not build a workaround. You stop and hand the problem to the engineer.

## What counts

| Need | Examples |
|---|---|
| Schema change | A new table, column, index or constraint; editing `src/db/schema.sql`. |
| Migration | Any script or file that changes the database structure or its data (including a new `.sql` file). |
| New dependency | Anything that would be added to `package.json`, including dev dependencies. Installing a library to solve a problem is treated as worse than a migration. |
| Protected file | `bookshelf.db*`, `src/db/seed.sql`, `.env*`, `package.json`, `package-lock.json`, the plugin's hook files. |

A workaround is also prohibited: storing the same data somewhere else, adding a JSON file as a pseudo-table, creating a table at runtime from code, copying a library's code into the repository, or similar. If the only way is one of those, it is a blocker.

## What to do

1. Stop at once. Do not write partial code or leave files half-changed.
2. Return exactly this, filled in:

```
BLOCKER
Ticket: <ID>
Needs: <schema change | migration | new dependency | protected file>
Because: <criterion id and one sentence: what the criterion requires that cannot be met without it>
Workarounds I did not take: <one line each, so the engineer sees they were considered>
Action for the engineer: The implementation has to come through a migration (or an approved dependency change). A workaround is also prohibited.
```

3. The orchestrator shows this to the user and ends the run. Nothing is committed.

## What does not count

- A criterion that is hard, slow or awkward but can be done with the existing schema and dependencies.
- A missing detail in the briefing. That is a briefing gap and goes back to the orchestrator as a question.
- A failing test. That is a fix iteration.

## The guardrail

The plugin's `protect.js` hook blocks edits to the protected files and package-manager commands that add or change dependencies. A blocked action is a sign you are about to need one of the above: stop and use the format above instead of looking for another way around the hook.
