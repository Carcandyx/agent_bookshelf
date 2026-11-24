---
name: gap-resolution
description: Decide every open gap in a ticket briefing by logical reasoning from the ticket's words, the repository and the project conventions, and write down each decision with its reasoning and confidence so a person can audit it later. Used by the gap-resolver agent when no human is available to answer. Use after the briefing is drafted and before tests are designed.
user-invocable: false
---

# Gap resolution

The criteria-agent maps the ticket and leaves numbered blanks for what the ticket does not say. Nobody is available to answer them, so you decide them. A wrong guess is possible and the pipeline will go on with your choices, so the value of your work is two things: choices that are as defensible as possible, and a trail that lets a person see exactly what was decided and why.

Files in this skill (next to this file):

| File | What |
|---|---|
| `references/decision-rules.md` | The order of evidence, how to choose between readings, when a gap is a blocker. Read it before deciding. |
| `templates/decisions.md` | The layout of the decision log the orchestrator keeps for the whole ticket. You do not write it; your output feeds it. |

## Input

The draft briefing (`docs/tickets/<ID>/briefing.md`) with its Gaps table, the ticket text (`source.md`), `CLAUDE.md`, and the repository (read-only).

## Steps

1. Read the briefing, the source, `CLAUDE.md` and the decision rules.
2. For each open gap, in order, collect evidence: the ticket's words, then what the repository already does in the same situation (find a similar route, response, validation or query and read it), then the project conventions. Quote or cite the path.
3. List the readings the evidence allows. Pick by the rules: the reading the ticket supports, else the one the repository already uses, else the narrowest one that still meets every criterion.
4. Check the choice against the other gaps and against all the criteria. A set of choices that contradicts itself or a criterion is wrong: revise.
5. Rate your confidence: `high` (the ticket or the repository says it), `medium` (it follows from convention, other readings were plausible), `low` (a judgement call with no direct evidence).
6. If every reading needs a schema change, migration, new dependency or protected file, do not choose. Return the blocker block below.

## Output

Only this, in this order.

```
## Decisions

### GAP-01: <the gap's question>
Decision: <the answer, written so it can replace the blank in the briefing>
Reasoning: <two to four sentences: the logic, in plain words>
Evidence: <quote from the ticket, or path:line in the repository, or the CLAUDE.md rule>
Alternatives considered: <the other readings and why they lost>
Confidence: high | medium | low
If wrong: <what would change in the tests or code if the real answer is different>

### GAP-02: ...

## Consistency check
<one or two sentences: how you checked that the decisions agree with each other and with every criterion>
```

Or, when a blocker applies:

```
BLOCKER
Gap: GAP-nn
Needs: <schema change | migration | new dependency | protected file>
Because: <the criterion and the decision that cannot be made without it>
```

## Never

- Change, reword, merge or add a criterion. You fill gaps only.
- Leave a gap undecided or answer "to be confirmed".
- Choose a reading just because it is easy to build. Evidence first.
- Suggest a workaround for a blocker.
- Write files. You return text; the orchestrator saves it.
