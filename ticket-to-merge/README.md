# ticket-to-merge

A Claude Code plugin that takes one ticket from its text to a reviewed, committed branch. Agents build it, agents review it, and numbers grade it.

Repo: https://github.com/Carcandyx/agent_bookshelf (plugin in `ticket-to-merge/`, ticket records in `docs/tickets/`).

## How to run it

Requirements: Node.js 24, `npm ci` done once, and on Windows `mkdir C:	mp` once (the existing tests write there). Run these from the repo root.

```
claude plugin validate ./ticket-to-merge     # must print "Validation passed"
claude --plugin-dir ./ticket-to-merge        # start Claude Code with the plugin loaded
```

Inside that session (after editing the plugin, run `/reload-plugins`):

| Command | What to type | What happens |
|---|---|---|
| Ship a ticket | `/ticket-to-merge:ship-ticket BOOK-101 <paste the ticket text or acceptance criteria>` | The ID is the first word; everything after it is the ticket. A path to a text file also works. The run asks for `/usage` numbers at the start (answer with the numbers, or `skip`), builds the briefing, tests and plan, shows the plan on a canvas page, and then waits for your approval. After the plan is approved it needs nothing else from you except the `/usage` pauses. |
| Review | `/ticket-to-merge:review-pr` | Reviews the current branch against `main` and prints findings as JSON. Options: `--base <ref>`, `--patch <file>`, `--briefing <path>`, `--tests <path>`. Asks no questions. |

The only decision the pipeline asks of a person is the plan review. Everything it decides in your place is written to `docs/tickets/<ID>/decisions.md`.

Specification and conventions:

- `CLAUDE.md` (repo root) holds the conventions, the three-layer rules and the constraints every agent follows. The guardrail hook enforces the constraints.
- The per-ticket specification is `docs/tickets/<ID>/briefing.md` (acceptance criteria, the interface, the decisions taken) with `tests.md` as its test list. A single repo-wide `SPEC.md` is not used, because the plugin has to work for tickets it has not seen.

## Evidence

| Item | Result |
|---|---|
| Plugin validates | `claude plugin validate ./ticket-to-merge` prints "Validation passed with warnings". The warnings are advice only: no author or icon in `plugin.json`, and no marketplace install line in this README. |
| Green test run | `docs/tickets/book-101/test-run.txt`: 4 files, 32 tests passed (14 existing, 18 new for the ticket), 0 failed. |
| Guardrail self-test | `node ticket-to-merge/hooks/bypass-test.js`: 64/64 cases behave as expected. |
| First real ticket | BOOK-101 (search books by title or author): steps 1 to 11 ran with one human decision (the plan review); the first review returned no findings. Records in `docs/tickets/book-101/`. |
| Review recall and precision | 100% recall (21/21) and 85.7% precision over 3 runs on seven planted bugs; 0 false alarms on the clean change. See the measurement section. |
| Cost report and lever | $4.94 for one ticket; see the cost report. |

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
| `evals/review/` | The review eval: patches with planted bugs, ground truth, method and results. |
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
| code-reviewer | sonnet | Precision matters more than depth here. Haiku matched it on the review eval (see the cost lever), but the default stays until a real ticket confirms it. |

These are starting points. The cost report below is where they are tested.

### Guardrails

`hooks/protect.js` runs before every Edit, Write, MultiEdit, NotebookEdit, Bash and Read call, including calls made by subagents, and exits 2 to block:

- Always: `bookshelf.db*` and any `.db`/`.sqlite` file, `seed.sql`, `schema.sql` and any other `.sql` file, anything under a `migrations` folder, `.env*` (except `.env.example`), `package.json`, `package-lock.json` and other lock files, the plugin's own hook files, and `.claude/settings*.json`. Package-manager commands that add, remove or update packages are blocked too. The block message tells the agent to STOP and tell the engineer that the work has to come through a migration.
- By agent: the test-writer writes only under `tests/` and never reads implementation records, plans or `src/services/`; the implementor never writes under `tests/`; the criteria agents, the reviewer and the git-bot never write files.
- By stage (`docs/tickets/.stage`, set by the orchestrator): `test` allows writes under `tests/` only, `implement` keeps `tests/` read-only, and `verify`, `review` and `ship` allow no source writes.
- While shipping: only explicit `git add <files>`, no force push, no push to `main` or `master`, no skipped hooks.

