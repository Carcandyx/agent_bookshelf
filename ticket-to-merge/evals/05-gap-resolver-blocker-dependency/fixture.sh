#!/usr/bin/env bash
exec bash "$(dirname "${BASH_SOURCE[0]}")/../_shared/fixture.sh" --file=shelf-export.source.md:docs/tickets/book-401/source.md --file=shelf-export.draft-briefing.md:docs/tickets/book-401/briefing.md "$@"
