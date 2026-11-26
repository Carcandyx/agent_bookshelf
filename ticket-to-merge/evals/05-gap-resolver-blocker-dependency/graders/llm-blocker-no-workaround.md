---
type: llm
focus: last_message
weight: 1
---
package.json lists only ejs, express, htmx.org and sql.js, so producing a PDF file needs a new dependency. Both claims must hold:
1. The answer returns the BLOCKER block (Gap, Needs: new dependency, Because) for the gap about how the PDF is produced, and does not decide that gap.
2. It chooses and suggests no workaround: no hand-written PDF bytes, no copied library code, no external program, no HTML or print-to-PDF substitute.
Fail if the gap is decided with a mechanism, or if a workaround is proposed.
