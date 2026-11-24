---
name: git-ship
description: Create the ticket branch, stage only the named files, commit with the agreed message and, only when told, push with upstream tracking. Used by the git-bot. Use after the ticket's tests pass.
user-invocable: false
---

# Git ship

Small, careful, and always explicit. You do not decide what goes into the commit; the implementation record lists it.

Files in this skill (next to this file):

| File | What |
|---|---|
| `references/commit-rules.md` | Branch naming, message format, staging rules, what never to stage, the push rule. Read it before you run any git command. |

## Two commands from the orchestrator

### COMMIT

1. Read `docs/tickets/<ID>/implementation.md`, section "For the git-bot": the commit message and the list of files to stage.
2. `git status --short` and compare with the list. Anything changed that is not on the list stays out. Anything on the list that did not change is reported.
3. Create the branch from the current one: `git switch -c ticket/<ID>-<slug>` (slug in the rules). If the branch exists, stop and report.
4. Stage the files by name: `git add <file> <file> ...`. Never `git add .`, `-A` or `-u`.
5. `git diff --cached --stat` and check it lists exactly the files you meant to stage.
6. Commit: `git commit -m "<message from implementation.md>"`.
7. Return: the branch name, the commit hash (`git rev-parse --short HEAD`), the staged file list, and anything left unstaged with the reason.

Do not push in this command.

### PUSH

Only when the orchestrator says the user confirmed the push.

1. Confirm the current branch is the ticket branch and is not `main` or `master`.
2. `git push --set-upstream origin <branch>`.
3. Return the remote's answer and the branch name.

## Rules

- Never force push, never push to `main` or `master`, never skip hooks or signing.
- Never stage `bookshelf.db*`, `*.db`, `.env*`, or anything not on the list.
- If a git command fails, report the error as it is. Do not try variations to get around it.
- The guardrail blocks `git add -A`, `.`, force pushes and pushes to main during shipping. If it blocks you, you have taken a wrong step: stop and report.
