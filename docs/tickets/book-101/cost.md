# Cost log: book-101

I cannot run `/usage` for you. At each checkpoint below the orchestrator stops and waits until you run it and paste the numbers (or say `skip`), then writes them here. The three rows map to the cost report: Build, Review, Fix loop.

How to read each number: take the total at the checkpoint, subtract the previous checkpoint's total.

| Checkpoint | When | Total cost so far | Cache hit | Models |
|---|---|---|---|---|
| Baseline | step 1, before any agent runs | $0.1821 | 83% | claude-sonnet-5-5 ($0.1820), claude-haiku-5-5 ($0.0001) |
| After build | step 9 passes | $4.68 | 97% | claude-opus-5-5 ($2.99), claude-sonnet-5-5 ($1.68), claude-haiku-5-5 ($0.0034) |
| After review | step 11, first review | $5.12 | 97% | claude-opus-5-5 ($2.99), claude-sonnet-5-5 ($2.12), claude-haiku-5-5 ($0.0084) |
| After each fix iteration | after each re-verify | none | | No fix iteration ran: tests were green at the first verify and the first review returned `[]`. |
| Final | step 13 | not taken | | The final `/usage` pause was skipped; the review row is the last reading. |

## Cost report

| Stage | Cost | Cache hit | Models |
|---|---|---|---|
| Build (steps 2 to 9: criteria, tests, plan, implementation, verify) | $4.50 ($4.68 - $0.18 baseline) | 97% (cumulative at that checkpoint) | opus $2.99 (gap-resolver and implementor), sonnet $1.50, haiku $0.003 |
| Review (step 11) | $0.44 ($5.12 - $4.68) | 97% (cumulative) | sonnet $0.44, haiku $0.005 |
| Fix loop (fix iterations in steps 9 and 11) | $0.00 | n/a | none ran |
| Total, one ticket | $4.94 ($5.12 - $0.18 baseline) | 97% | opus $2.99 (61%), sonnet $1.94 (39%), haiku $0.005 |

## The one lever

Lever applied: code-reviewer model, sonnet to haiku (measured on the review eval, not yet on a full ticket).
Change made: none in the plugin yet. `agents/code-reviewer.md` still says `model: sonnet`. The eval ran the same planted-bug patch three times on each model (`ticket-to-merge/evals/review/README.md`).
Tests after the lever: not applicable to the reviewer; the 32 tests belong to the build step.
Review eval after the lever: recall 21/21 (100%) on haiku, same as sonnet. Precision 83.9% on haiku (26 of 31 findings) against 85.7% on sonnet (24 of 28). All 5 haiku findings counted as misses were real side effects of the planted bugs.
Did quality hold: yes on this eval. The eval is easy (the bugs match the reviewer's own rules), so confirm on the next real ticket before changing the default.
Cost effect: not measured in dollars. The review step cost $0.44 of $4.94, so even a large cut on that step saves under 9% of a ticket. The step with the real money is the build ($4.50), and 61% of the total is opus ($2.99, gap-resolver and implementor). Putting the implementor on sonnet is the lever with the most to gain, and it is the one to test next on a second ticket.
