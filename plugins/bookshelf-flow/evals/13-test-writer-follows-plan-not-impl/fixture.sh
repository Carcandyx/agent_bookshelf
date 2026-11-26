#!/usr/bin/env bash
exec bash "$(dirname "${BASH_SOURCE[0]}")/../_shared/fixture.sh" 13-test-writer-follows-plan-not-impl.patch "$@"
