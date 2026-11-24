# Severity

| Severity | Use when | Typical rules |
|---|---|---|
| high | The change can break security or data, ignores a hard constraint, or fails a criterion. It should not be merged as is. | S-1, S-3, S-4, C-1, C-2, C-3, C-4, T-3 |
| medium | The change breaks the architecture or leaves a promise untested. It works today but is wrong by the project's own rules. | A-1 to A-6, S-2, S-5, T-1, T-2, T-4 |
| low | A real but small problem. | Q-1 to Q-4 |

For the user's own checks, use the severity written in the row. If the row has none, use medium.

If you are unsure between two levels, pick the lower one. If you are unsure whether it is a problem at all, do not report it.
