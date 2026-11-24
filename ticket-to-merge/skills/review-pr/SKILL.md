---
name: review-pr
description: Review a branch, pull request or patch with the read-only code-reviewer and report real, evidence-backed findings as JSON. Takes no questions and works on any branch. Use when asked to review a PR or branch, or as the review step of ship-ticket.
argument-hint: "[--base <ref>] [--patch <file>] [--briefing <path>] [--tests <path>]"
---

# Review a PR

One reviewer, one list of findings, no questions asked. It runs the same way for a branch you have never seen as for your own work, because it only needs a diff.

Skills folder (absolute path, for the agent): `${CLAUDE_SKILL_DIR}/..`

Files in this skill (next to this file):

| File | What |
|---|---|
| `references/output.md` | The exact output format, the evidence check, and the de-duplication rule. Read it before you print results. |
| `examples/review-output.md` | A complete example of what you print. |

## Arguments

Arguments given: `$ARGUMENTS`

| Argument | Meaning | Default |
|---|---|---|
| `--base <ref>` | The branch or commit to compare against. | `main`, or `master` if there is no `main` |
| `--patch <file>` | Review a patch file instead of the git diff. | none |
| `--briefing <path>` | The ticket briefing, so the reviewer can check the criteria and the interface (C-4). | `docs/tickets/<ID>/briefing.md` when the current branch is named `ticket/<ID>-...` and the file exists; otherwise none |
| `--tests <path>` | The approved test list, so the reviewer can check T-1. | `docs/tickets/<ID>/tests.md` under the same rule; otherwise none |

Never ask the user a question. If something is missing, review what you have and say what you could not check.

## Steps

1. **Find the briefing.** If `--briefing` was not given, take the ticket id from the current branch name (`ticket/<ID>-...`) and use `docs/tickets/<ID>/briefing.md` if it exists (it holds the acceptance criteria and the interface). Do the same for `--tests` and `tests.md`. Never use a briefing from another ticket. With `--patch` there is no branch, so use only what was passed. Pass both paths to the reviewer in step 5. If neither exists, say so in the summary.
2. **Get the diff.**
   - With `--patch`: read the file.
   - Otherwise: `git merge-base <base> HEAD` to get the fork point, then `git diff <fork-point> HEAD` for the committed changes. If `git status --short` shows uncommitted changes, add `git diff HEAD` and note in the summary that uncommitted changes were included.
   - If the diff is empty, print `No changes to review.` and an empty findings list. Stop.
3. **List the changed files** from the diff (`git diff --name-only ...`, or the `+++` lines of a patch).
4. **Skip what is not code under review**: lock files and generated files may be left out of the diff you pass, but say so.
5. **Call the reviewer.** Use the Agent tool with `subagent_type: "ticket-to-merge:code-reviewer"`. In the prompt put: the full diff, the changed file list, the absolute skills folder above, and the paths of the briefing and test list if given. If the diff is longer than about 1500 lines, split it by top-level folder (for example `src/routes`, `src/services`, `src/models`, `tests`), run one reviewer per part in parallel (reviewers only read, so they cannot conflict), and merge the lists.
6. **Check what comes back** with `references/output.md`: keep only findings that have all fields, whose file is in the diff, and whose evidence text can be found in the diff or the file. Drop and count the rest. Merge duplicates.
7. **Print** the result as the example shows: a short summary, a table of findings, and a final fenced `json` block holding the array of findings. The JSON block must be the last thing you print and must be valid JSON, because other tools read it.

## Rules

- You do not edit files, run tests or fix anything. Review only.
- You do not add findings of your own. If the reviewer found nothing, the list is empty.
- You do not soften or reword the reviewer's findings, except to remove duplicates.
- State what the review did not cover (briefing not provided, large diff split, uncommitted changes included).
