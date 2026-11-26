# Compiled eval results: bookshelf-flow

Source: four run folders in `evals/results` (2026-11-26 UTC): `19-03` cases 1-16 (judge opus, -j 2, interrupted in case 17), `19-31` case 17, `19-35` case 18, `19-39` cases 19-24 (judge haiku). Main model claude-sonnet-5-5, agents on sonnet, 3 runs per arm, ablation with-without, Claude Code 2.1.332.

| # | Case | With | Without | Delta | Runs at 1.00 (with / without) | Agent fired (plugin arm) | Cost with / without (USD, incl. judge) | Judge |
|---|---|---|---|---|---|---|---|---|
| 01 | researcher-validate-patch-book | 1.00 | 1.00 | 0.00 | 3/3 , 3/3 | 3/3 | 0.58 / 0.52 | opus |
| 02 | researcher-404-reviews-by-book | 1.00 | 1.00 | 0.00 | 3/3 , 3/3 | 3/3 | 0.54 / 0.38 | opus |
| 03 | researcher-needs-migration | 0.60 | 0.60 | 0.00 | 0/3 , 0/3 | 3/3 | 0.60 / 0.62 | opus |
| 04 | researcher-needs-library | 0.33 | 0.33 | 0.00 | 0/3 , 0/3 | 3/3 | 0.51 / 0.38 | opus |
| 05 | researcher-vague-request | 0.00 | 0.00 | 0.00 | 0/3 , 0/3 | 3/3 | 0.51 / 0.48 | opus |
| 06 | neg-researcher-listing-question | 1.00 | 1.00 | 0.00 | 3/3 , 3/3 | n/a (not-fire case) | 0.18 / 0.20 | opus |
| 07 | implementer-follows-plan | 1.00 | 1.00 | 0.00 | 3/3 , 3/3 | 1/3 | 0.30 / 0.27 | opus |
| 08 | implementer-stops-missing-function | 1.00 | 1.00 | 0.00 | 3/3 , 3/3 | 3/3 | 0.19 / 0.20 | opus |
| 09 | implementer-stops-missing-route | 1.00 | 1.00 | 0.00 | 3/3 , 3/3 | 3/3 | 0.19 / 0.14 | opus |
| 10 | implementer-no-extras | 1.00 | 1.00 | 0.00 | 3/3 , 3/3 | 0/3 | 0.24 / 0.23 | opus |
| 11 | implementer-db-wrapper | 1.00 | 1.00 | 0.00 | 3/3 , 3/3 | 2/3 | 0.21 / 0.17 | opus |
| 12 | neg-implementer-write-tests | 0.67 | 0.89 | -0.22 | 0/3 , 2/3 | n/a (not-fire case) | 1.33 / 1.81 | opus |
| 13 | test-writer-follows-plan-not-impl | 1.00 | 1.00 | 0.00 | 3/3 , 3/3 | 3/3 | 1.32 / 1.80 | opus |
| 14 | test-writer-flags-impacted-test | 0.00 | 0.00 | 0.00 | 0/3 , 0/3 | 3/3 | 1.15 / 1.78 | opus |
| 15 | test-writer-no-backfill | 1.00 | 1.00 | 0.00 | 3/3 , 3/3 | 3/3 | 1.00 / 1.15 | opus |
| 16 | test-writer-non-trivial | 0.67 | 0.33 | +0.33 | 2/3 , 1/3 | 3/3 | 1.57 / 1.51 | opus |
| 17 | test-writer-honest-counts | 1.00 | 1.00 | 0.00 | 3/3 , 3/3 | 3/3 | 0.42 / 0.26 | haiku |
| 18 | neg-test-writer-implement | 1.00 | 1.00 | 0.00 | 3/3 , 3/3 | n/a (not-fire case) | 0.14 / 0.13 | haiku |
| 19 | reviewer-htmx-target | 0.80 | 0.27 | +0.53 | 0/3 , 0/3 | 3/3 | 0.29 / 0.23 | haiku |
| 20 | reviewer-unsaved-write | 0.80 | 0.40 | +0.40 | 0/3 , 0/3 | 3/3 | 0.35 / 0.28 | haiku |
| 21 | reviewer-error-surface | 0.80 | 0.13 | +0.67 | 0/3 , 0/3 | 3/3 | 0.31 / 0.21 | haiku |
| 22 | reviewer-clean-diff | 0.58 | 0.50 | +0.08 | 0/3 , 0/3 | 3/3 | 0.28 / 0.18 | haiku |
| 23 | reviewer-repo-standards | 0.87 | 0.13 | +0.73 | 1/3 , 0/3 | 3/3 | 0.34 / 0.26 | haiku |
| 24 | neg-reviewer-comment-edit | 1.00 | 1.00 | 0.00 | 3/3 , 3/3 | n/a (not-fire case) | 0.10 / 0.10 | haiku |

Mean score: with 0.80, without 0.69, delta +0.11. Runs at 1.00: 42/72 in both arms. Errors: 0.
Spend: USD 26.04 across the four folders (25.95 for the 24 completed cases + 0.09 for the interrupted first attempt at case 17). Judge cost inside that: about USD 14.40 opus (cases 1-16), about USD 0.08 haiku (cases 17-24).
Group deltas: researcher 0.00, implementer -0.04, test-writer +0.06, reviewer +0.40.
