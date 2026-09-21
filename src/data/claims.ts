/**
 * Every number shown on the site is defined here, once, with its evidence.
 *
 * Source kinds
 *   line     a line in a file at a pinned commit. `scripts/check-claims.mjs`
 *            downloads that exact file and fails if `match` is not on that line.
 *   file     a file or folder at a pinned commit (existence is checked).
 *   commit   a commit (existence is checked).
 *   derived  computed by a script from committed artifacts. `derivation` says how,
 *            and the script is re-runnable.
 *
 * Pinned commits never change, so a link here keeps pointing at the evidence even
 * after the project repos move on. When a project changes, update the sha, the
 * line, and the value together, then run `npm run check:claims`.
 */

const OWNER = 'Avnish1505';

export const commits = {
  omitbench: '596f9f4ee4f7a4f06a738ccc1df0facdc96753fb',
  omitbenchBlog: 'ed0ee642f03386bab2fcd2da605253e9215e9699',
  aegisops: 'd1839cd456166e720f0354fb5c6be63752b2a794',
  cancerFusion: 'a5699d2e2167f357d8035fad2b51b9bf4b391ee5',
} as const;

type LineSource = { kind: 'line'; repo: string; sha: string; path: string; line: number; match: string };
type FileSource = { kind: 'file'; repo: string; sha: string; path: string; tree?: boolean };
type CommitSource = { kind: 'commit'; repo: string; sha: string };
type DerivedSource = {
  kind: 'derived';
  repo: string;
  sha: string;
  inputs: string[];
  script: string;
  derivation: string;
};
export type Source = LineSource | FileSource | CommitSource | DerivedSource;
export type Claim = { value: string; label: string; source: Source };

const line = (repo: string, sha: string, path: string, n: number, match: string): LineSource => ({
  kind: 'line', repo, sha, path, line: n, match,
});

const OB = (n: number, match: string) => line('Omitbench', commits.omitbench, 'README.md', n, match);
const OBB = (n: number, match: string) => line('omitbench-engineering-blog', commits.omitbenchBlog, 'README.md', n, match);
const AE = (path: string, n: number, match: string) => line('aegisops-ai', commits.aegisops, path, n, match);
const CF = (n: number, match: string) => line('cancer-fusion-ai', commits.cancerFusion, 'README.md', n, match);

const CF_DERIVED = (derivation: string, split: 'val' | 'test'): DerivedSource => ({
  kind: 'derived',
  repo: 'cancer-fusion-ai',
  sha: commits.cancerFusion,
  inputs: [
    `reports/calibration/cache/${split}_logits.pt`,
    `reports/calibration/cache/${split}_labels.pt`,
  ],
  script: 'scripts/derive/cancer_fusion_metrics.py',
  derivation,
});

