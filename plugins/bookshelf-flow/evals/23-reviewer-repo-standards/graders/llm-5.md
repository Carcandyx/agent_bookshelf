---
type: llm
focus: last_message
weight: 1
---
The report flags both violations in src/models/review.ts: (1) it imports sql.js directly instead of using all/get/run from src/db/index.ts, and (2) it imports '../db/index' without the .js extension. Fail if either is missed.
