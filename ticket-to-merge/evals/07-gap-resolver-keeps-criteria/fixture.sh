#!/usr/bin/env bash
exec bash "$(dirname "${BASH_SOURCE[0]}")/../_shared/fixture.sh" --file=shelf-name.source.md:docs/tickets/book-201/source.md --file=shelf-name.draft-briefing.md:docs/tickets/book-201/briefing.md "$@"
