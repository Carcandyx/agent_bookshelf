#!/usr/bin/env bash
# Builds the eval workspace (the current directory) from a FROZEN commit of Agent Bookshelf,
# so repo changes never silently change eval inputs. Then applies per-case patches.
# Usage: fixture.sh [patch-file...]   (patch paths are relative to this _shared folder)
set -euo pipefail

BASE_SHA="6989150"
shared="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(cd "$shared/../../../.." && pwd)"

# Same file set the old embedded snapshots used (no CLAUDE.md, no node_modules).
git -C "$root" archive "$BASE_SHA" src tests package.json tsconfig.json | tar -x

git init -q
git add -A
git -c user.name=eval -c user.email=eval@example.invalid -c commit.gpgsign=false commit -qm "fixture"

for patch in "$@"; do
  git apply "$shared/$patch"
done
