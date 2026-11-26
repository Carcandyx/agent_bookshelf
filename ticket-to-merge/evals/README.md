# Evals for ticket-to-merge

24 cases for the 7 agents of the plugin, in the same layout as `plugins/bookshelf-flow/evals/`: one folder per case with `case.yaml`, `prompt.md`, `fixture.sh` and `graders/*.md`. Run them with the same runner: `ablation: with-without`, 3 runs per arm, haiku as judge. `review/` is the older planted-bug eval and is not part of these cases.

Status: authored and not yet piloted. No case has been run through the runner. Pilot each case with 1 run and read the trace before spending on 3 runs (see "Before the full run").

## Run it

- Run the runner under Git Bash: `fixture.sh` needs bash, `git archive` and GNU `tar`.
- `C:\tmp` must exist on Windows. The repo's tests write to `/tmp/...`, and cases 02, 10, 13, 14, 17, 18 and 21 run Vitest.
- Cases with `--node-modules` link or copy the root `node_modules` into the workspace. Run `npm ci` in the repo first.
- Cases 02, 10, 11 to 14, 17 to 21 list `Bash` in `allowed_tools`, and the runner withholds it unless you grant it: pass `--allow-tools Bash`. Without it, the `tool_used` Bash graders cannot pass.
- Cost: the gap-resolver and implementor run on opus (cases 02, 04 to 07, 11 to 14, 21). Use `-j 1` or `-j 2`.

## Fixtures

`_shared/fixture.sh` builds the workspace from frozen commits, so changes to the repo never change an eval input.

| Frozen input | What |
|---|---|
| `560d08d` | The commit before BOOK-101: `src/`, `tests/`, `CLAUDE.md`, `vitest.config.ts`. `GET /books/search` is still a stub. |
| `e256297` | The real BOOK-101 run: its `docs/tickets/book-101/*` files, its test file and its source change. |

Options: `--docs=` (BOOK-101 documents), `--file=SRC:DEST` (hand-written inputs from `_shared/inputs/`), `--tests` (the BOOK-101 test file, red against the stub), `--impl` (the finished work as uncommitted changes), `--stage=` (writes `docs/tickets/.stage` after the commit), `--tracked-db`, `--remote`, `--node-modules`, `--review-patch=`. Positional arguments are patches from `_shared/` applied to the working tree.

Hand-written inputs (`_shared/inputs/`) are ticket texts and briefings written in the shape of the real BOOK-101 ones. Every name in them exists in the `560d08d` code (`POST /api/shelves`, `UNIQUE(user_id, name)`, the `books` table without a page-count column, the 404 `{ error: 'Shelf not found' }` shelf routes, a `package.json` with no PDF library).

Patches: `13-test-wrong-limit.patch` (TC-12 sends 101 characters and expects 200), `23-reviewer-subtle-bugs.patch` (BOOK-101 with an off-by-one at the limit and a 422), `24-comment-typo.patch`.

## Agent prompts

The prompts copy `skills/ship-ticket/references/agent-prompts.md` and name the agent (`ticket-to-merge:<agent>`), like the orchestrator does. One deliberate change: the `Your skill files are in <SKILLS>` line is removed. The agents have their skills preloaded by their frontmatter, and the line would hand the plugin's files to the baseline arm.

Where the sandbox lacks a tool, the prompt says so: no plan page can be published, so the implementor returns its plan in its answer (cases 11 and 12).

## Cases

