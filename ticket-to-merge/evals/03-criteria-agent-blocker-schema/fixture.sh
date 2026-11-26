#!/usr/bin/env bash
exec bash "$(dirname "${BASH_SOURCE[0]}")/../_shared/fixture.sh" --file=page-count.source.md:docs/tickets/book-301/source.md "$@"
