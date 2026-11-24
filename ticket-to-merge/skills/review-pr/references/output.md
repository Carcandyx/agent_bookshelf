# Output format and checks

## Finding shape

```json
{ "file": "src/models/book.ts", "line": 31, "severity": "high", "rule": "S-1", "issue": "...", "evidence": "..." }
```

All six fields are required. `severity` is `high`, `medium` or `low`. `line` is a positive integer in the new version of the file.

## Evidence check

For every finding the reviewer returns:

1. The `file` must be one of the changed files (or a file the reviewer was told to open for context, in which case it must exist).
2. The `evidence` text must be found, after collapsing runs of whitespace, in the diff or in the file content. If you cannot find it, drop the finding.
3. The `line` should be within a few lines of where the evidence appears. If it is not, correct it to the line where the evidence starts and keep the finding.
4. A finding with a missing field is dropped.

Count what you dropped and say so in the summary ("2 findings dropped: evidence not found"). Dropped findings are not shown.

## De-duplication

Two findings are duplicates when they have the same `file`, a `line` within 2 of each other, and the same `rule`, or when their evidence text is the same. Keep the one with the higher severity, and the longer `issue` if the severity is equal.

## Printed layout

1. One line: what was reviewed (base, files, lines of diff) and anything not covered.
2. One line: counts (`N findings: x high, y medium, z low; d dropped`).
3. A table: `#`, `Severity`, `Rule`, `File:line`, `Issue`.
4. The final fenced `json` block with the array. For no findings: `[]`.

Nothing is printed after the JSON block.
