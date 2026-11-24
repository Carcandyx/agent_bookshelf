#!/usr/bin/env node
'use strict';
/*
 * Writes or clears the pipeline stage marker that protect.js and stop-gate.js read.
 *
 *   node stage.js set <TICKET-ID> <stage>   stage: briefing | test | implement | verify | review | ship
 *   node stage.js clear
 *   node stage.js show
 *
 * The marker lives at docs/tickets/.stage in the project. If a run is abandoned
 * and the marker blocks normal editing, run "node stage.js clear" (or delete the file).
 */
const fs = require('fs');
const path = require('path');

const STAGES = ['briefing', 'test', 'implement', 'verify', 'review', 'ship'];
const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const file = path.join(root, 'docs', 'tickets', '.stage');
const [cmd, ticket, stage] = process.argv.slice(2);

if (cmd === 'set') {
  if (!ticket || !STAGES.includes(stage)) {
    console.error('usage: stage.js set <TICKET-ID> <' + STAGES.join('|') + '>');
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify({ ticket, stage, at: new Date().toISOString() }, null, 2) + '\n');
  console.log('stage = ' + stage + ' (' + ticket + ')');
} else if (cmd === 'clear') {
  try {
    fs.unlinkSync(file);
    console.log('stage marker cleared');
  } catch (e) {
    console.log('no stage marker');
  }
} else if (cmd === 'show') {
  try {
    console.log(fs.readFileSync(file, 'utf8').trim());
  } catch (e) {
    console.log('no stage marker');
  }
} else {
  console.error('usage: stage.js set <TICKET-ID> <stage> | clear | show');
  process.exit(1);
}
