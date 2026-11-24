# Project standards

Each rule has an id. Cite it in the finding. Rules apply to the code the diff adds or changes.

## Architecture (A)

The target layering for new work is `src/routes` (controllers) -> `src/services` (business logic) -> `src/models` (repository) -> `src/db`. Existing handlers that call models directly are not violations unless the diff changes or adds them.

| Id | Rule | Violation looks like |
|---|---|---|
| A-1 | Controllers only deal with the request and the response: read input, call a service, choose status and shape. | A route handler that trims, validates length, filters or builds results itself. |
| A-2 | Business rules live in services: validation, trimming, limits, what an empty input means. | Those rules in a route or in a model. |
| A-3 | Repositories contain only data access: one query per function, typed rows, no rules. | A model function that rejects input, applies limits or shapes a response. |
| A-4 | Imports go one way: routes -> services -> models -> db. A route does not import a model or `src/db` in new code. | `import * as Book from '../models/book.js'` added to a route for new work. |
| A-5 | A service never touches `req`, `res`, status codes or views. It throws a typed error (`ValidationError`) and the controller maps it. | `res.status(400)` or a `Request` parameter in a service. |
| A-6 | No layer is skipped, and no logic is duplicated across layers. | The same length check in a route and in a service. |

## Security (S)

| Id | Rule | Violation looks like |
|---|---|---|
| S-1 | SQL is parameterised: constant SQL text with `?` placeholders, values in the array. No SQL built from input, including template literals and concatenation. Building a LIKE pattern as a value (`'%' + text + '%'`) is fine. | `` `... LIKE '%${q}%'` ``, `'... WHERE id = ' + id`. |
| S-2 | Input from the request is validated or normalised in the service before it is used. | A query parameter passed straight to the repository with no check. |
| S-3 | No secrets, tokens or credentials in code, tests or docs. | A key or password string in a file. |
| S-4 | No `eval`, `new Function`, shell execution, or dynamic file paths built from input. | `child_process.exec` with request data. |
| S-5 | Output that includes user text is escaped by the view engine, not concatenated into HTML by hand. | `res.send('<p>' + q + '</p>')`. |

## Constraints (C)

| Id | Rule | Violation looks like |
|---|---|---|
| C-1 | No schema change and no migration: `src/db/schema.sql`, any `.sql` file, any `migrations` folder, `CREATE/ALTER/DROP` in code. | An added column or table, a new `.sql` file. |
| C-2 | No new dependencies: `package.json` and `package-lock.json` untouched. | A new entry in `dependencies` or `devDependencies`. |
| C-3 | Protected files untouched: `bookshelf.db*`, `src/db/seed.sql`, `.env*`. | Any change to them in the diff, including committing the `-shm` or `-wal` files. |
| C-4 | The interface matches the briefing exactly (when a briefing is provided): path, method, input name, response and error shapes. | A different parameter name, an extra field, a status code the briefing does not give. |

## Tests (T)

| Id | Rule | Violation looks like |
|---|---|---|
| T-1 | Each acceptance criterion (and each approved test, when `tests.md` is provided) has a test. | A criterion with no test. |
| T-2 | Tests check behaviour at the entry point, not how the code is built. | A test that imports a service or repository for new work, or asserts which function was called. |
| T-3 | Tests are not weakened to pass: no `.skip`, `.only`, removed assertions, loosened expectations without cause. | An `it.skip`, an assertion deleted in the same diff that changes the code under test. |
| T-4 | Tests use the temporary database pattern and do not touch the real database files. | A test opening `bookshelf.db`. |

## Quality (Q)

| Id | Rule | Violation looks like |
|---|---|---|
| Q-1 | Follows the conventions in `CLAUDE.md`: ES modules with `.js` import suffixes, typed signatures, function modules. | A missing `.js` suffix, `any` where a type exists, a class where the repo uses functions. |
| Q-2 | No debug output or dead code left behind. | `console.log` added, commented-out code, unused exports. |
| Q-3 | Errors are not swallowed. | An empty `catch`, or a catch that returns success. |
| Q-4 | The change stays within the ticket: no unrelated edits. | A refactor of untouched handlers, formatting-only changes in other files. |

## How the rules combine

- One mistake can break two rules (SQL in a controller breaks A-1 and S-1). Report it once, under the rule that is most serious, and mention the other in the issue text.
- A-rules judge structure. S, C and T judge safety and promises. Q rules are the smallest; report them only when they are plainly true.
