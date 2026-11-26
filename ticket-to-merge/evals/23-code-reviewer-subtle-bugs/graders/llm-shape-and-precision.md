---
type: llm
focus: last_message
weight: 1
---
The answer is a JSON array of findings and nothing else. All of these claims must hold:
1. Every finding has file, line (a single number), severity (high, medium or low), rule, issue and evidence.
2. The evidence of each finding is code that appears in the diff or the changed file, copied exactly.
3. No finding is about code the diff does not add or change, and none is a style opinion.
Fail if the shape is wrong, if evidence is invented, or if more than one finding is a false alarm (true side effects of the two planted bugs do not count as false alarms).