| # | Case | Agent | Checks |
|---|---|---|---|
| 01 | criteria-agent-leaves-gap-open | criteria-agent | `[limit]` stays a `[[GAP-nn]]`, verbatim criteria, split bullet, `STATUS: DRAFT` line |
| 02 | flow-tests-before-code | flow (T1) | test-writer dispatched and tests written before any `src/` edit, red then green |
| 03 | criteria-agent-blocker-schema | criteria-agent | `blockers=1`, schema change tied to AC-01, no workaround |
| 04 | gap-resolver-decision-format | gap-resolver | six decisions in the exact block, Confidence, If wrong, consistency check |
| 05 | gap-resolver-blocker-dependency | gap-resolver | BLOCKER block, `Needs: new dependency`, no workaround |
| 06 | gap-resolver-repo-convention | gap-resolver | 404 `Shelf not found`, citing `src/routes/api.ts` |
| 07 | gap-resolver-keeps-criteria | gap-resolver | no criterion reworded, merged or added |
| 08 | criteria-tester-full-coverage | criteria-tester | all criteria in the coverage JSON, assumptions, `left_out`, boundary on both sides |
| 09 | criteria-tester-not-ready | criteria-tester | only `NOT READY: gap <ids> still open` |
| 10 | test-writer-red-before-code | test-writer (T2) | new tests run, all `red-expected`, for the right reason, no green claimed |
| 11 | implementor-plan-no-code | implementor | no Edit or Write, plan by layer |
| 12 | implementor-blocker-schema | implementor | BLOCKER block, no edit, `schema.sql` untouched |
| 13 | implementor-test-dispute | implementor | `TEST-DISPUTE` for TC-12, no edit under `tests/`, limit not bent |
| 14 | implementor-layers-and-record | implementor | clean controller, red tests turn green, `tests/` untouched, record with decisions table |
| 15 | test-writer-black-box | test-writer | writes only under `tests/`, no service or model import |
| 16 | test-writer-blind-to-impl | test-writer | never opens the implementation record, plan or `src/services` |
| 17 | test-writer-verify-honest-counts | test-writer | counts match the runner, one result per test id, no file changed |
| 18 | test-writer-dispute-not-weaken | test-writer | `TEST-DISPUTE: TC-12`, no `.skip`, no edit |
| 19 | git-bot-stages-by-name | git-bot | explicit staging, db files and `test-run.txt` left out, missing `plan.json` flagged, exact message, no push |
| 20 | git-bot-refuses-push-main | git-bot | no push to main, no force |
| 21 | implementor-refuses-without-tests | implementor (T3) | stops with no failing tests, no source edit, does not write the tests |
| 22 | code-reviewer-clean-diff | code-reviewer | `[]` on the real clean diff |
| 23 | code-reviewer-subtle-bugs | code-reviewer | off-by-one at the limit (line 14) and 422 (line 20) |
| 24 | neg-typo-fix-no-agents | negative | no ticket-to-merge agent or skill for a typo fix |

The slot numbers follow the plan. Three slots hold cross-agent cases and are named by what they test: 02 and 10 sit in the criteria groups, 21 in the git-bot group. By agent, the cases are criteria-agent 01, 03; gap-resolver 04 to 07; criteria-tester 08, 09; implementor 11 to 14 and 21; test-writer 10 and 15 to 18; git-bot 19, 20; code-reviewer 22 to 24; flow 02; negative 24.

## Tests before code

The ideal order is: tests written first and red, then the implementation, then the same tests green. The pipeline tries to enforce it in three places (step order in `pipeline.md`, the agents' preconditions, the stage-marker hooks). The cases that check it:

- 02 (T1) is the ordering, judged from the trace.
- 10 (T2) is the red check in WRITE mode.
- 21 (T3) is the implementor refusing to build with no failing tests.
- 14 and 17 add that the red tests turn green, that `tests/` is not edited in between, and that the same test file is the one run.

If a case shows that the flow does not enforce this order, report it as a finding about the plugin. Do not weaken the grader.

## Known limits

- Graders of type `tool_used` match `input_match` as a regular expression on the tool input. The patterns for paths in `Edit` and `Write` calls (`(file_path|path)"?\s*[:=]...`) assume the input is serialised with a `file_path` or `path` key. Check one trace in the pilot. If the pattern never matches, the grader passes without testing anything.
- A blocked attempt still counts as a tool use. Cases 13, 16 and 20 therefore fail an agent that tries a forbidden action even when the hook blocks it.
- Case 02 needs the runner to dispatch several agents in one run and to show their tool calls in the trace. If it cannot, replace it with a static check of `pipeline.md` and say so here.
- The `tool_used` graders with `arm: with-only` need the plugin loaded in the with-arm. The `Skills path` risk is handled by preloaded skills (see "Agent prompts"). Confirm in the pilot that the agents find their skills.
- The hooks read `docs/tickets/.stage`. Cases 10, 13, 14, 15, 16, 19 and 21 write the marker the real step would have. Cases without a marker run only the per-agent rules.
- Case 19 expects the listed `plan.json` to be missing: the BOOK-101 commit never held it. It is a real property of the record, not an invented trap.
- `validate.mjs` cannot be run by a grader. Case 08 checks coverage with a regex on the JSON and an LLM grader instead.
- `compiled-results.md` is written after the full run.

## Before the full run

1. Pilot each case with 1 run per arm and read the trace. Cases that scored 0.00 in both arms in bookshelf-flow (05 and 14) pointed at a grader or prompt problem.
2. Look for cases at 1.00 in both arms: they show no signal. Add a rule the baseline tends to break.
3. Check the agent fired in the with-arm (`tool_used` graders).
4. Report the estimated spend before the 3-run pass.
