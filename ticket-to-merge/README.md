# ticket-to-merge

A Claude Code plugin that takes one ticket from its text to a reviewed, committed branch. Agents build it, agents review it, and numbers grade it.

- `/ticket-to-merge:ship-ticket <ID> <pasted ticket text or criteria>` runs the pipeline with you in the loop. A path to a text file also works in place of the pasted text.
- `/ticket-to-merge:review-pr [--base <ref>] [--patch <file>]` reviews a branch or patch and prints findings as JSON. No questions asked.

```
claude plugin validate ./ticket-to-merge
claude --plugin-dir ./ticket-to-merge
```

## What the pipeline does

```
ticket text (pasted into the command)
  1 you                 run /usage and paste it (the run waits for you), nothing else to answer
  2 criteria-agent      (medium effort) maps the ticket, leaves numbered blanks for everything missing
  3 gap-resolver        (high effort) decides every blank from the ticket's words, the repo and CLAUDE.md,
                        and logs what it decided, why, how sure it is, and what changes if it is wrong
  4 criteria-tester     (medium effort) designs a test list that covers 100% of the criteria; nobody reviews it
  5 test-writer         writes the tests first, from the list and the interface only (red)
  6 implementor         plans in 3 layers and publishes a plan-canvas page
  7 YOU                 review the plan on the canvas: the one human decision in the pipeline
  8 implementor         implements the approved plan and logs its judgement calls
  9 test-writer         runs the full suite (never sees the implementation); fix loop, two iterations at most
 10 git-bot             branch, commit (local)
 11 review-pr           code-reviewer audits the diff (read-only); high and medium findings are fixed, two rounds at most
 12 git-bot             push (automatic once tests are green and the review is clean)
 13 you                 final /usage; read decisions.md
```

Fully automatic except the plan review. The pauses for `/usage` are only there so the numbers are taken at the right moment; `skip` is an accepted answer.

Documents for each ticket land in `docs/tickets/<ID>/`: `source.md`, `briefing.md`, `tests.md` (and `tests.json`), `plan.json` and `plan.html`, `implementation.md`, `test-run.txt`, `cost.md` and `decisions.md`.

`decisions.md` is the audit trail. Since no person answers the briefing's gaps or reviews the tests, every choice an agent made in their place is listed with its reasoning, its evidence, its confidence (high, medium, low) and what would change if it were wrong. The run ends by listing the `low` ones.

## What is in the plugin