export const claims = {
  // ── OmitBench ────────────────────────────────────────────────────────────
  'ob.instances': { value: '310', label: 'benchmark instances', source: OB(32, '(n=310)') },
  'ob.libraries': { value: '8', label: 'Python libraries in the corpus', source: OBB(31, 'from 8 mature Python repositories') },
  'ob.requirements': { value: '2,184', label: 'requirements scored per detector', source: OBB(31, '2,184 requirements scored per detector') },
  'ob.baseRate': { value: '27.9%', label: 'base rate of omitted requirements', source: OBB(69, 'With a 27.9% base rate') },

  'ob.mcc.b3': { value: '0.371', label: 'MCC, B3 line-grep baseline (no AST)', source: OB(47, '**0.371** | [0.317, 0.421]') },
  'ob.ci.b3': { value: '[0.317, 0.421]', label: '95% CI, B3', source: OB(47, '[0.317, 0.421]') },
  'ob.mcc.b4': { value: '0.388', label: 'MCC, B4 reasoning LLM judge (gpt-oss-120b)', source: OB(48, '**0.388** | [0.345, 0.434]') },
  'ob.ci.b4': { value: '[0.345, 0.434]', label: '95% CI, B4', source: OB(48, '[0.345, 0.434]') },
  'ob.mcc.b5': { value: '0.701', label: 'MCC, B5 mid-tier LLM judge', source: OB(49, '**0.701** | **[0.650, 0.756]**') },
  'ob.ci.b5': { value: '[0.650, 0.756]', label: '95% CI, B5', source: OB(49, '[0.650, 0.756]') },
  'ob.mcc.p1': { value: '0.499', label: 'MCC, P1 deterministic detector', source: OB(50, '**0.499** | [0.449, 0.545]') },
  'ob.ci.p1': { value: '[0.449, 0.545]', label: '95% CI, P1', source: OB(50, '[0.449, 0.545]') },
  'ob.f1.flagAll': { value: '0.44', label: 'F1 of flag-everything (MCC 0.000)', source: OB(46, '| 0.28 | 1.00 | 0.44 | **0.000**') },
  'ob.precision.p1': { value: '0.80', label: 'precision, P1', source: OB(50, '| P1 defined | 0.80 |') },
  'ob.fpr.p1': { value: '0.043', label: 'false positive rate, P1', source: OB(50, '| 0.043 |') },
  'ob.fpr.b5': { value: '0.113', label: 'false positive rate, B5', source: OB(49, '| 0.113 |') },

  'ob.delta.b3': { value: '+0.128', label: 'paired ΔMCC, P1 − B3', source: OB(58, '| P1 − B3 | +0.128 | [+0.103, +0.156]') },
  'ob.delta.b4': { value: '+0.111', label: 'paired ΔMCC, P1 − B4', source: OB(59, '| P1 − B4 | +0.111 | [+0.055, +0.164]') },
  'ob.delta.b5': { value: '−0.202', label: 'paired ΔMCC, P1 − B5', source: OB(60, '**−0.202**') },
  'ob.deltaCi.b5': { value: '[−0.252, −0.150]', label: '95% CI of P1 − B5', source: OB(60, '**[−0.252, −0.150]**') },

  'ob.recall.absent.p1': { value: '0.96', label: 'P1 recall on ABSENT omissions', source: OB(104, '| **P1 defined** | **0.96** | 0.00 | 0.00 |') },
  'ob.unwired.n': { value: '19', label: 'UNWIRED instances (target ≈100)', source: OB(99, 'UNWIRED (n=19)') },

  'ob.extraction.cost': { value: '$0.0567', label: 'cost of LLM requirement extraction, all 310 instances', source: OB(194, 'Full cost: **$0.0567**') },
  'ob.extraction.mcc': { value: '−0.935', label: 'P1 MCC with LLM-extracted requirements (literal pipeline)', source: OB(224, '**−0.935**') },

  'ob.real.trajectories': { value: '8', label: 'real agent trajectories collected', source: OBB(146, 'I collected 8 real agent trajectories') },
  'ob.real.omitted': { value: '0 of 16', label: 'requirements omitted in real trajectories', source: OBB(148, '0 out of 16 requirements were OMITTED') },
  'ob.real.fpr': { value: '0.062', label: 'P1 false positive rate on real code (synthetic 0.043)', source: OBB(305, 'Real 0.062 vs synthetic 0.043') },

  'ob.gate.fired': { value: '8 seconds', label: 'time for the gate to comment on a live demo PR', source: OBB(267, 'The workflow fired in **8 seconds**') },
  'ob.gate.p95': { value: '26.5 ms', label: 'gate p95 latency per instance', source: OBB(269, 'p95 **26.5ms** per instance') },
  'ob.gate.precision': { value: '0.8018', label: 'P1 precision at the last gate check (bar 0.8)', source: OB(299, 'P1 precision 0.8018') },
  'ob.tests': { value: '132', label: 'tests passing', source: OBB(269, '132/132 tests passing') },

  'ob.mcc.flagAll': { value: '0.000', label: 'MCC of flag-everything', source: OB(46, '**0.000** | [0.000, 0.000] | 1.000') },
  'ob.recall.other.p1': { value: '0.00', label: 'P1 recall on UNWIRED and on STUB', source: OB(104, '| **0.96** | 0.00 | 0.00 |') },
  'ob.gate.bar': { value: '0.8', label: 'precision bar the gate must clear', source: OB(299, '(threshold 0.8)') },
  'ae.report.scenarios': { value: '30', label: 'seeded scenarios in the committed experiment report', source: AE('reports/phase_4_experiment_report.json', 4, '--end-seed 30') },

  // ── Implementation Integrity Analyzer (inside AegisOps AI) ────────────────
  'iia.scenarios': { value: '15', label: 'benchmark scenarios', source: AE('README.md', 69, '15 scenarios: 5 true-positive') },
  'iia.tp': { value: '5', label: 'true positives', source: AE('README.md', 78, '| True positives  | 0              | 5        |') },
  'iia.fp': { value: '4', label: 'false positives', source: AE('README.md', 79, '| False positives | 0              | 4        |') },
  'iia.fn': { value: '1', label: 'false negatives', source: AE('README.md', 80, '| False negatives | 6              | 1        |') },
  'iia.tn': { value: '5', label: 'true negatives', source: AE('README.md', 81, '| True negatives  | 9              | 5        |') },
  'iia.precision': { value: '0.556', label: 'analyzer precision', source: AE('README.md', 82, '0.556') },
  'iia.recall': { value: '0.833', label: 'analyzer recall', source: AE('README.md', 83, '0.833') },
  'iia.mcc': { value: '0.389', label: 'analyzer MCC', source: AE('README.md', 84, '0.389') },

  'ae.tests': {
    value: '121',
    label: 'AegisOps tests passing (pytest, run at this commit on 16 Sep 2026)',
    source: { kind: 'file', repo: 'aegisops-ai', sha: commits.aegisops, path: 'tests', tree: true },
  },
  'ae.model': { value: 'Llama 3.1 8B', label: 'LLM used by the decision engine', source: AE('aegisops/infrastructure/llm_decision_engine.py', 28, 'meta/llama-3.1-8b-instruct') },
  'ae.roles': { value: 'not running agents yet', label: 'status of the four agent roles', source: AE('backend/agents/roles.py', 3, 'They are data, not executable agents') },
  'ae.report.fallback': {
    value: 'blocked path every time',
    label: 'LLM engine behaviour in the committed 30-scenario report (no API key set)',
    source: AE('reports/phase_4_experiment_report.json', 5, 'exercised its blocked-fallback path for every scenario'),
  },

  // ── Cancer Fusion AI ─────────────────────────────────────────────────────
  'cf.valMacroF1': { value: '0.726', label: 'best validation macro-F1 (checkpoint selection set)', source: CF(170, 'Best validation macro-F1 | **0.726**') },
  'cf.split': { value: 'lesion_id', label: 'split key', source: CF(81, 'stratified split **by `lesion_id`**') },
  'cf.latency.explain': { value: '~100 ms', label: 'local /predict latency with Grad-CAM', source: CF(237, '**~100ms**') },
  'cf.latency.fast': { value: '~31 ms', label: 'local /predict latency with explain=false', source: CF(237, '**~31ms**') },

  'cf.test.n': { value: '1,543', label: 'held-out test images', source: CF_DERIVED('Row count of the committed test labels.', 'test') },
  'cf.test.macroF1': { value: '0.712', label: 'test macro-F1', source: CF_DERIVED('Argmax of committed test logits, per-class F1, unweighted mean over 7 classes.', 'test') },
  'cf.test.melRecall': { value: '0.705', label: 'test melanoma recall', source: CF_DERIVED('Class "mel" (index 4): TP / (TP + FN) on test logits.', 'test') },
  'cf.test.melPrecision': { value: '0.464', label: 'test melanoma precision', source: CF_DERIVED('Class "mel" (index 4): TP / (TP + FP) on test logits.', 'test') },
  'cf.test.melFp': { value: '143', label: 'test images wrongly flagged as melanoma', source: CF_DERIVED('Count of predicted mel where label ≠ mel.', 'test') },
  'cf.test.melFpNv': { value: '113', label: 'of those, benign nevi', source: CF_DERIVED('Count of predicted mel where label = nv.', 'test') },
  'cf.val.n': { value: '1,493', label: 'validation images', source: CF_DERIVED('Row count of the committed validation labels.', 'val') },
  'cf.val.macroF1Recomputed': { value: '0.7262', label: 'validation macro-F1 recomputed from logits (matches the checkpoint’s stored 0.72619)', source: CF_DERIVED('Same computation on validation logits; agreement with the checkpoint field confirms the logits came from the shipped model.', 'val') },
  'cf.val.melRecall': { value: '0.672', label: 'validation melanoma recall', source: CF_DERIVED('Class "mel": TP / (TP + FN) on validation logits.', 'val') },
  'cf.val.melPrecision': { value: '0.390', label: 'validation melanoma precision', source: CF_DERIVED('Class "mel": TP / (TP + FP) on validation logits.', 'val') },
} satisfies Record<string, Claim>;

