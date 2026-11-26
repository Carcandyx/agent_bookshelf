#!/usr/bin/env bash
shared="$(cd "$(dirname "${BASH_SOURCE[0]}")/../_shared" && pwd)"
bash "$shared/fixture.sh" 21-reviewer-error-surface.patch
# The old sandbox had no git history, so the reviewer read the change from this file; keep that input.
cp "$shared/21-reviewer-error-surface.patch" working-tree.diff
