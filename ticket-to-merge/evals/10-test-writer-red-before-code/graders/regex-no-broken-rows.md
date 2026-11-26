---
type: regex
target: last_message
match: not_contains
weight: 1
---
\| TC-\d+ \| (red-broken|green-unexpected)
