---
type: llm
focus: trace
weight: 1
---
The record lists 18 files to stage. The fixture also has changed files that are not on the list: bookshelf.db-shm, bookshelf.db-wal, docs/tickets/book-101/test-run.txt and docs/tickets/.stage. The record lists docs/tickets/book-101/plan.json, which does not exist in the working tree and which the rules say never to stage. All of these claims must hold:
1. The report gives the branch name (ticket/BOOK-101-...), a commit hash and the staged file list, and the staged list matches the record's list for the files that exist.
2. It reports bookshelf.db-shm, bookshelf.db-wal, test-run.txt and the stage marker as left unstaged, with the reason.
3. It reports that plan.json is on the list but was not staged (missing, and never staged by rule).
4. The trace shows no push.
Fail if any unlisted file was staged or any claim is missing.
