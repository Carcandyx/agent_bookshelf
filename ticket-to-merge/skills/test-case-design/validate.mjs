#!/usr/bin/env node
// Validates a tests JSON file and, when a briefing is given, checks that every
// acceptance criterion in the briefing is covered.
//   node validate.mjs <tests.json> [briefing.md]
// Exit 0 when valid, 1 with a list of problems otherwise. No network, no writes.
import fs from 'node:fs';

const [src, briefingPath] = process.argv.slice(2);
if (!src) {
  console.error('usage: node validate.mjs <tests.json> [briefing.md]');
  process.exit(1);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(src, 'utf8'));
} catch (e) {
  console.error('Cannot read ' + src + ': ' + e.message);
  process.exit(1);
}

const problems = [];
const TYPES = ['happy', 'validation', 'boundary', 'security', 'regression'];
const LIKE = ['common', 'occasional', 'rare'];

if (!data.ticket) problems.push('missing "ticket"');
if (!Number.isInteger(data.revision) || data.revision < 1) problems.push('"revision" must be an integer >= 1');
if (!Array.isArray(data.tests) || data.tests.length === 0) problems.push('"tests" must be a non-empty array');

const ids = new Set();
for (const t of data.tests || []) {
  const where = t.id || '(no id)';
  if (!/^TC-\d{2,}$/.test(t.id || '')) problems.push(where + ': id must look like TC-01');
  if (ids.has(t.id)) problems.push(where + ': duplicate id');
  ids.add(t.id);
  for (const f of ['title', 'what', 'expected']) if (!t[f]) problems.push(where + ': missing ' + f);
  if (!Array.isArray(t.criteria) || t.criteria.length === 0) problems.push(where + ': criteria must list at least one AC id');
  if (!TYPES.includes(t.type)) problems.push(where + ': type must be one of ' + TYPES.join(', '));
  if (!LIKE.includes(t.likelihood)) problems.push(where + ': likelihood must be one of ' + LIKE.join(', '));
}

const rare = (data.tests || []).filter((t) => t.likelihood === 'rare').length;
if (data.tests && rare * 4 > data.tests.length) problems.push('more than one in four tests is rare (' + rare + ' of ' + data.tests.length + ')');

const covered = new Set((data.coverage || []).flatMap((c) => c.tests || []));
for (const t of data.tests || []) if (!covered.has(t.id)) problems.push(t.id + ': not listed in coverage');
for (const c of data.coverage || []) {
  if (!c.criterion) problems.push('coverage row without criterion');
  if ((!c.tests || c.tests.length === 0) && !c.note) problems.push(c.criterion + ': no tests and no note explaining why');
  for (const id of c.tests || []) if (!ids.has(id)) problems.push(c.criterion + ': unknown test ' + id);
}

for (const key of ['assumptions', 'left_out']) {
  if (!Array.isArray(data[key])) problems.push('"' + key + '" must be an array (use [] when empty)');
}

if (briefingPath) {
  let md = '';
  try {
    md = fs.readFileSync(briefingPath, 'utf8');
  } catch (e) {
    problems.push('Cannot read briefing ' + briefingPath + ': ' + e.message);
  }
  const acIds = [...new Set([...md.matchAll(/^\|\s*(AC-\d{2,})\s*\|/gm)].map((m) => m[1]))];
  if (md && acIds.length === 0) problems.push('no AC rows found in the briefing');
  const rows = new Map((data.coverage || []).map((c) => [c.criterion, c]));
  for (const ac of acIds) {
    const row = rows.get(ac);
    if (!row) problems.push(ac + ': in the briefing but missing from coverage');
    else if ((!row.tests || row.tests.length === 0) && !row.note) problems.push(ac + ': no test and no note');
  }
  for (const c of rows.keys()) if (acIds.length && !acIds.includes(c)) problems.push(c + ': in coverage but not in the briefing');
}

if (problems.length) {
  console.error('Problems in ' + src + ':\n- ' + problems.join('\n- '));
  process.exit(1);
}
console.log('OK: ' + data.tests.length + ' tests, revision ' + data.revision + (briefingPath ? ', every briefing criterion covered' : ''));
