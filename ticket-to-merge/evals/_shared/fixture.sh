#!/usr/bin/env bash
# Builds the eval workspace (the current directory) from a FROZEN commit of Agent Bookshelf,
# so repo changes never silently change eval inputs. Then applies options and per-case patches.
#
# Usage: fixture.sh [options] [patch-file...]
#   patch paths are relative to this _shared folder and are applied to the working tree
#   (uncommitted) after the fixture commit.
#
# Frozen inputs
#   BASE_SHA    560d08d  the commit just before BOOK-101: src/, tests/, CLAUDE.md, vitest.config.ts.
#                        The search feature does not exist yet (GET /books/search is a stub).
#   TICKET_SHA  e256297  the real BOOK-101 run. Its docs/tickets/book-101/* files, its
#                        tests/routes/book-search.test.ts and its src/ change are the inputs
#                        for the cases that need a briefing, a test list, failing tests or a
#                        finished implementation. Nothing is invented: every input is real.
#
# Options (all optional; with no option you get the bare BASE_SHA repo)
#   --docs=a,b,c        files of docs/tickets/book-101/ to put in the fixture commit
#                       (source.md, briefing.md, tests.md, tests.json, decisions.md)
#   --file=SRC:DEST     copy _shared/inputs/SRC to DEST in the fixture commit (hand-written ticket
#                       sources and briefings; every name in them exists in the BASE_SHA code).
#   --stage=NAME        write docs/tickets/.stage (briefing|test|implement|verify|review|ship).
#                       Written AFTER the commit, so it shows as untracked, as in a real run.
#   --tests             add the BOOK-101 test file (tests/routes/book-search.test.ts) to the
#                       commit. The feature is missing, so these tests are red.
#   --impl              overlay the finished BOOK-101 work as UNCOMMITTED changes: the source
#                       files, all of docs/tickets/book-101/ (including implementation.md and
#                       test-run.txt) and the BOOK-101 test file.
#   --tracked-db        commit empty bookshelf.db-shm and bookshelf.db-wal (they are tracked in
#                       the real repo), then modify them so git status shows them as changed.
#   --remote            create a bare repo outside the workspace, add it as "origin" and push
#                       the fixture commit to it as main.
#   --node-modules      make node_modules available (symlink, else copy) so Bash cases can run
#                       vitest. On Windows the tests write to /tmp, so C:\tmp must exist.
#   --review-patch=F    apply _shared/F to the working tree and also copy it to review.patch
#                       (the reviewer is read-only and has no git, so it reads the diff there).
set -euo pipefail

BASE_SHA="560d08d"
TICKET_SHA="e256297"
shared="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(cd "$shared/../../.." && pwd)"

docs=""
stage=""
want_tests=0
want_impl=0
want_db=0
want_remote=0
want_nm=0
review_patch=""
files=()
patches=()
for arg in "$@"; do
  case "$arg" in
    --docs=*) docs="${arg#--docs=}" ;;
    --file=*) files+=("${arg#--file=}") ;;
    --stage=*) stage="${arg#--stage=}" ;;
    --tests) want_tests=1 ;;
    --impl) want_impl=1 ;;
    --tracked-db) want_db=1 ;;
    --remote) want_remote=1 ;;
    --node-modules) want_nm=1 ;;
    --review-patch=*) review_patch="${arg#--review-patch=}" ;;
    --*) echo "fixture.sh: unknown option $arg" >&2; exit 2 ;;
    *) patches+=("$arg") ;;
  esac
done

# 1. Frozen base. No node_modules, no .gitignore (so db files and the stage marker show in git status).
git -C "$root" archive "$BASE_SHA" src tests package.json tsconfig.json vitest.config.ts CLAUDE.md | tar -x

# 2. Real BOOK-101 documents and tests, as requested.
if [ -n "$docs" ]; then
  mkdir -p docs/tickets/book-101
  IFS=',' read -r -a doc_list <<< "$docs"
  for d in "${doc_list[@]}"; do
    git -C "$root" archive "$TICKET_SHA" "docs/tickets/book-101/$d" | tar -x
  done
fi
for pair in ${files[@]+"${files[@]}"}; do
  src="${pair%%:*}"
  dest="${pair#*:}"
  mkdir -p "$(dirname "$dest")"
  cp "$shared/inputs/$src" "$dest"
done
if [ "$want_tests" = 1 ]; then
  git -C "$root" archive "$TICKET_SHA" tests/routes/book-search.test.ts | tar -x
fi
if [ "$want_db" = 1 ]; then
  : > bookshelf.db-shm
  : > bookshelf.db-wal
fi

# 3. Fixture commit.
git init -q -b main
git config user.name eval
git config user.email eval@example.invalid
git config commit.gpgsign false
git add -A
git commit -qm "fixture"

if [ "$want_remote" = 1 ]; then
  remote_dir="$(mktemp -d)/origin.git"
  git init -q --bare -b main "$remote_dir"
  git remote add origin "$remote_dir"
  git push -q origin main
fi

# 4. Uncommitted state.
if [ "$want_impl" = 1 ]; then
  git -C "$root" archive "$TICKET_SHA" src tests/routes/book-search.test.ts docs/tickets/book-101 | tar -x
fi
if [ "$want_db" = 1 ]; then
  printf 'changed by a test run\n' >> bookshelf.db-shm
  printf 'changed by a test run\n' >> bookshelf.db-wal
fi
if [ -n "$stage" ]; then
  mkdir -p docs/tickets
  printf '{\n  "ticket": "book-101",\n  "stage": "%s",\n  "at": "2026-11-24T00:00:00.000Z"\n}\n' "$stage" > docs/tickets/.stage
fi
if [ "$want_nm" = 1 ]; then
  ln -s "$root/node_modules" node_modules 2>/dev/null || true
  [ -e node_modules/vitest ] || { rm -rf node_modules; cp -r "$root/node_modules" node_modules; }
fi
if [ -n "$review_patch" ]; then
  git apply "$shared/$review_patch"
  cp "$shared/$review_patch" review.patch
fi
for patch in ${patches[@]+"${patches[@]}"}; do
  git apply "$shared/$patch"
done
