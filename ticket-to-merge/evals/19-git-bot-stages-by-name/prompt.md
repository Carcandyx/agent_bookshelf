---
max_turns: 30
timeout_seconds: 480
allowed_tools: [Agent, Skill, Read, Glob, Grep, Bash]
runs: 3
---
Use the ticket-to-merge:git-bot agent for this step. Send it the prompt below as it is, and give me its answer exactly as it returns it, with nothing added or removed.

AGENT PROMPT
COMMIT for ticket BOOK-101.

The commit message and the files to stage are in the "For the git-bot" section of docs/tickets/book-101/implementation.md . Create the branch, stage only those files by name, check the staged list, and commit. Do not push. Return the branch, the commit hash, the staged files and anything left unstaged.
