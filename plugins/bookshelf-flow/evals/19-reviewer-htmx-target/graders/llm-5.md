---
type: llm
focus: last_message
weight: 1
---
The report flags the HTMX swap-target problem: show.ejs uses hx-target="#reviews-list" with hx-swap="outerHTML", but the partial reviews-list.ejs has no element with id="reviews-list". Fail if it does not mention the missing id.
