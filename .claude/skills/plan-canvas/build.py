#!/usr/bin/env python3
"""Validate a plan file and write the finished plan page.

Usage: build.py PLAN.json OUTPUT.html [--standalone]

--standalone wraps the page in a document skeleton so it opens straight from disk (for testing).
Without it the output is what the Artifact tool expects: no <html>, <head> or <body>.
"""
import html
import json
import re
import sys
from pathlib import Path

STATUSES = {"U", "M"}
KINDS = {"function", "variable", "constant", "class", "route", "config"}
VISIBILITIES = {"", "public", "private"}
ID_PATTERN = re.compile(r"^[A-Za-z0-9_.:\-]+$")


def validate(plan):
    errors = []

    def need(condition, message):
        if not condition:
            errors.append(message)

    for field in ("name", "title", "context"):
        need(isinstance(plan.get(field), str) and plan[field].strip(), f"'{field}' is required and must be text")
    name_words = len(str(plan.get("name", "")).split())
    need(2 <= name_words <= 4, "'name' is the browser-tab title and must be two to four words")
    need(isinstance(plan.get("files"), list) and plan["files"], "'files' must be a non-empty list")
    layers = plan.get("layers", [])
    need(isinstance(layers, list) and layers, "'layers' must be a non-empty list of lane names, left to right")

    ids = {}
    for index, actor in enumerate(plan.get("actors", [])):
        where = f"actors[{index}]"
        need(isinstance(actor.get("id"), str) and ID_PATTERN.match(actor.get("id", "")), f"{where}: 'id' is required (letters, digits, . _ : -)")
        need(isinstance(actor.get("label"), str) and actor.get("label"), f"{where}: 'label' is required")
        if actor.get("id") in ids:
            errors.append(f"{where}: duplicate id '{actor['id']}'")
        ids[actor.get("id")] = "actor"
        need(0 <= actor.get("layer", 0) < max(len(layers), 1), f"{where}: 'layer' must index into 'layers'")

    for index, file in enumerate(plan.get("files", [])):
        where = f"files[{index}]"
        need(isinstance(file.get("id"), str) and ID_PATTERN.match(file.get("id", "")), f"{where}: 'id' is required (letters, digits, . _ : -)")
        need(isinstance(file.get("path"), str) and file.get("path"), f"{where}: 'path' is required")
        need(file.get("status") in STATUSES, f"{where} ({file.get('id')}): 'status' must be \"U\" (new) or \"M\" (modified)")
        need(isinstance(file.get("purpose"), str) and file.get("purpose", "").strip(), f"{where} ({file.get('id')}): 'purpose' is required, one sentence")
        need(isinstance(file.get("layer"), int) and 0 <= file.get("layer", -1) < max(len(layers), 1), f"{where} ({file.get('id')}): 'layer' must be an index into 'layers'")
        if file.get("id") in ids:
            errors.append(f"{where}: duplicate id '{file['id']}'")
        ids[file.get("id")] = "file"
        for child_index, child in enumerate(file.get("children", [])):
            child_where = f"{where}.children[{child_index}]"
            need(isinstance(child.get("name"), str) and child.get("name"), f"{child_where}: 'name' is required")
            child_id = child.get("id") or f"{file.get('id')}.{child.get('name')}"
            need(bool(ID_PATTERN.match(child_id)), f"{child_where}: id '{child_id}' has characters outside letters, digits, . _ : - (set an explicit 'id')")
            need(child.get("status") in STATUSES, f"{child_where} ({child_id}): 'status' must be \"U\" or \"M\"")
            need(child.get("kind", "function") in KINDS, f"{child_where} ({child_id}): 'kind' must be one of {sorted(KINDS)}")
            need(child.get("visibility", "") in VISIBILITIES, f"{child_where} ({child_id}): 'visibility' must be public or private, or left out")
            if child_id in ids:
                errors.append(f"{child_where}: duplicate id '{child_id}'")
            ids[child_id] = "child"
            if file.get("status") == "U" and child.get("status") == "M":
                errors.append(f"{child_where} ({child_id}): a modified element cannot live in a new file")

    for index, flow in enumerate(plan.get("flows", [])):
        where = f"flows[{index}]"
        for end in ("from", "to"):
            need(flow.get(end) in ids, f"{where}: '{end}' = {flow.get(end)!r} is not a file, element or actor id")
        need(flow.get("from") != flow.get("to"), f"{where}: an arrow cannot start and end at the same id")
    need(len(plan.get("flows", [])) > 0, "'flows' needs at least one arrow, otherwise there is no data flow to show")
    return errors


def main():
    args = [arg for arg in sys.argv[1:] if not arg.startswith("--")]
    standalone = "--standalone" in sys.argv
    if len(args) != 2:
        print(__doc__)
        return 2
    plan_path, out_path = Path(args[0]), Path(args[1])
    plan = json.loads(plan_path.read_text(encoding="utf-8"))
    errors = validate(plan)
    if errors:
        print(f"{plan_path}: {len(errors)} problem(s)")
        for error in errors:
            print(f"  - {error}")
        return 1
    template = (Path(__file__).parent / "viewer.html").read_text(encoding="utf-8")
    # '<' is escaped so a plan can never close the script tag it is embedded in.
    payload = json.dumps(plan, ensure_ascii=False).replace("<", "\\u003c")
    page = template.replace("__NAME__", html.escape(plan["name"])).replace("__PLAN_JSON__", payload)
    if standalone:
        page = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' + page + "</head></html>"
    out_path.write_text(page, encoding="utf-8")
    files = len(plan["files"])
    elements = sum(len(file.get("children", [])) for file in plan["files"])
    print(f"ok: {files} files, {elements} elements, {len(plan['flows'])} arrows -> {out_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
