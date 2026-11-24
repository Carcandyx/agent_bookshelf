#!/usr/bin/env node
'use strict';
/*
 * ticket-to-merge guardrail (PreToolUse hook).
 *
 * Reads the tool call as JSON on stdin. Exit 0 allows it. Exit 2 blocks it and
 * sends stderr back to the agent as the reason.
 *
 * Four layers of rules, all in this file so they are easy to audit:
 *   1. Protected files (always): database, seed, schema, migrations, .env,
 *      dependency manifests, and this guardrail itself.
 *   2. Per-agent rules (by agent_type): the test-writer never edits outside
 *      tests/ and never reads the implementation, the implementor never edits
 *      tests/, reviewers and the criteria agents never edit anything.
 *   3. Per-stage rules (docs/tickets/.stage, written by the orchestrator).
 *   4. Git rules while shipping: explicit staging only, no force push, no push
 *      to main or master.
 *
 * Known limits (also in the README): a command that builds a protected file
 * name at run time (shell variables, base64) cannot be recognised. Bash
 * commands that merely read a protected file are allowed; any command that
 * both names a protected file and can write is blocked, even if it only
 * reads that file (use the Read tool instead).
 */
const fs = require('fs');
const path = require('path');

const STOP_MESSAGES = {
  SCHEMA:
    'This work needs a database schema change or a migration. Those are prohibited for tickets, and so is any workaround. STOP now and tell the engineer that this task has to go through a migration.',
  SEED: 'Seed data is protected. STOP now and tell the engineer.',
  DATABASE: 'The database files are protected. STOP now and tell the engineer.',
  ENV: 'Environment files are protected. STOP now and tell the engineer.',
  DEPENDENCY:
    'New or changed dependencies are prohibited, and that is worse than a migration. STOP now and tell the engineer that the task cannot be done without a new dependency.',
  GUARDRAIL: 'The guardrail and the Claude settings cannot be changed by an agent. STOP now and tell the engineer.',
  AGENT: 'That action is outside this agent role.',
  STAGE: 'That action is not allowed in the current pipeline stage.',
  GIT: 'That git command is not allowed while shipping a ticket.',
  BLIND: 'The test-writer must not read the implementation. Work from the briefing and the test list only.',
};

function deny(category, detail) {
  process.stderr.write(
    'BLOCKED by ticket-to-merge guardrail [' + category + ']: ' + detail + '\n' + STOP_MESSAGES[category] + '\n'
  );
  process.exit(2);
}

function readInput() {
  let raw = '';
  try {
    raw = fs.readFileSync(0, 'utf8');
  } catch (e) {
    raw = '';
  }
  if (!raw.trim()) return {};
  return JSON.parse(raw);
}

/* ---------- path handling ---------- */

function toPosix(p) {
  return String(p).replace(/\\/g, '/');
}

