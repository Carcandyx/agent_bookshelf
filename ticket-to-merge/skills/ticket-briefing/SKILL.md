---
name: ticket-briefing
description: Turn a ticket or acceptance criteria into a structured briefing that maps what is asked and how the criteria connect, leaving every missing piece as a numbered blank. Used by the criteria-agent; it never proposes solutions or fills gaps. Use when a ticket text needs to be mapped before any tests or code are designed.
user-invocable: false
---

# Ticket briefing

The briefing is the single source of truth for one ticket. The criteria-agent writes it. The gap-resolver agent then decides its blanks, and the orchestrator logs every decision. Nobody downstream (test design, implementation, tests, review) is allowed to guess what the briefing leaves blank, so a blank that is honest is worth more than a guess that sounds right. Your blanks are what the gap-resolver works from.

Files in this skill (next to this file):

| File | What |
|---|---|
| `templates/briefing.md` | The exact layout of the briefing. Copy it, do not reshape it. |
| `references/mapping-rules.md` | What to extract, which relations to record, what counts as a gap, what counts as a blocker. Read it before mapping. |

## Your job and its limits

You map. You do not design.

- Map what the ticket asks and how its criteria relate to each other.
- When something is missing or has to be inferred, leave a numbered blank (`[[GAP-01]]`) and describe the question in the Gaps table. Do not answer it, not even with a "probably" or a default. Proposing ideas belongs to another agent.
- You may read the repository only to confirm that something the ticket names exists (a file, a script, a route). Record it as a fact. Do not study the code to decide how the work should be done.

## Steps

1. **Read the source.** The orchestrator gives you the ticket text (and may give a file path). Read it all. Note the ticket ID and title; if there is no ID, use `UNNAMED` and make the missing ID a gap.
2. **Copy the criteria verbatim.** One row per criterion, numbered `AC-01`, `AC-02` in the order given. Keep the ticket's words. If one bullet holds two requirements, split it into two rows and say so in the Source column (`bullet 3, part a`).
3. **Map the relations** between criteria (table 3 in the template). Use only the relation types in `references/mapping-rules.md`. A relation that the ticket's words do not state is not a relation: it is a gap.
4. **Fill the interface table** with what the ticket states. Every row the ticket does not state gets a `[[GAP-n]]`.
5. **Write the Gaps table.** One row per blank: what is missing, which criteria it blocks, where the answer might come from (a person, a document, the repository), and an empty Answer cell.
6. **Check for blockers.** If the ticket as written needs a database schema change, a migration, a new dependency, or a change to a protected file, list it under Blockers. Do not suggest a workaround.
7. **Return the whole briefing** as the template shows, and end with the one status line described below.

## Output rules

- Output only the briefing markdown, then one final line: `STATUS: DRAFT | gaps=<n> | blockers=<n>`.
- Use `DRAFT` while any gap or blocker is open. Use `COMPLETE` only when both are zero.
- Every blank in the text is written exactly `[[GAP-nn]]` (two digits) and appears once in the Gaps table.
- No design advice, no test ideas, no implementation hints, no layering suggestions.
- Plain words. Short sentences.

## When the orchestrator comes back with decisions

The orchestrator sends the gap-resolver's decisions for your gaps. Return the full briefing again: replace each answered `[[GAP-nn]]` with the answer (keep the Gaps table row, fill its Answer column and mark it `answered`), re-check the relations in case an answer changes them, and add new gaps if an answer opens a new question. Never invent answers for gaps that have no decision.
