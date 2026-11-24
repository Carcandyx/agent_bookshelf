# Cost log: {{TICKET-ID}}

I cannot run `/usage` for you. At each checkpoint below the orchestrator stops and waits until you run it and paste the numbers (or say `skip`), then writes them here. The three rows map to the cost report: Build, Review, Fix loop.

How to read each number: take the total at the checkpoint, subtract the previous checkpoint's total.

| Checkpoint | When | Total cost so far | Cache hit | Models |
|---|---|---|---|---|
| Baseline | step 1, before any agent runs | | | |
| After build | step 9 passes | | | |
| After review | step 11, first review | | | |
| After each fix iteration | after each re-verify | | | |
| Final | step 13 | | | |

## Cost report

| Stage | Cost | Cache hit | Models |
|---|---|---|---|
| Build (steps 2 to 9: criteria, tests, plan, implementation, verify) | $ | % | |
| Review (step 11) | $ | % | |
| Fix loop (fix iterations in steps 9 and 11) | $ | % | |
| Total, one ticket | $ | | |

## The one lever

Lever applied: 
Change made: 
Tests after the lever: 
Review eval after the lever: 
Did quality hold: 
