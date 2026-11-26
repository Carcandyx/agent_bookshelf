#!/usr/bin/env bash
exec bash "$(dirname "${BASH_SOURCE[0]}")/../_shared/fixture.sh" --file=shelf-name.source.md:docs/tickets/book-201/source.md "$@"
