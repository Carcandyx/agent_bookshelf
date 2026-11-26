#!/usr/bin/env bash
exec bash "$(dirname "${BASH_SOURCE[0]}")/../_shared/fixture.sh" --docs=briefing.md,tests.md,implementation.md --stage=test "$@"
