# Review eval: planted bugs

Measures what `/review-pr` finds (recall) and how much of what it reports is real (precision).

## Material

| File | What |
|---|---|
| `clean.patch` | The real BOOK-101 change (source, view and test files, against `main`). The reviewer returned `[]` on it in the pipeline run. |
| `planted.patch` | The same change with seven bugs added by hand, one per kind of rule in `skills/code-review/references/standards.md`. |
| `ground-truth.json` | The seven planted bugs, each with file, line and rule. |

Planted bugs:

| Id | Rule | Where | What |
|---|---|---|---|
| B1 | S-1 | `src/models/book.ts:24` | User text put inside the SQL with a template literal |
| B2 | A-1/A-2 | `src/routes/books.ts:16` | Length rule moved into the controller and removed from the service |
| B3 | C-2 | `package.json:44` (also `src/services/bookService.ts:1`) | New dependency `lodash` |
| B4 | T-3 | `tests/routes/book-search.test.ts:60` | `it.skip` on an approved test |
| B5 | S-5 | `src/views/books/book-grid.ejs:7` | Title printed unescaped with `<%- %>` |
| B6 | C-1 | `src/db/schema.sql:55` | `ALTER TABLE` adds a column |
| B7 | Q-2 | `src/services/bookService.ts:14` | `console.log` left in |

## Method

1. Each case was reviewed 3 times, with the reviewer given only the patch, a copy of the repo after the patch, the BOOK-101 briefing and test list, and the `code-review` skill. Case names were neutral, so the reviewer could not tell which patch was planted.
2. A finding counts as a hit for a planted bug when it is in the same file and within 3 lines of the planted line (or at the `also` location). It does not matter which rule id it cites.
3. Recall = planted bugs hit / planted bugs, summed over the runs. Precision = findings that are hits / all findings, summed over the runs. Several findings on the same bug all count as hits. Anything else counts against precision, with no exceptions. Findings that are true but unplanted are listed below.
4. The clean patch is run too: any finding there is a false alarm.

## Results (code-reviewer on sonnet, as shipped)

| Run | Planted found | Findings | Hits | Precision |
|---|---|---|---|---|
| 1 | 7/7 | 10 | 8 | 80% |
| 2 | 7/7 | 10 | 9 | 90% |
| 3 | 7/7 | 8 | 7 | 88% |
| **All** | **21/21 = 100% recall** | 28 | 24 | **85.7%** |
| Clean patch, 3 runs | | 0 | | 0 false alarms in 3 runs |

Misses: none. The four findings counted against precision:

- 3 on `src/db/index.ts` (`unicode_lower` is registered but unused). This is true: planting B1 replaced the only query that used it. Counted as a false positive anyway, because it is not a planted bug. On the clean patch the reviewer does not report it.
- 1 on `src/routes/books.ts:2` (A-4): the reviewer's own text says the finding "is dropped if" the import is only used by older handlers. It is. A real false positive.

## Lever: code-reviewer on haiku instead of sonnet

Same planted patch, 3 runs.

| Run | Planted found | Findings | Hits | Precision |
|---|---|---|---|---|
| 1 | 7/7 | 9 | 8 | 89% |
| 2 | 7/7 | 10 | 8 | 80% |
| 3 | 7/7 | 12 | 10 | 83% |
| **All** | **21/21 = 100% recall** | 31 | 26 | **83.9%** |

The 5 findings counted against precision are all true side effects of the planted bugs (`unicode_lower` unused in 3 runs; `SEARCH_QUERY_MAX_LENGTH` unused after B2 in 2 runs). Haiku did not return a clean-patch run: only the planted patch was tested.

## Limits of this eval

- The bugs are the kinds of mistakes the reviewer's own rules name, so 100% recall shows the rules are applied, not that subtle bugs are caught. A harder set (a wrong status code, an off-by-one at the length limit, an escaped `LIKE` wildcard) is the next step.
- One ticket, one set of bugs, three runs per case.
- The plugin was not loaded in the session that ran this, so each run used a general-purpose agent given the `code-reviewer` instructions and the `code-review` skill folder. Read-only was by instruction here, not by the agent's tool list.
