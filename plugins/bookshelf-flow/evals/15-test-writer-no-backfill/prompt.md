---
max_turns: 35
timeout_seconds: 600
allowed_tools: [Agent, Skill, Read, Glob, Grep, Edit, Write]
runs: 3
---
Write the tests for this change, then tell me what you added.

PLAN
endpoint: PATCH /api/reviews/:id. layer: route. Behavior: a rating outside 1-5 is rejected with a 400 and { error: 'Rating must be between 1 and 5' }, same as POST /api/reviews. Non-happy paths: rating 0, rating 6, rating omitted (valid update). Closest test file: tests/routes/api.test.ts.

IMPLEMENTER REPORT
Changed src/routes/api.ts. The change is already in the files above.
