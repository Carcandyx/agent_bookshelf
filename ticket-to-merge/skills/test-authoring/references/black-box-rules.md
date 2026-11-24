# Black-box rules

## What you may read

| Allowed | Why |
|---|---|
| `docs/tickets/<ID>/tests.md` | Your contract. |
| `docs/tickets/<ID>/briefing.md`, Interface section (and the criteria, for context) | The entry point and response shapes. |
| `src/server.ts` | To see how `app` is exported and mounted. |
| Existing files under `tests/` | To copy the setup (temporary database, `request(app)`). |
| `package.json`, `vitest.config.ts` | To know the test command and which files are picked up. |

## What you may not read

| Forbidden | Why |
|---|---|
| `docs/tickets/<ID>/implementation.md`, `plan.json`, `plan.html` | They describe what was built or will be built. |
| `src/services/**` | New work lives there. |
| Anything you would only look at to learn how the work is done | Tests must not follow the code. |

The guardrail blocks the first two rows when you try. If a read is blocked, do not look for another way. Work from the briefing and the test list.

## How to call the work

Through HTTP, using the entry point in the briefing:

```ts
import request from 'supertest';
import app from '../../src/server.js';

const res = await request(app).get('/books/1').query({ page: '2' });
```

The existing route tests (`tests/routes/api.test.ts`) show the setup: `initDb` with a temporary path in `beforeEach`, `closeDb` and delete the file in `afterEach`. Copy that.

If the briefing's interface is not clear enough to write a call, stop and tell the orchestrator which interface item is missing. Do not guess.

## Naming and layout

- File: `tests/routes/<feature>.test.ts` (use the ticket's feature name in lowercase, one file per ticket unless the list is large).
- `describe('<TICKET-ID> <title>', ...)` with one `it` per test id.
- Title: `[TC-05] <what the test is about, from tests.md>`.
- Keep test data inside the test. Use books that exist in the seed data when you need a known book (`The Pragmatic Programmer` is book 1 in the seed).

## Reports

### WRITE report

```
MODE: WRITE
Files: <paths>
| Test | Status | Failure message (first line) |
|---|---|---|
| TC-01 | red-expected | expected 200, got 404 |
| TC-02 | red-expected | ... |
Summary: <n> red-expected, <n> red-broken, <n> green-unexpected
Interface items I could not use: <none or list>
```

Do not hand back a report with any `red-broken` row. Fix those first.

### VERIFY report

```
MODE: VERIFY
Command: npm run test:run
| Test | Result |
|---|---|
| TC-01 | pass |
| TC-09 | FAIL: expected 400, got 200 |
Other suites: <n> passed, <n> failed
Overall: PASS | FAIL
TEST-DISPUTE: <none, or id and reason>
Output (last 60 lines):
<paste>
```
