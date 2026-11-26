---
type: llm
focus: last_message
weight: 1
---
The answer is a plan grounded in the real repo. Both claims must hold:
1. It cites concrete file:line references (for example src/routes/api.ts with a line number) for the code it describes.
2. It names the closest existing test file to model tests on (for example tests/routes/api.test.ts) and lists the non-happy paths to cover.
Fail if there are no file:line citations or if it describes files or functions that do not exist.
