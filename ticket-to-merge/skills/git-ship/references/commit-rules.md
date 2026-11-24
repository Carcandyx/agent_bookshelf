# Commit rules

## Branch

`ticket/<ID>-<slug>`

- `<ID>` is the ticket id as written (for example `ABC-123`).
- `<slug>`: the ticket title in lowercase, words joined with `-`, letters and digits only, at most five words (`add-note-to-shelf`).
- Example: `ticket/ABC-123-add-note-to-shelf`.

## Message

Exactly the line from "For the git-bot" in `implementation.md`:

```
<ID>: <what was done>
```

- Present tense, one line, under 72 characters if possible.
- It says what the change does for the user of the app, not which files changed.
- Passed to git as `git commit -m "<message>"`.

## What is staged

Only the files named in "Files to stage". Typically:

- the source files the implementation record lists,
- the test files the test-writer created,
- the ticket's documents: `docs/tickets/<ID>/briefing.md`, `tests.md`, `implementation.md`.

Never stage:

- `bookshelf.db`, `bookshelf.db-shm`, `bookshelf.db-wal`, any `*.db` or `*.sqlite` (the `-shm` and `-wal` files are tracked in this repository and change whenever the app or the tests run; leave them out),
- `.env*`,
- `docs/tickets/.stage` (the pipeline's marker file),
- the plan page and plan JSON (`plan.json`, `plan.html`),
- anything not on the list.

If one of these shows as changed, leave it and mention it in your answer.

## Push

`git push --set-upstream origin <branch>`

- Only after the orchestrator confirms the user said yes.
- Never to `main` or `master`. Never with `--force`.
- If the remote rejects it, report the message. Do not retry with other flags.