`hooks/stop-gate.js` refuses to let the session finish in the `ship` stage while `npm run test:run` fails.

Known limits: a command that builds a protected file name at run time (shell variables, base64) is not recognised, and a Bash command that names a protected file and can write is blocked even when it only reads it (use the Read tool). `node ticket-to-merge/hooks/bypass-test.js` runs 64 scripted cases (three bypass scenarios plus the actions that must keep working).

### What I would cut

- The plan-canvas review gate if there is no time: the implementor would plan in text and go ahead.
- The second gap-resolver round: stop after the first and let the criteria-agent's leftovers go to the log.
- Splitting the reviewer into specialists. One generalist is used until a real run shows it missing things.

## Review measurement: recall and precision

Seven bugs were planted in a copy of the real BOOK-101 change (SQL built from input, a rule in the controller, a new dependency, a skipped test, unescaped output, a schema change, a leftover `console.log`), and `/review-pr`'s reviewer was run three times on it, and three times on the clean change. Method, files and every miss are in [`evals/review/README.md`](evals/review/README.md).

| Case (3 runs each) | Recall | Precision |
|---|---|---|
| Planted bugs, reviewer on sonnet (as shipped) | 21/21 = 100% | 24 of 28 findings = 85.7% |
| Clean change, reviewer on sonnet | n/a | 0 findings in 3 runs (0 false alarms) |

Three of the four counted false positives are true: planting the SQL bug left a helper unused, and the reviewer said so. One is a real false alarm (an import rule cited on a file that does not break it). Read the result with the limits in mind: the planted bugs match the reviewer's own rule list, so they are the easy case, and the three runs share one ticket. A harder set (wrong status code, an off-by-one at the limit) is the next step.

## Cost report

Source: `docs/tickets/book-101/cost.md`, from `/usage` readings taken during the real BOOK-101 run. The `/usage` totals are cumulative, so each stage is the difference between two readings (the baseline $0.18 was before any agent ran and is subtracted).

| Stage | Cost | Cache hit | Models |
|---|---|---|---|
| Build (criteria, tests, plan, implementation, verify) | $4.50 | 97% (cumulative) | opus $2.99, sonnet $1.50, haiku $0.003 |
| Review | $0.44 | 97% (cumulative) | sonnet $0.44, haiku $0.005 |
| Fix loop | $0.00 | n/a | none ran: tests green at first verify, first review clean |
| **Total, one ticket** | **$4.94** | 97% | opus 61%, sonnet 39% |

Opus is used by two agents, the gap-resolver and the implementor. Per-agent costs are not shown by `/usage`, so the split between those two is not known. The cache hit is cumulative over the session at each reading.

### The one lever

**Reviewer on haiku instead of sonnet**, tested on the review eval above (same planted patch, 3 runs each):

| | Recall | Precision | Tokens per run |
|---|---|---|---|
| sonnet (shipped) | 21/21 | 85.7% | about 79k |
| haiku | 21/21 | 83.9% | about 93k |

Quality held on this eval, but the saving is small and unproven: the review is $0.44 of $4.94 (9%), and haiku read about 17% more tokens per run, so a dollar saving is not shown. The default stays on sonnet until a real ticket's `/usage` shows haiku cheaper at the same quality. **The lever with the most to gain is the implementor on sonnet**: opus is 61% of the ticket's cost. It has not been tested, because it needs a second ticket run with the model changed, then the tests and the review compared with BOOK-101.

## Known gaps

- Only one ticket (BOOK-101) has been run end to end, and only up to the first review: the push and the closing `/usage` were not taken, so the cost log has no "Final" reading.
- The review eval is a single set of seven easy bugs on one ticket (see above). The plugin was not loaded in the session that ran it, so the reviews ran through general-purpose agents given the `code-reviewer` instructions.
- The cost lever is a candidate with a quality check, not a measured dollar saving.
- There is no repo-wide `SPEC.md`: each ticket's `briefing.md` is its specification, so the plugin stays ticket-agnostic.
- The agents' `skills:` preloading and `SendMessage` continuation depend on the Claude Code version; the prompts include a fallback (paths in the prompt, and a fresh agent with the previous output).
- `claude plugin validate` passes with warnings (no author, no icon, no marketplace install line).
