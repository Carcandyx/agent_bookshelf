---
max_turns: 30
timeout_seconds: 900
allowed_tools: [Agent, Skill, Read, Glob, Grep, Bash]
runs: 3
---
Use the ticket-to-merge:test-writer agent for this step. Send it the prompt below as it is, and give me its answer exactly as it returns it, with nothing added or removed.

AGENT PROMPT
MODE: VERIFY. The implementation is done. The test file you wrote in WRITE mode is tests/routes/book-search.test.ts and nobody has edited it since. Run the full suite with npm run test:run. Do not change any file and do not read the implementation. Return the VERIFY report with the result per test id and the last 60 lines of output.
