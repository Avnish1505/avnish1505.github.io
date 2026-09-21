// Verifies that every number on the site still matches its evidence.
// Runs in CI before the build. Needs Node 22.18+ (TypeScript type stripping).
//
//   line     download the file at the pinned commit, check `match` is on that line
//   file     check the file or folder exists at the pinned commit
//   commit   check the commit exists
//   derived  check the input files exist and a derivation is written down
//            (re-run the numbers with scripts/derive/*.py)

import { claims, sourceUrl } from '../src/data/claims.ts';

const OWNER = 'Avnish1505';
const raw = (repo, sha, path) => `https://raw.githubusercontent.com/${OWNER}/${repo}/${sha}/${path}`;
const cache = new Map();

async function getText(url) {
  if (!cache.has(url)) {
    cache.set(url, (async () => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return res.text();
    })());
  }
  return cache.get(url);
}

async function exists(url) {
  const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
  return res.ok;
}

const failures = [];
let checked = 0;

for (const [id, c] of Object.entries(claims)) {
  const s = c.source;
  try {
    if (s.kind === 'line') {
      const lines = (await getText(raw(s.repo, s.sha, s.path))).split('\n');
      const text = lines[s.line - 1] ?? '';
      const nums = (c.value.match(/[−+-]?\d[\d,.]*\d|\d/g) ?? []).map((n) => n.replace(/^[+−-]/, ''));
      const missing = nums.filter((n) => !s.match.includes(n));
      if (missing.length) {
        failures.push(`${id}: value "${c.value}" has ${missing.join(', ')} which is not in the match text "${s.match}"`);
      }
      if (!text.includes(s.match)) {
        failures.push(`${id}: line ${s.line} of ${s.repo}/${s.path} does not contain "${s.match}"\n    found: ${text.trim().slice(0, 160)}`);
      }
    } else if (s.kind === 'file') {
      const url = s.tree ? sourceUrl(s) : raw(s.repo, s.sha, s.path);
      if (!(await exists(url))) failures.push(`${id}: ${s.path} not found at ${s.sha.slice(0, 7)}`);
    } else if (s.kind === 'commit') {
      if (!(await exists(sourceUrl(s)))) failures.push(`${id}: commit ${s.sha.slice(0, 7)} not found`);
    } else if (s.kind === 'derived') {
      if (!s.derivation || !s.script) failures.push(`${id}: derived claim needs a derivation and a script`);
      for (const input of s.inputs) {
        if (!(await exists(raw(s.repo, s.sha, input)))) failures.push(`${id}: input ${input} not found`);
      }
    }
    checked++;
  } catch (err) {
    failures.push(`${id}: ${err.message}`);
  }
}

if (failures.length) {
  console.error(`\n✗ ${failures.length} claim(s) no longer match their evidence:\n`);
  for (const f of failures) console.error('  - ' + f);
  console.error('\nFix the value, the line number, or the pinned sha in src/data/claims.ts.\n');
  process.exit(1);
}
console.log(`✓ ${checked} claims match their pinned evidence.`);
