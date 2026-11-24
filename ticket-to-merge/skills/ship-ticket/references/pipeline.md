# Pipeline reference

## Stages, agents and what each may see

| Step | Stage marker | Agent | Effort | Reads | Writes | Human |
|---|---|---|---|---|---|---|
| 1 | briefing | (you) | | the arguments | `source.md`, `cost.md`, `decisions.md` | `/usage` baseline (pause) |
| 2 | briefing | criteria-agent | medium | `source.md`, repo (existence checks only) | nothing (returns text; you save it) | none |
| 3 | briefing | gap-resolver | high | `briefing.md`, `source.md`, `CLAUDE.md`, repo | nothing (returns decisions; you apply and log them) | none |
| 3 | briefing | criteria-agent (revise) | medium | `briefing.md` | nothing | none |
| 4 | briefing | criteria-tester | medium | `briefing.md` | nothing (returns JSON; you validate and save it) | none |
| 5 | test | test-writer (WRITE) | default | `tests.md`, briefing Interface section, `src/server.ts`, existing tests | files under `tests/` only | none |
| 6 | implement | implementor (PLAN) | high | briefing, tests.md, `tests/`, repo, CLAUDE.md | `plan.json`, `plan.html` | none |
| 7 | implement | implementor | high | the user's canvas prompt | plan files | **plan approval** |
| 8 | implement | implementor (IMPLEMENT) | high | same, plus the repo | source files, `implementation.md` | none |
| 9 | verify | test-writer (VERIFY) | default | test output only | nothing (you save `test-run.txt`) | `/usage` (pause) |
| 10 | ship | git-bot (COMMIT) | low | `implementation.md` (For the git-bot section) | git commit | none |
| 11 | review | code-reviewer (through review-pr) | default | the diff, briefing, tests.md, repo | nothing | `/usage` (pause) |
| 12 | ship | git-bot (PUSH) | low | nothing | git push | none |
| 13 | none | (you) | | all documents | `cost.md`, `decisions.md` | `/usage` (pause) |

The test-writer never receives `implementation.md`, `plan.json`, `plan.html` or anything under `src/services/`. Do not put their content in its prompt either. The guardrail also blocks those reads.

## Documents in `docs/tickets/<ID>/`

| File | Written by | Purpose |
|---|---|---|
| `source.md` | you | The ticket text, unchanged. |
| `briefing.md` | criteria-agent, then you | Mapped criteria; gaps filled with the gap-resolver's decisions; `Status: COMPLETE`. |
| `tests.json` | criteria-tester, saved by you | The validated test list as data. |
| `tests.md` | you | The final test list (nobody reviews it). |
| `decisions.md` | you | Every choice an agent made instead of a person: what, why, confidence, what changes if wrong. |
| `plan.json`, `plan.html` | implementor | The plan-canvas input and page. |
| `implementation.md` | implementor | What was built. |
| `test-run.txt` | you | Output of the last green run. |
| `cost.md` | you | The cost log. |

`docs/tickets/.stage` is the stage marker and is never committed.

## Relay method

Specialists cannot ask the user anything. When a revision or a ruling is needed, you continue the same agent:

1. Spawn with the Agent tool. Note the agent id in the result.
2. For a revision or a ruling, call `SendMessage` with `to` = that id and the new information. The agent keeps its history.
3. If `SendMessage` is unavailable or the agent cannot be resumed, spawn a new agent of the same type and include in the prompt the previous output and the new information.

## Pauses

A pause means: send your message, end the turn, and do nothing until the user replies. There are five: the usage numbers at steps 1, 9, 11 and 13, and the plan approval at step 7. At a usage pause `skip` is an accepted reply.

## Resuming a run

When `docs/tickets/<ID>/` already exists, decide where to continue by looking at the files, newest first:

| Found | Continue at |
|---|---|
| `implementation.md` and `test-run.txt` | step 10 (commit) if the run was green, else step 9 |
| `implementation.md` | step 9 |
| `plan.html` | step 7 |
| `tests.md` and files under `tests/` for this ticket | step 6 |
| `tests.md` | step 5 |
| `briefing.md` with `Status: COMPLETE` | step 4 |
| `briefing.md` with open gaps | step 3 (gap-resolver) |
| `source.md` only | step 2 |

Tell the user where you are resuming and why. Agent ids from the earlier session are gone: spawn fresh agents with the documents as input.

## Stop rules

- `BLOCKER` from any agent: show it, end the run, clear the stage marker. Nothing is committed.
- Two failed fix iterations: stop and show the evidence.
- Gaps are never a reason to stop: after the criteria-agent's single re-check and one last gap-resolver round the briefing is COMPLETE, and whatever stayed uncertain is in `decisions.md` with its confidence.
- Findings of `high` or `medium` severity left after two review rounds: do not push; stop and show them.
- A hook block (`BLOCKED by ticket-to-merge guardrail`): do not look for another way. Report it to the user and stop that step.
- If the user abandons the run, run `stage.js clear` so normal editing is not restricted.
