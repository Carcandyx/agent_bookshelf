#!/usr/bin/env node
'use strict';
/*
 * Stop hook. While the pipeline is in the "ship" stage, the session cannot
 * finish unless the test suite passes. In every other stage (and outside a
 * ticket run) it does nothing, so waiting for the user between steps is never
 * interrupted and red tests are allowed while tests-first work is in progress.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

let input = {};
try {
  const raw = fs.readFileSync(0, 'utf8');
  if (raw.trim()) input = JSON.parse(raw);
} catch (e) {
  process.exit(0);
}

// Avoid an endless loop: if we already forced one more turn, let it stop.
if (input.stop_hook_active) process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
let stage = '';
try {
  stage = String(JSON.parse(fs.readFileSync(path.join(root, 'docs', 'tickets', '.stage'), 'utf8')).stage || '');
} catch (e) {
  process.exit(0);
}
if (stage !== 'ship') process.exit(0);

const r = spawnSync('npm run test:run', { cwd: root, shell: true, encoding: 'utf8', timeout: 280000 });
if (r.status === 0) process.exit(0);

const tail = ((r.stdout || '') + (r.stderr || '')).split('\n').slice(-40).join('\n');
process.stderr.write(
  'ticket-to-merge stop gate: npm run test:run is failing, so the ticket cannot be shipped yet.\n' +
    'Fix the failures (through the implementor), then try again.\n\n' +
    tail +
    '\n'
);
process.exit(2);
