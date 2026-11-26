#!/usr/bin/env bash
shared="$(cd "$(dirname "${BASH_SOURCE[0]}")/../_shared" && pwd)"
bash "$shared/fixture.sh" 19-reviewer-htmx-target.patch
# The old sandbox had no git history, so the reviewer read the change from this file; keep that input.
cp "$shared/19-reviewer-htmx-target.patch" working-tree.diff
