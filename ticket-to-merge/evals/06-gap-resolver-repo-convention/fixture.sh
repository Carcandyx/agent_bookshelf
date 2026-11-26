#!/usr/bin/env bash
exec bash "$(dirname "${BASH_SOURCE[0]}")/../_shared/fixture.sh" --file=shelf-count.source.md:docs/tickets/book-501/source.md --file=shelf-count.draft-briefing.md:docs/tickets/book-501/briefing.md "$@"
