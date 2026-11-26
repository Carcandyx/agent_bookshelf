#!/usr/bin/env bash
exec bash "$(dirname "${BASH_SOURCE[0]}")/../_shared/fixture.sh" 16-test-writer-non-trivial.patch "$@"
