---
name: update-endpoint
disable-model-invocation: true
description: Update an existing Agent Bookshelf endpoint through a four-agent flow (researcher, implementer, test-writer, reviewer), with an approval gate after the plan. Use whenever the user wants to change the behavior of an existing endpoint, route, handler or API, even if they never say "skill" or "workflow". Trigger on wording like "update / change / modify / fix / extend / tweak / adjust / patch the endpoint", "update the API", "change what GET /api/books returns", "make POST /api/reviews reject X", "add validation to the shelves route", "rename a field in the API response", "return 404 instead of 500 from /api/users/:id", or any request that names an HTTP verb plus a path from src/routes (/api/books, /api/users, /api/reviews, /api/shelves, /books/:id, /shelves, /reviews) together with a behavior change. Also use for "/update-endpoint <change>". Not for creating brand-new endpoints, schema-only changes, HTMX view-only tweaks, questions about what endpoints exist, or pure reviews of existing changes.
---

# update-endpoint

You are the orchestrator. The request is whatever the user typed after the skill name. If it does not name an endpoint and the intended behavior, ask before starting (CLAUDE.md: don't guess at vague requests).

The four agents ship in this plugin's `agents/` folder and all run on Sonnet: `researcher`, `implementer`, `test-writer`, `reviewer`. Launch each with the Agent tool and its `subagent_type`. When installed as a plugin they may be listed with the prefix `bookshelf-flow:` (for example `bookshelf-flow:researcher`). Use the name the Agent tool lists. They only know what you put in the prompt, so pass the request and the previous agent's output in full. Run them one at a time, because each depends on the one before it.

## 1. Research (then stop)

Launch `researcher` with the request. Ask it to return:

- `endpoint`, the chosen `layer` (route, model, db-wrapper, schema or view) and why, with the rejected layers
- an ordered file-by-file `plan`, the smallest diff that satisfies the request
- the sibling code whose pattern to follow, and what `tests/` already covers plus the closest test file to model on
- the non-happy paths the change must handle
- `observations` (adjacent problems left out of the plan), `risks`, `openQuestions`

**Then present the plan to the user and wait for approval. Do not start step 2 before they say so.** Lead with the layer and the file list, then the risks and open questions. If there are open questions, ask them first. If the user edits the plan, use their version.

## 2. Implement

Launch `implementer` with the request and the approved plan, verbatim. It returns files changed, a summary, any deviations from the plan, and the `npx tsc --noEmit` result.

If it reports a deviation that changes scope, or the plan turned out to be wrong, stop and tell the user instead of continuing.

## 3. Test

Launch `test-writer` with the request, the approved plan, and the implementer's report. It returns the test files, which existing test file it modeled them on, one line per test, and exact pass/fail counts for the new tests and the full suite.

If it reports failures caused by the implementer's code, do not send them back for a fix. Carry them to the report.

## 4. Review

Launch `reviewer` with the request, the plan, and both previous reports. It runs the `review-empirically` skill and reports without editing anything.

## 5. Report to the user

Give a short summary, then let the user decide. Do not fix findings, stage, or commit anything yourself.

- **Plan vs result:** layer chosen, files changed, and any deviations
- **Tests:** what was added, and pass/fail counts
- **Review findings:** the reviewer's findings in its own severity order, plus its "Not verified" section
- **Failures or loose ends:** failing tests, implementer deviations, plan open questions that were never answered
- **Pre-commit:** any staged `*.db*` files, per the reviewer. The commit decision is the user's.

## Known limits

- The tests are written after the implementation, so nothing proves a new test failed before the change. For a bug fix, say that plainly in the report.
- Reviewer findings come back to the user only. There is no automatic fix round.
- Subagents are stateless. If one fails or returns nothing, tell the user which step failed and what was already changed in the working tree.
