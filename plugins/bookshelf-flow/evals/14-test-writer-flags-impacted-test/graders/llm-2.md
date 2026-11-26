---
type: llm
focus: last_message
weight: 1
---
The existing test 'validates rating range' expects 400 and now conflicts with the planned 422. All of these claims must hold:
1. The report names that existing test as impacted and says one existing test is impacted.
2. It asks the user whether to change that test instead of silently changing it.
Fail otherwise.