| Folder | Contents |
|---|---|
| `skills/ship-ticket` | The orchestrator: order, hand-offs, gates, agent prompts, cost log template. |
| `skills/review-pr` | The standalone review entry point and its output format. |
| `skills/ticket-briefing` | Briefing template, mapping rules, an example. Used by the criteria-agent. |
| `skills/gap-resolution` | How the gap-resolver decides: order of evidence, confidence levels, blockers, and the decision log template. |
| `skills/test-case-design` | Coverage rules, the checker (`validate.mjs`) that makes sure every criterion is covered, the test list template. |
| `skills/implementation-plan` | The 3-layer rules for this repo, blocker rules, implementation record template. |
| `skills/test-authoring` | Black-box rules and test template for the test-writer. |
| `skills/git-ship` | Branch, message, staging and push rules for the git-bot. |
| `skills/code-review` | The project standards, your own checks (`references/user-checks.md`), severity guide. |
| `skills/plan-canvas` | The plan review page used by the implementor (a copy of the repo's `.claude/skills/plan-canvas`). |
| `agents/` | criteria-agent, gap-resolver, criteria-tester, implementor, test-writer, git-bot, code-reviewer. |
| `hooks/` | `hooks.json`, `protect.js` (guardrail), `stop-gate.js`, `stage.js`, `bypass-test.js`. |

## Design

### Why this split

The pipeline is split by stage role, because each stage needs different information and different permissions:

- The criteria-agent, the gap-resolver and the criteria-tester only read and return text. They cannot edit anything, so a mapping or a test list cannot change the repository by accident.
- The test-writer works before the implementation exists and never receives the implementation record. The guardrail also blocks those reads. Tests that follow the agreed list, not the code, are the point of tests-first.
- The implementor is the only agent that writes source, and it cannot touch `tests/`.
- The reviewer has `Read, Grep, Glob` only. Read-only comes from the tool list, because plugin agents ignore `hooks` and `permissionMode` in their own files.
- Nothing runs in parallel: every stage needs the output of the one before, so there are no two agents on the same file and no worktree isolation is needed. The review step can run several read-only reviewers on a large diff.

Subagents cannot ask the user anything (their `AskUserQuestion` is removed) and run to completion. That fits a flow with no human in it: where a person would have answered a question, an agent decides and writes the decision down. The orchestrator continues the same agent with `SendMessage` for corrections, so agents keep their context. The one person-facing moment is the plan canvas, which the orchestrator relays.

### The trade-off of the automatic flow

An agent can decide a gap wrongly, and the pipeline goes on with it. The mitigations: decisions follow a fixed order of evidence (the ticket, the repository, `CLAUDE.md`, then the narrowest reading); each carries a confidence and an "if wrong" note; the plan review shows the user the shape of the result before any code exists; and `decisions.md` puts the shaky choices up front at the end of the run.

### Models

| Agent | Model | Why |
|---|---|---|
| criteria-agent | sonnet, medium effort | Reading and structuring; no deep reasoning needed. |
| gap-resolver | opus, high effort | Its choices drive everything after it and nobody checks them live, so it gets the strongest reasoning. |
| criteria-tester | sonnet, medium effort | Derives tests from a finished briefing; a checker enforces coverage. |
| implementor | opus, effort high | The only agent that designs a solution. |
| test-writer | sonnet | Writes from a list. |
| git-bot | haiku | Runs a fixed git recipe. |
| code-reviewer | sonnet | Precision matters more than depth here; changing this is the obvious cost lever, to be measured once a real run exists. |

These are starting points. The cost report below is where they are tested.

### Guardrails

`hooks/protect.js` runs before every Edit, Write, MultiEdit, NotebookEdit, Bash and Read call, including calls made by subagents, and exits 2 to block:

- Always: `bookshelf.db*` and any `.db`/`.sqlite` file, `seed.sql`, `schema.sql` and any other `.sql` file, anything under a `migrations` folder, `.env*` (except `.env.example`), `package.json`, `package-lock.json` and other lock files, the plugin's own hook files, and `.claude/settings*.json`. Package-manager commands that add, remove or update packages are blocked too. The block message tells the agent to STOP and tell the engineer that the work has to come through a migration.
- By agent: the test-writer writes only under `tests/` and never reads implementation records, plans or `src/services/`; the implementor never writes under `tests/`; the criteria agents, the reviewer and the git-bot never write files.
- By stage (`docs/tickets/.stage`, set by the orchestrator): `test` allows writes under `tests/` only, `implement` keeps `tests/` read-only, and `verify`, `review` and `ship` allow no source writes.
- While shipping: only explicit `git add <files>`, no force push, no push to `main` or `master`, no skipped hooks.

`hooks/stop-gate.js` refuses to let the session finish in the `ship` stage while `npm run test:run` fails.

Known limits: a command that builds a protected file name at run time (shell variables, base64) is not recognised, and a Bash command that names a protected file and can write is blocked even when it only reads it (use the Read tool). `node ticket-to-merge/hooks/bypass-test.js` runs 59 scripted cases (three bypass scenarios plus the actions that must keep working).

### What I would cut

- The plan-canvas review gate if there is no time: the implementor would plan in text and go ahead.
- The second gap-resolver round: stop after the first and let the criteria-agent's leftovers go to the log.
- Splitting the reviewer into specialists. One generalist is used until a real run shows it missing things.

## Cost report

The pipeline asks you to run `/usage` at checkpoints (a plugin cannot run it for you) and records the numbers in `docs/tickets/<ID>/cost.md`. The table and the one lever are filled there; the filled copy goes into this README when a real ticket has been run.

| Stage | Cost | Cache hit | Models |
|---|---|---|---|
| Build | not measured yet | | |
| Review | not measured yet | | sonnet (code-reviewer) |
| Fix loop | not measured yet | | |
| Total, one ticket | not measured yet | | |

## Known gaps

- `/ship-ticket` has not been run end to end yet. There is no ticket-specific content in the plugin: each ticket's briefing, tests and plan are created under `docs/tickets/<ID>/` from the text passed to the command.
- There are no evals yet. They will be designed after the first real run, from what that run shows.
- The agents' `skills:` preloading and `SendMessage` continuation depend on the Claude Code version; the prompts include a fallback (paths in the prompt, and a fresh agent with the previous output).
- `claude plugin validate` passes with warnings for a missing author and icon.
