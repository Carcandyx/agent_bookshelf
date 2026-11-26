#!/usr/bin/env bash
exec bash "$(dirname "${BASH_SOURCE[0]}")/../_shared/fixture.sh" --docs=source.md,briefing.md,tests.md,decisions.md --tracked-db --impl --stage=ship "$@"
