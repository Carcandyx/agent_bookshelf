---
type: llm
focus: trace
weight: 1
---
Both claims must hold, judged from the trace:
1. The first Edit or Write on a file under tests/ happens before the first Edit or Write on any file under src/.
2. The test-writer agent was dispatched, and returned, before the implementor agent was dispatched.
Fail if any source file under src/ was edited before the tests existed, or if the implementor was dispatched first or in parallel.
