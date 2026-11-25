---
paths:
  - "tests/**"
  - "**/*.md"
  - "src/db/seed.sql"
---

# Mock data must be grounded in implemented code

Mock data in tests, fixtures, seeds and `.md` files (journals, examples, docs) must come from what the repo actually does today, never from invented scenarios.

## Do

- Base mock data on real model fields and row interfaces in `src/models/*`, `schema.sql` columns and constraints, `seed.sql` rows, real routes and response shapes, and existing validation rules and error messages.
- Read the code the mock data depends on before writing it.
- When the source isn't obvious, name the file or symbol each piece is based on.
- If a scenario needs behavior that doesn't exist yet, say so and ask instead of inventing it.

## Don't

- Invent fields, endpoints, books, users, error messages, bugs or "realistic" stories that the code can't produce.
- Describe a feature, failure or workflow in a test or `.md` file unless you can point to the code that implements it. Plausible-sounding is not a source.
