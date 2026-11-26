#!/usr/bin/env bash
shared="$(cd "$(dirname "${BASH_SOURCE[0]}")/../_shared" && pwd)"
bash "$shared/fixture.sh" 20-reviewer-unsaved-write.patch
# The old sandbox had no git history, so the reviewer read the change from this file; keep that input.
cp "$shared/20-reviewer-unsaved-write.patch" working-tree.diff