// Returns { rel, abs, outside } with rel lower-cased and posix-style.
function resolveTarget(raw, root) {
  let s = String(raw).trim().replace(/^["']+|["']+$/g, '');
  s = s.replace(/^\/([a-zA-Z])\/(?=.)/, (m, d) => d.toUpperCase() + ':/'); // git-bash: /c/x -> C:/x
  s = s.replace(/^~\//, '/home-dir/');
  const abs = path.resolve(root, s);
  let rel = toPosix(path.relative(root, abs));
  const outside = rel.startsWith('..') || /^[a-zA-Z]:/.test(rel);
  if (outside) rel = toPosix(abs);
  return { rel: rel.toLowerCase().replace(/\/+$/, ''), abs, outside };
}

function candidates(raw, root) {
  const out = [resolveTarget(raw, root)];
  try {
    const abs = out[0].abs;
    if (fs.existsSync(abs)) {
      const real = fs.realpathSync(abs);
      let rel = toPosix(path.relative(root, real));
      if (rel.startsWith('..')) rel = toPosix(real);
      out.push({ rel: rel.toLowerCase(), abs: real, outside: false });
    }
  } catch (e) {
    /* ignore */
  }
  return out;
}

function classify(rel) {
  const segs = rel.split('/').filter(Boolean);
  const base = segs[segs.length - 1] || '';
  if (segs.some((s) => /^migrations?$/.test(s))) return 'SCHEMA';
  if (base === 'seed.sql') return 'SEED';
  if (base.endsWith('.sql')) return 'SCHEMA';
  if (/^bookshelf\.db/.test(base) || /\.(db|sqlite|sqlite3)(-shm|-wal|-journal)?$/.test(base)) return 'DATABASE';
  if (base === '.env' || (base.startsWith('.env') && base !== '.env.example')) return 'ENV';
  if (['package.json', 'package-lock.json', 'npm-shrinkwrap.json', 'yarn.lock', 'pnpm-lock.yaml'].includes(rel)) {
    return 'DEPENDENCY';
  }
  if (rel.startsWith('ticket-to-merge/hooks/') || /(^|\/)\.claude\/settings(\.local)?\.json$/.test(rel)) {
    return 'GUARDRAIL';
  }
  return null;
}

function isUnder(rel, dir) {
  return rel === dir.replace(/\/$/, '') || rel.startsWith(dir.endsWith('/') ? dir : dir + '/');
}

function checkWritePath(raw, root, ctx) {
  for (const c of candidates(raw, root)) {
    const cat = classify(c.rel);
    if (cat) deny(cat, 'write to ' + c.rel);
    checkRolesAndStage(c.rel, ctx);
  }
}

function checkRolesAndStage(rel, ctx) {
  const a = ctx.agent;
  const inTests = isUnder(rel, 'tests');
  const inTickets = isUnder(rel, 'docs/tickets');
  if (a.endsWith('test-writer') && !inTests) deny('AGENT', 'test-writer may only write under tests/, not ' + rel);
  if (a.endsWith('implementor') && inTests) deny('AGENT', 'implementor must not edit tests (' + rel + ')');
  if (/(criteria-agent|gap-resolver|criteria-tester|code-reviewer|git-bot)$/.test(a)) {
    deny('AGENT', a + ' is not allowed to edit files (' + rel + ')');
  }
  const stage = ctx.stage;
  if (stage === 'test' && !inTests && !inTickets) deny('STAGE', 'stage "test" only allows writes under tests/ (' + rel + ')');
  if (stage === 'implement' && inTests) deny('STAGE', 'stage "implement" keeps tests/ read-only (' + rel + ')');
  if (['verify', 'review', 'ship'].includes(stage) && !inTickets) {
    deny('STAGE', 'stage "' + stage + '" only allows writes under docs/tickets/ (' + rel + ')');
  }
}

function checkReadPath(raw, root, ctx) {
  if (!ctx.agent.endsWith('test-writer')) return;
  for (const c of candidates(raw, root)) {
    if (/(^|\/)docs\/tickets\/[^/]+\/(implementation|plan)[^/]*$/.test(c.rel) || isUnder(c.rel, 'src/services')) {
      deny('BLIND', 'read of ' + c.rel);
    }
  }
}

/* ---------- Bash analysis ---------- */

const WRITE_VERBS = new RegExp(
  '(^|[\\s;&|(`"\'])(' +
    [
      'rm', 'mv', 'cp', 'tee', 'truncate', 'dd', 'touch', 'chmod', 'chown', 'ln', 'rsync', 'install',
      'del', 'erase', 'ren', 'rename', 'move', 'copy', 'rmdir', 'rd', 'mkdir',
      'sed\\s+(-[a-z]*i|--in-place)', 'perl\\s+-[a-z]*i',
      'set-content', 'add-content', 'out-file', 'remove-item', 'move-item', 'copy-item', 'new-item',
      'rename-item', 'clear-content', 'sc', 'ac',
      'git\\s+(checkout|restore|reset|stash|clean|rm|mv|apply|am|cherry-pick|merge|rebase|revert)',
      'sqlite3', 'sqlite',
    ].join('|') +
    ')(\\s|$)',
  'i'
);
const CODE_WRITES = /(fs\.(write|append|rm|unlink|rename|copy|truncate)\w*|writefile|appendfile|open\s*\(|\.write\s*\(|shutil|os\.(remove|rename)|unlink)/i;

const NAME_PATTERNS = [
  /(^|[\\/\s"'=:,(])schema\.sql\b/i,
  /(^|[\\/\s"'=:,(])seed\.sql\b/i,
  /\bbookshelf\.db\w*/i,
  /\.(sqlite3?|db)(-shm|-wal)?\b(?!\w)/i,
  /(^|[\\/\s"'=:,(])\.env(\.[\w.-]+)?(?=$|[\s"';|&)])/i,
  /(^|[\\/\s"'=:,(])migrations?[\\/]/i,
  /(^|[\\/\s"'=:,(])package(-lock)?\.json\b/i,
  /ticket-to-merge[\\/]hooks/i,
  /\.claude[\\/]settings(\.local)?\.json/i,
];

function splitTokens(cmd) {
  return cmd
    .split(/[\s;&|()<>`"']+/)
    .map((t) => t.replace(/^[=,:]+|[=,:]+$/g, ''))
    .filter(Boolean);
}

// Running the plugin's own stage helper or self-test only executes the guardrail
// folder, it does not change it. Remove exactly those invocations before the
// "names a protected file" checks, so a chained edit of a ticket document is not
// blocked just because the helper's path sits in the same command.
const SAFE_HOOK_CALL =
  /\bnode\s+(?:"[^"]*|'[^']*|[^\s;&|"']*)ticket-to-merge[\/]hooks[\/](?:stage|bypass-test)\.js["']?(?:\s+(?:set|clear|show)(?:\s+[\w.-]+){0,2})?/gi;

function checkBash(cmd, root, ctx) {
  const text = String(cmd).replace(SAFE_HOOK_CALL, ' node-hook-helper ');

  // Dependency changes through a package manager.
  const dep = text.match(/\b(npm|pnpm|yarn|bun)\s+(install|i|add|remove|rm|uninstall|update|upgrade|up)\b([^;&|\n]*)/i);
  if (dep) {
    const verb = dep[2].toLowerCase();
    const rest = dep[3].split(/\s+/).filter((t) => t && !t.startsWith('-'));
    const alwaysChanges = ['add', 'remove', 'rm', 'uninstall', 'update', 'upgrade', 'up'].includes(verb);
    if (alwaysChanges || rest.length > 0) deny('DEPENDENCY', 'package manager command: ' + dep[0].trim());
  }

  const writes = WRITE_VERBS.test(text) || CODE_WRITES.test(text);
  const redirects = [];
  const redirRe = /(?:^|[^\w=-])(?:\d?>>?|&>>?)\s*("[^"]+"|'[^']+'|[^\s;&|]+)/g;
  let m;
  while ((m = redirRe.exec(text))) redirects.push(m[1]);
  const teeRe = /\btee\b(?:\s+-\w+)*\s+("[^"]+"|'[^']+'|[^\s;&|]+)/gi;
  while ((m = teeRe.exec(text))) redirects.push(m[1]);

  // Redirect or tee targets are always checked precisely.
  for (const target of redirects) {
    if (/^&\d$/.test(target) || target === '/dev/null' || target.toLowerCase() === 'nul') continue;
    checkWritePath(target, root, ctx);
  }

  if (writes) {
    for (const re of NAME_PATTERNS) {
      if (re.test(text)) deny(classifyName(re), 'command names a protected file and can write: ' + text.slice(0, 160));
    }
    for (const tok of splitTokens(text)) {
      if (!/[\\/.]/.test(tok)) continue;
      for (const c of candidates(tok, root)) {
        const cat = classify(c.rel);
        if (cat) deny(cat, 'command can write to ' + c.rel);
        if (ctx.agent.endsWith('implementor') && isUnder(c.rel, 'tests')) {
          deny('AGENT', 'implementor must not change tests (' + c.rel + ')');
        }
        if (ctx.stage === 'implement' && isUnder(c.rel, 'tests')) {
          deny('STAGE', 'stage "implement" keeps tests/ read-only (' + c.rel + ')');
        }
        if (ctx.agent.endsWith('test-writer') && c.rel && !isUnder(c.rel, 'tests') && /\.[a-z]+$/.test(c.rel) && !c.outside) {
          if (!/(node_modules|\.vitest|\/tmp\/)/.test(c.rel)) deny('AGENT', 'test-writer may only write under tests/ (' + c.rel + ')');
        }
      }
    }
  }

  checkGit(text, ctx);
}

function classifyName(re) {
  const s = re.source;
  if (s.includes('schema')) return 'SCHEMA';
  if (s.includes('seed')) return 'SEED';
  if (s.includes('bookshelf') || s.includes('sqlite')) return 'DATABASE';
  if (s.includes('\\.env')) return 'ENV';
  if (s.includes('migrations')) return 'SCHEMA';
  if (s.includes('package')) return 'DEPENDENCY';
  return 'GUARDRAIL';
}

function checkGit(text, ctx) {
  const shipping = ctx.stage === 'ship' || ctx.agent.endsWith('git-bot');
  if (!shipping) return;
  if (/\bgit\s+add\b[^;&|\n]*(\s-A\b|\s--all\b|\s-u\b|\s--update\b|\s\.(\s|$)|\s:\/|\s\*(\s|$))/i.test(text)) {
    deny('GIT', 'stage explicit files only, never git add -A / . / -u');
  }
  if (/\bgit\s+commit\b[^;&|\n]*(--no-verify|\s-n\b|--no-gpg-sign)/i.test(text)) {
    deny('GIT', 'commit hooks and signing must not be skipped');
  }
  const push = text.match(/\bgit\s+push\b([^;&|\n]*)/i);
  if (push) {
    if (/(\s--force\b|\s-f\b|--force-with-lease|\s\+\S)/i.test(push[1])) deny('GIT', 'force push is not allowed');
    if (/(^|\s|:)(main|master)(\s|$)/i.test(push[1])) deny('GIT', 'pushing to main or master is not allowed');
  }
}

/* ---------- main ---------- */

function readStage(root) {
  try {
    const raw = fs.readFileSync(path.join(root, 'docs', 'tickets', '.stage'), 'utf8');
    const j = JSON.parse(raw);
    return String(j.stage || '').toLowerCase();
  } catch (e) {
    return '';
  }
}

function main() {
  let input;
  try {
    input = readInput();
  } catch (e) {
    process.stderr.write('ticket-to-merge guardrail could not parse its input, so it blocks by default: ' + e.message + '\n');
    process.exit(2);
  }
  const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  const tool = input.tool_name || '';
  const ti = input.tool_input || {};
  const ctx = { agent: String(input.agent_type || '').toLowerCase(), stage: readStage(root) };

  if (tool === 'Bash') {
    checkBash(ti.command || '', root, ctx);
  } else if (tool === 'Read') {
    if (ti.file_path) checkReadPath(ti.file_path, root, ctx);
  } else if (['Edit', 'Write', 'MultiEdit', 'NotebookEdit'].includes(tool)) {
    const target = ti.file_path || ti.notebook_path || ti.path;
    if (target) checkWritePath(target, root, ctx);
  }
  process.exit(0);
}

main();