export type ClaimId = keyof typeof claims;

export const evidence = {
  cfCollapseFix: { repo: 'cancer-fusion-ai', sha: '75de80906a9b100bcdc1bb82a63061df2c17f13e' },
  cfSilentLoad: { repo: 'cancer-fusion-ai', sha: '12d0b1efee29f214bf3ec9039136e4ee91ba8444' },
  cfTemperature: { repo: 'cancer-fusion-ai', sha: '06ac6394588a339e2a4e936ea8e614c1c6fb0827' },
} as const;

export function commitUrl(repo: string, sha: string): string {
  return `https://github.com/${OWNER}/${repo}/commit/${sha}`;
}

export function sourceUrl(s: Source): string {
  const base = `https://github.com/${OWNER}/${s.repo}`;
  switch (s.kind) {
    case 'line':
      return `${base}/blob/${s.sha}/${s.path}#L${s.line}`;
    case 'file':
      return `${base}/${s.tree ? 'tree' : 'blob'}/${s.sha}/${s.path}`;
    case 'commit':
      return commitUrl(s.repo, s.sha);
    case 'derived':
      return `${base}/tree/${s.sha}/${s.inputs[0].split('/').slice(0, -1).join('/')}`;
  }
}

export function sourceLabel(s: Source): string {
  const short = s.sha.slice(0, 7);
  switch (s.kind) {
    case 'line':
      return `${s.repo}/${s.path}, line ${s.line}, commit ${short}`;
    case 'file':
      return `${s.repo}/${s.path}, commit ${short}`;
    case 'commit':
      return `${s.repo}, commit ${short}`;
    case 'derived':
      return `recomputed from ${s.repo}/${s.inputs[0].split('/').slice(0, -1).join('/')}, commit ${short}`;
  }
}

export function claim(id: ClaimId): Claim {
  return claims[id];
}
