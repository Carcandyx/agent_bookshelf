---
type: llm
focus: last_message
weight: 1
---
The briefing has seven criteria (AC-01 to AC-07) and twelve gaps decided by the gap-resolver. All of these claims must hold:
1. Every test has an id, the criteria it addresses, a type (happy, validation, boundary, security or regression) and a likelihood (common, occasional or rare), and every criterion AC-01 to AC-05 has at least one test. AC-06 and AC-07 are marked as met by the whole set, not given a test of their own.
2. The tests are real scenarios at the entry point GET /books/search (inputs and observable outputs), and none of them depends on how the code is written.
3. "assumptions" lists tests that depend on a decision made by the gap-resolver (for example the 100-character limit, accented letters, the repeated q rule), and "left_out" lists at least one considered scenario with its reason.
4. The boundary of the limit is tested on both sides (100 accepted, 101 rejected).
Fail if any claim does not hold.
