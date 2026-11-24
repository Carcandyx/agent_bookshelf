---
name: test-case-design
description: Design the set of tests that proves a completed briefing is met entirely, as a table of real scenarios with the criterion each one addresses, and record the choices made. No human reviews the list, so it must cover every criterion. Used by the criteria-tester and the orchestrator. Use after a briefing has no open gaps.
user-invocable: false
---

# Test case design

The test list is the contract for the test-writer, and nobody reviews it before the tests exist. It must therefore prove that every acceptance criterion is met, it must be made of real scenarios (not rare corner cases nobody will meet), and it must show what was decided on the way so a person can audit it later.

Files in this skill (next to this file):

| File | What |
|---|---|
| `references/coverage-rules.md` | How to choose tests, the allowed values for type and likelihood, the realism filter, the coverage check. Read it before designing. |
| `validate.mjs` | Checks a tests JSON against the briefing: schema, every criterion covered, every test justified. `node validate.mjs tests.json briefing.md` |
| `templates/tests.md` | The layout of the final test file the orchestrator writes. |

There are two roles. Read only your own part.

## Part A: the criteria-tester (designs the list)

Input: the completed briefing (no open gaps). If a gap is still open, stop and answer only `NOT READY: gap <ids> still open`. Gaps that the gap-resolver decided are filled in the briefing and are part of the truth you test; where a test depends on such a decision, say so in `assumptions`.

1. List the acceptance criteria and the interface from the briefing. These are the only sources of truth. Do not read the implementation, and do not invent behaviour the briefing does not state.
2. For each criterion, write the tests that a reasonable person would run to see it met. Think in observable behaviour at the entry point: what goes in, what comes out.
3. Add tests for how criteria interact only where the briefing's relation table says they do.
4. Tag every test with a type and a likelihood (see the references). Be honest about likelihood.
5. Apply the realism filter. A scenario you considered and left out goes into `left_out` with the reason. A rare test stays only when a criterion cannot be shown any other way.
6. Run the coverage check from the references. Fix gaps in coverage before you answer: 100% of the criteria must be covered, because no one will review the list.
7. Return one JSON block (schema below), followed by a short markdown table of the same tests. Do not write any file. You cannot ask anyone anything.

JSON schema (also validated by `validate.mjs`):

```json
{
  "ticket": "<ID>",
  "title": "<ticket title>",
  "revision": 1,
  "tests": [
    {
      "id": "TC-01",
      "title": "Short name",
      "what": "One sentence: the real scenario being tested.",
      "criteria": ["AC-01"],
      "type": "happy | validation | boundary | security | regression",
      "likelihood": "common | occasional | rare",
      "expected": "What can be observed when it passes."
    }
  ],
  "coverage": [
    { "criterion": "AC-01", "tests": ["TC-01"] },
    { "criterion": "AC-06", "tests": [], "note": "Met by the whole set: every criterion above has at least one test." }
  ],
  "assumptions": [
    { "test": "TC-03", "what": "The test assumes the limit is 100 (briefing decision GAP-02).", "confidence": "medium" }
  ],
  "left_out": [
    { "what": "A scenario considered and not written", "why": "The reason, in one sentence." }
  ],
  "notes": "Anything else, such as a criterion that can only be partly tested."
}
```

`assumptions` and `left_out` are your audit trail. They feed the decision log the orchestrator keeps. Use `[]` when there are none.

## Part B: the orchestrator (checks and saves the list)

1. Write the tests JSON to `docs/tickets/<ID>/tests.json`.
2. Run `node ${CLAUDE_SKILL_DIR}/validate.mjs docs/tickets/<ID>/tests.json docs/tickets/<ID>/briefing.md`. If it prints problems, send them to the same tester and ask for a corrected JSON. At most two corrections.
3. Write `docs/tickets/<ID>/tests.md` from the template. Add the `assumptions` and `left_out` entries to the decision log (`decisions.md`).

## Rules

- Every criterion has at least one test (or a note that explains why the set as a whole meets it), and every test names at least one criterion.
- Never keep a test just to look thorough.
- No test describes how the code is organised. Tests describe behaviour at the entry point.
- The final test file is the contract for the test-writer. Keep it plain enough that someone who never saw the briefing can write the tests from it plus the interface.
