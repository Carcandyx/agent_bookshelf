---
name: test-authoring
description: Write Vitest tests from an approved test list and the briefing's interface, without looking at the implementation, confirm they fail for the right reason, and later run the full suite and report pass or fail. Used by the test-writer. Use when an approved tests.md exists.
user-invocable: false
---

# Test authoring

The tests prove what was agreed, not what happened to be built. That is why you write them before the implementation exists, from the approved test list and the briefing's interface, and why you never look at the implementation.

Files in this skill (next to this file):

| File | What |
|---|---|
| `references/black-box-rules.md` | What you may read, what you may not, how to call the entry point, naming, the report formats. Read it first. |
| `templates/test-file.md` | A test file in this repository's style, ready to adapt. |

## Two modes

The orchestrator tells you which one. You are kept alive between them, so in verify mode you still remember what you wrote.

### Mode WRITE

1. Read `docs/tickets/<ID>/tests.md` and the **Interface** section of `docs/tickets/<ID>/briefing.md`. You may read `src/server.ts` to see how the app is exported, and the existing tests under `tests/` to copy their setup. Nothing else in `src/` is needed.
2. Write one `it(...)` per row of the test list. The title starts with the test id: `it('[TC-05] returns every book when the query is empty', ...)`. A row may need more than one assertion, but never more than one scenario.
3. Call the work only through its entry point over HTTP (supertest against the exported `app`), as the briefing's interface describes it. Never import a service, a model or a repository.
4. Put the files under `tests/` only (for example `tests/routes/<feature>.test.ts`). The guardrail blocks writes anywhere else.
5. Run only your new files: `npx vitest run <your files>`. They are expected to fail now, because the work does not exist yet. For each test decide:
   - `red-expected`: it fails on its assertion because the behaviour is missing (404, stub text, wrong body).
   - `red-broken`: it fails for another reason (syntax error, import error, wrong setup, timeout). Fix your test and run again until none are `red-broken`.
   - `green-unexpected`: it already passes. Report it. It either proves nothing or the behaviour already existed.
6. Return the WRITE report (format in the references).

### Mode VERIFY

1. Run the full suite: `npm run test:run`. Do not change any file. The implementation now exists, but you still do not read it: you only read the test output.
2. Return the VERIFY report (format in the references) with the result of every test id and the tail of the output.
3. If a failure looks like a mistake in a test (not in the work), report it as `TEST-DISPUTE: <id> <why>` and do not edit the test to make it pass. The orchestrator decides.

## Rules

- You never read `docs/tickets/*/implementation*`, `docs/tickets/*/plan*` or anything under `src/services/`. The guardrail blocks these reads.
- You never edit a test to make it pass. A test changes only when the approved test list changes.
- No new dependencies. Use Vitest and supertest, which are already installed.
- No real database files. Use the same temporary-database pattern as the existing route tests.
