---
name: plan-canvas
description: Turn an implementation plan into a standard, interactive artifact: a context paragraph, a diagram with one card per file to create (U) or modify (M) showing the request and data flow, and a drag-and-drop canvas where the user can move functions between files, merge elements or files, and generate a prompt of the changes. Use when the user asks for a plan as an artifact, for the files you plan to change before you implement, to visualise or review a plan, or says "plan canvas".
---

# Plan canvas

One fixed viewer, one small data file per plan. You never write the viewer again: you write `plan.json`, build it, and publish the result. The look is the same every time because only the data changes.

Files in this skill (all next to this file):

| File | What |
|---|---|
| `viewer.html` | The viewer template. Do not edit it for a single plan. Fix it only when the viewer itself has a bug, and say so. |
| `build.py` | `python3 build.py plan.json plan.html` validates the plan and writes the page. Prints every problem at once. |
| `schema.md` | The plan format. Read it before writing a plan. |
| `example/example.plan.json` | A complete example plan for an invented ticket: 5 files, 7 elements, 7 arrows. Copy its shape, not its content. |

## Steps

1. **Gather facts first.** Read the code the plan touches. Every `M` file must exist at that path, and every `M` element must exist in it (or be named as new). Do not invent function names for existing code: grep for them. Plan names for new elements are yours to choose.
2. **Write the plan** to the scratchpad directory (not the repo) as `<slug>.plan.json`, following `schema.md`.
   - Context is one short paragraph in plain words.
   - A card per file. For modified files list only the elements that change.
   - Choose lanes that follow the data flow. Put the entry point on the left.
   - Prefer arrows between elements, not just files, so moves re-route correctly.
   - Leave test files out unless the user asks, and say in the context that specs accompany each change.
3. **Build:** (use `python` where `python3` is not installed, as on Windows) `python3 .claude/skills/plan-canvas/build.py <slug>.plan.json <slug>.html`. Fix every reported problem. Do not publish a plan that fails validation.
4. **Publish** the built `.html` with the Artifact tool. Load the `artifact-design` skill first, as the tool requires. Use the plan's `name` as the title, `icon: "diagram"`, and a one-sentence description. The file is already a complete page; do not wrap or edit it. Keep the same file path on later revisions so the link stays.
5. **Tell the user** the link and, in a few lines, what the plan contains. Do not implement anything. State what you could not check.

## When the user pastes the generated prompt back

The prompt lists structural changes the user made on the canvas, plus their notes. Treat each as a change to the plan:

- **Merge files:** the dropped-on file keeps its path. Move the other file's elements into it and remove its card.
- **Move elements:** move the child to the other file's `children`. Callers now cross files, so update the arrows.
- **Merge elements:** the merged element takes the name of the one it was dropped on. Remove the other, and point its arrows at the survivor.
- **Delete elements:** the user gave how it is deleted and what replaces its logic. Remove the element and put the replacement logic where they said (add or change an element there). A deleted new (`U`) element is simply dropped.
- **Notes:** answer questions with evidence from the repo. When a note asks whether something follows the repo's convention, check the code and say what you found. If the convention differs, change the plan to follow it and say so clearly.

Then:
1. Update the plan JSON. Ids may change when an element moves files (`<file id>.<name>`); that is fine, because the notes they typed have been acted on.
2. Re-run `build.py` and republish to the same URL.
3. Say what you changed, and anything a change forces that they might not expect (a private function that must become public, a caller that now crosses files, a spec that moves).
4. Do not implement until they confirm.

## Rules

- Never put secrets, tokens, customer data or internal URLs in a plan. It is published as a private page, but treat it as shared.
- The page is private by default. Do not share it beyond the user unless they ask.
- If the user asks for something the viewer cannot show (deleted files, three-way flows, a different diagram), say so and offer a text plan instead of bending the schema.
- Interactions the viewer supports: hover for the purpose; click a card or element to open a bottom drawer (Esc or Close dismisses it) with its purpose, a note box, and for elements a delete flow that requires both how it is deleted and what replaces its logic; drag a card by its header to move it; drop a card on another card to merge files; drag an element onto another card to move it, or onto another element to merge them (the target's name survives); pan by dragging the background; zoom with the buttons, Ctrl or ⌘ plus scroll, or a pinch; Undo, Reset, Tidy layout, Fit. The prompt is generated only when the user presses the button, from the net difference between the plan and the final layout.
