---
name: implementation-plan
description: Plan and then implement a ticket in a strict 3-layer architecture (controllers, services, repository/models), showing the plan to the user as a plan-canvas artifact before writing any code, then record what was built. Used by the implementor. Use when a completed briefing, an approved test list and failing tests exist.
user-invocable: false
---

# Implementation plan

Two phases with the user's plan review in between: it is the only human step in the pipeline. Never skip the review, and never write code in phase 1.

Files in this skill (next to this file):

| File | What |
|---|---|
| `references/three-layer.md` | The layer rules for this repository, import direction, error handling, naming, and what each layer must never do. Read it before planning. |
| `references/blockers.md` | When to stop instead of building, and the exact wording of the stop message. Read it before planning. |
| `templates/implementation.md` | The record you write when you finish. |
| `../plan-canvas/SKILL.md` | The artifact you publish for the plan review. Follow it. |

## Inputs you are given

- `docs/tickets/<ID>/briefing.md` (complete) and `docs/tickets/<ID>/tests.md` (approved).
- The test files already in `tests/` (written first, currently failing). They are your target. You may read them. You may not change them.
- The repository and its `CLAUDE.md`.

## Phase 1: plan (no code)

1. **Read** the briefing, the test list, the failing tests, `CLAUDE.md`, and the code the work will touch. Look at how existing routes and models are written (imports with `.js`, function modules, `all/get/run` helpers) so the new code looks like it belongs.
2. **Check for blockers** (`references/blockers.md`). If the ticket cannot be done without a schema change, a migration, a new dependency or a protected file, do not plan around it. Answer only with the stop message from the blockers reference.
3. **Lay out the solution by layer**: which controller handles the entry point, which service holds the business rules, which repository function runs the query. List every file to create (U) or modify (M), and the functions inside each. Apply the layer rules strictly, including for code that already exists in a different shape: new work follows the rules, existing code is not refactored unless the ticket needs it.
4. **Write the plan with plan-canvas**: lanes are `Route (controller)`, `Service`, `Repository (model)`, `Database`; the entry point is on the left. Save the plan JSON as `docs/tickets/<ID>/plan.json` (the name starts with `plan` on purpose, see the rules below), build it, and publish it with the Artifact tool exactly as the plan-canvas skill says. Mention in the context paragraph that the failing tests already exist.
5. **Return** to the orchestrator: the artifact link, a five-line summary of the plan, and, as short bullets, the choices in the plan that the user should look at first (they review it next). Then stop and wait. The orchestrator will relay the user's review (the prompt the canvas generates, notes, or "approved").

## Applying the review

When the orchestrator sends the canvas prompt or notes, follow plan-canvas's section "When the user pastes the generated prompt back": update the plan, rebuild, republish to the same URL, say what changed. Do not implement until the orchestrator says the plan is approved.

## Phase 2: implement (after approval)

1. Build bottom-up so each layer can be tested through the next: repository, then service, then controller, then any wiring the entry point needs.
2. Keep strictly to the approved plan. If you find the plan cannot work, stop and tell the orchestrator what you found. Do not quietly change the design.
3. Never edit anything under `tests/`. If a test looks wrong, return `TEST-DISPUTE: <test id> <one-sentence reason>` instead of touching it.
4. Run `npm run test:run` as you go. Stop when the ticket's tests pass and the rest of the suite still passes. If three runs in a row make no progress, stop and report what is failing and what you tried.
5. Write `docs/tickets/<ID>/implementation.md` from `templates/implementation.md`.
6. **Return** to the orchestrator: a short summary, the entry point (HTTP method and path, and the controller function name), the list of files changed, and the last test result.

## Fix iterations

When the orchestrator sends you failing test output, fix the code, not the tests, re-run, update `implementation.md` (add a "Fix iteration N" line under Notes), and return the same summary. Two iterations at most are allowed by the pipeline.

## Rules

- No schema changes, migrations, new dependencies, or edits to `bookshelf.db*`, seed data, `.env`, `package.json`, or `package-lock.json`. The guardrail hook enforces this, and so do you.
- No SQL outside the repository layer. No business rules outside the service layer. No `req`/`res` outside the controller layer.
- The interface must match the briefing exactly. Do not add fields or routes it does not list.
- Plain code in the style of the repository. No comments that restate the code.
- The hook blocks the test-writer from reading files named `implementation*` or `plan*` in a ticket folder. Keep those names.
