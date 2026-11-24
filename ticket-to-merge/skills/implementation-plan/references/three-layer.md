# Three-layer rules for this repository

The repository today has controllers (`src/routes`) that call models (`src/models`) directly, and no service layer. New work follows the target layering below. Existing code is not refactored unless the ticket needs it.

## The layers

| Layer | Folder | Is | Imports from | Never does |
|---|---|---|---|---|
| Controller (presentation) | `src/routes/*.ts` | Reads the request, calls one service function, turns the result or error into a response (status, JSON, or `res.render`). | `express`, `../services/*.js` | Run SQL. Import from `src/models` or `src/db`. Hold business rules (trim, limits, defaults, filtering). |
| Service (business logic) | `src/services/*.ts` | The rules of the feature: validation, trimming, limits, what "empty" means, combining repository calls. Plain functions with plain inputs and outputs. | `../models/*.js`, other services | Touch `Request`/`Response`. Write SQL. Know about HTTP status codes or views. |
| Repository (data) | `src/models/*.ts` | The queries and the mapping of rows to typed objects, through the `all`, `get`, `run` helpers in `src/db/index.ts`. | `../db/index.js` | Hold business rules. Import `express`. Build SQL from user input by string concatenation. |

Import direction is one way: `routes -> services -> models -> db`. A route never imports a model. A model never imports a service. A service never imports a route.

## Details

### Controller

- One handler per entry point. It extracts values from `req` (`req.query`, `req.params`, `req.body`) and passes plain values to the service.
- It decides the response: success status and shape, and a mapping from service errors to status codes. Use the interface from the briefing exactly.
- It stays short. If a handler has an `if` about the content of the input, that `if` belongs in the service.

### Service

- Named by the thing it handles: `src/services/bookService.ts`, `src/services/reviewService.ts`. Exports functions, as the models do (the repository uses function modules, not classes).
- Validation errors are thrown as a typed error from `src/services/errors.ts`:

  ```ts
  export class ValidationError extends Error {
    constructor(message: string) { super(message); this.name = 'ValidationError'; }
  }
  ```

  The controller catches `ValidationError` and maps it to the response the briefing defines. Any other error is passed on to Express's error handler.
- Inputs and outputs are typed. A service takes already-extracted values (`query: string | undefined`), not `req`.

### Repository

- One function per query. SQL is a constant string with `?` placeholders and the values go in the array: `all('SELECT ... WHERE title LIKE ?', [pattern])`.
- Building a LIKE pattern (`'%' + text + '%'`) is a value, not SQL, so it is allowed. Putting text inside the SQL string is not, even with template literals.
- Returns typed rows (`Book[]`) or `undefined`. No filtering or rules beyond what the query itself does.

## Examples of violations

| Code | Why it is wrong | Where it belongs |
|---|---|---|
| `router.post('/reviews', (req, res) => { const text = String(req.body.text).trim(); if (text.length > 500) ... })` | Business rule (trim, limit) in the controller | Service |
| `import * as Book from '../models/book.js'` inside `src/routes/*.ts` for new work | Controller skips the service layer | Import the service instead |
| `all(\`SELECT * FROM books WHERE title LIKE '%${q}%'\`)` | String-built SQL | Repository with `?` and a value array |
| `res.status(400)` inside `src/services/*.ts` | HTTP detail in the service | Throw `ValidationError`, map it in the controller |
| A service function that takes `req` | Service tied to Express | Pass extracted values |

## Tests and layers

Tests for new work call the entry point over HTTP (see the test-authoring skill). They do not import services or repositories. That keeps the tests valid when the inside of the work changes.

## When existing code does not follow this

Say so in `implementation.md` under Notes ("`src/routes/books.ts` already calls models directly in other handlers; left as is"). Do not refactor it.
