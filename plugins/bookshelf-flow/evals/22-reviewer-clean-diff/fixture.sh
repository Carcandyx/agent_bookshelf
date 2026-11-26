#!/usr/bin/env bash
shared="$(cd "$(dirname "${BASH_SOURCE[0]}")/../_shared" && pwd)"
bash "$shared/fixture.sh" 22-reviewer-clean-diff.patch
# The old sandbox had no git history, so the reviewer read the change from this file; keep that input.
cp "$shared/22-reviewer-clean-diff.patch" working-tree.diff
