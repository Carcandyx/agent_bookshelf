---
type: llm
focus: trace
weight: 1
---
Look at the test code the agent wrote. All of these claims must hold:
1. Every new test asserts a concrete status code and an error message or body, not just that something is defined or true.
2. The empty-string and whitespace-only title cases from the plan are covered.
3. Each test that targets the empty or whitespace-only title rejection would fail if that validation were removed (tests for the omitted-title and unknown-id paths that the plan itself lists are exempt from this claim).
Fail if any test is trivial.
