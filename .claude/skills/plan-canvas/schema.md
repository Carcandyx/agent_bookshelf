# Plan file format

One JSON file per plan. `build.py` validates it and prints every problem at once.

```json
{
  "id": "abc-123-shelf-count",
  "name": "Shelf Count Plan",
  "title": "ABC-123: show how many books are on each shelf",
  "meta": ["Branch: ticket/ABC-123-shelf-count", "Nothing is committed until you say so"],
  "context": "One short paragraph: what this change is for and why.",
  "layers": ["Caller", "Controller", "Service", "Repository", "View"],
  "actors": [{ "id": "browser", "label": "Browser", "layer": 0, "purpose": "Optional tooltip." }],
  "files": [ ... ],
  "flows": [ ... ]
}
```

| Field | Rule |
|---|---|
| `id` | Stable slug. Keys the user's saved notes in their browser. Keep it the same when you republish a revised plan. |
| `name` | Two to four words. It is the browser-tab title. |
| `title` | The page heading. May carry a ticket key. |
| `meta` | Optional short strings shown under the heading (repos, branch, "nothing committed"). |
| `context` | Section 1. One short paragraph in plain words: the purpose, not the file list. |
| `layers` | Lane names, left to right, in the order data flows. Pick what fits the change (for example Caller, Route, Controller, Service, Client, Store, Config). Five to six is the most that stays readable. |
| `actors` | Optional. Things outside the plan that start or receive the flow (a front end, a job, a person). Shown as dashed pills. Not files, so they cannot be merged. |

## File

```json
{
  "id": "service",
  "path": "src/services/shelfService.ts",
  "status": "U",
  "layer": 3,
  "purpose": "One sentence: what this file is for. Shown in the tooltip.",
  "children": [ ... ]
}
```

- `status`: `"U"` new file, `"M"` modified file. Nothing else. A deleted file is not part of this version: say so in `context`.
- `layer`: index into `layers`. Files in the same layer stack top to bottom in the order given.
- `path`: repo-relative. For a modified file it must exist. Check before writing the plan.

## Child (a function, variable, constant, class, route or config entry)

```json
{
  "id": "service.summary",
  "name": "getShelfSummary",
  "signature": "(userId: unknown)",
  "kind": "function",
  "visibility": "public",
  "status": "U",
  "purpose": "What it does or what changes in it."
}
```

- `id`: optional; defaults to `<file id>.<name>`. Set it when the name has spaces or odd characters. Ids are unique across files, children and actors.
- `kind`: `function`, `variable`, `constant`, `class`, `route`, `config`.
- `visibility`: `public`, `private`, or leave out when it does not apply (routes, env variables).
- `status`: `U` or `M`. A `U` file holds only `U` children.
- **In a modified file list only the elements being added or changed.** Never list the whole file.
- `signature` is optional and short. It is shown muted, after the name.

## Flow (an arrow)

```json
{ "from": "route.list", "to": "service.summary", "label": "calls" }
```

`from` and `to` are file ids, child ids or actor ids. Prefer child ids: the arrow then leaves from the element's row and follows the element when the user moves it to another file. Labels are two to four words. Arrows follow the request and data flow, from the caller to the callee, or from a source of config to its reader. The overview collapses child arrows to file level.
