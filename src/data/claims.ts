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
  // Later commits, pinned when the site was updated on 29 Sep 2026.
  omitbenchB7: '03cddf997584a246b5c68a757f69ad703001a0be',
  aegisopsSolver: '5e81f3a7440495df397cd81ece468a9f92cf821a',
  cancerFusionCal: 'e97ee49862249cad6e13d9157d79cf862970db1f',
  agentgrade: '03ea9101e42ae8be3d0632258c366a403d80ee77',
  // Pinned on 1 Oct 2026: Cancer Fusion v2 results merged.
  cancerFusionV2: '28ab3a931b67a927352a47e9fc21cf0f9a39dc0d',
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
const OB7 = (n: number, match: string) => line('Omitbench', commits.omitbenchB7, 'README.md', n, match);
const AES = (path: string, n: number, match: string) => line('aegisops-ai', commits.aegisopsSolver, path, n, match);
const CFC = (n: number, match: string) => line('cancer-fusion-ai', commits.cancerFusionCal, 'README.md', n, match);
const CF2 = (n: number, match: string) => line('cancer-fusion-ai', commits.cancerFusionV2, 'README.md', n, match);
const AG = (n: number, match: string) => line('agentgrade', commits.agentgrade, 'README.md', n, match);

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
  'ob.tests': { value: '155', label: 'tests in make test: 147 unit tests and 8 leakage guards', source: OB7(412, '155 tests (147 unit + 8 leakage guards)') },

  'ob.b7.delta': { value: '−0.259', label: 'paired ΔMCC, B7 (Jev, split questions) − B5', source: OB7(346, '-0.259 [-0.316,-0.203]') },
  'ob.b7.deltaCi': { value: '[−0.316, −0.203]', label: '95% CI of B7 − B5', source: OB7(346, '-0.259 [-0.316,-0.203]') },
  'ob.b7.auroc': { value: '0.936', label: 'AUROC, B7 (Jev, split questions)', source: OB7(362, '| 0.323 | 0.936 |') },
  'ob.b7.ece': { value: '0.323', label: 'expected calibration error, B7 (Jev, split questions)', source: OB7(362, '| 0.323 | 0.936 |') },
  'ob.b7.eceBar': { value: '0.05', label: 'pre-registered ECE bar for "calibrated"', source: OB7(356, 'ECE<=0.05 False') },
  'ob.recall.absent.b5': { value: '0.84', label: 'B5 recall on ABSENT omissions', source: OB7(395, '| B5 LLM judge (mid-tier) | 0.84 | 0.21 | 0.87 |') },
  'ob.recall.unwired.b5': { value: '0.21', label: 'B5 recall on UNWIRED omissions (n=19)', source: OB7(395, '| B5 LLM judge (mid-tier) | 0.84 | 0.21 | 0.87 |') },
  'ob.recall.stub.b5': { value: '0.87', label: 'B5 recall on STUB omissions', source: OB7(395, '| B5 LLM judge (mid-tier) | 0.84 | 0.21 | 0.87 |') },

  'ob.mcc.flagAll': { value: '0.000', label: 'MCC of flag-everything', source: OB(46, '**0.000** | [0.000, 0.000] | 1.000') },
  'ob.recall.other.p1': { value: '0.00', label: 'P1 recall on UNWIRED and on STUB', source: OB(104, '| **0.96** | 0.00 | 0.00 |') },
  'ob.gate.bar': { value: '0.8', label: 'precision bar the gate must clear', source: OB(299, '(threshold 0.8)') },

  // ── Implementation Integrity Analyzer (inside AegisOps AI) ────────────────
  'iia.scenarios': { value: '15', label: 'benchmark scenarios', source: AE('README.md', 69, '15 scenarios: 5 true-positive') },
  'iia.tp': { value: '5', label: 'true positives', source: AE('README.md', 78, '| True positives  | 0              | 5        |') },
  'iia.fp': { value: '4', label: 'false positives', source: AE('README.md', 79, '| False positives | 0              | 4        |') },
  'iia.fn': { value: '1', label: 'false negatives', source: AE('README.md', 80, '| False negatives | 6              | 1        |') },
  'iia.tn': { value: '5', label: 'true negatives', source: AE('README.md', 81, '| True negatives  | 9              | 5        |') },
  'iia.precision': { value: '0.556', label: 'analyzer precision', source: AE('README.md', 82, '0.556') },
  'iia.recall': { value: '0.833', label: 'analyzer recall', source: AE('README.md', 83, '0.833') },
  'iia.mcc': { value: '0.389', label: 'analyzer MCC', source: AE('README.md', 84, '0.389') },
  'iia.base.tp': { value: '0', label: 'true positives, string-presence baseline', source: AE('README.md', 78, '| True positives  | 0              | 5        |') },
  'iia.base.fp': { value: '0', label: 'false positives, string-presence baseline', source: AE('README.md', 79, '| False positives | 0              | 4        |') },
  'iia.base.fn': { value: '6', label: 'false negatives, string-presence baseline', source: AE('README.md', 80, '| False negatives | 6              | 1        |') },
  'iia.base.tn': { value: '9', label: 'true negatives, string-presence baseline', source: AE('README.md', 81, '| True negatives  | 9              | 5        |') },

  'ae.tests': {
    value: '121',
    label: 'AegisOps tests passing (pytest, run at this commit on 16 Sep 2026)',
    source: { kind: 'file', repo: 'aegisops-ai', sha: commits.aegisops, path: 'tests', tree: true },
  },

  // ── AegisOps, after the solver rework ────────────────────────────────────
  'ae.fi.classes': { value: '13/13', label: 'fault classes caught on every scenario', source: AES('reports/fault_injection.md', 7, '**13/13**') },
  'ae.fi.faults': { value: '650/650', label: 'injected faults caught by the verifier', source: AES('reports/fault_injection.md', 8, '**650/650**') },
  'ae.fi.falseBlocks': { value: '0/50', label: 'clean solver plans falsely blocked', source: AES('reports/fault_injection.md', 9, '**0/50**') },
  'ae.verifier.checks': { value: '19', label: 'deterministic checks every plan goes through', source: AES('docs/STATUS.md', 13, 'goes through 19 deterministic checks') },
  'ae.tests.now': {
    value: '1,173',
    label: 'AegisOps tests passing, 3 skipped (pytest, run at this commit on 1 Oct 2026)',
    source: { kind: 'file', repo: 'aegisops-ai', sha: commits.aegisopsSolver, path: 'tests', tree: true },
  },
  'ae.unmetPenalty': { value: '10_000', label: 'penalty in minutes per unit of unmet demand', source: AES('aegisops/planning/objective.py', 20, 'UNMET_PENALTY_MINUTES = 10_000.0') },

  // ── AgentGrade ───────────────────────────────────────────────────────────
  'ag.sessions': { value: '93', label: 'test sessions run against the agent (23 in Phase 3, 70 in Phase 5)', source: AG(40, 'across 93 total test sessions') },
  'ag.gateCalls': { value: 'zero times', label: 'times the deterministic return-window check ran', source: AG(41, 'was invoked zero times') },
  'ag.p95': { value: '6349.2 ms', label: 'p95 round trip per case, session open to close', source: AG(37, '6349.2 ms (p50: 4900.3 ms)') },

  // ── Cancer Fusion AI ─────────────────────────────────────────────────────
  'cf.valMacroF1': { value: '0.726', label: 'best validation macro-F1 (checkpoint selection set)', source: CF(170, 'Best validation macro-F1 | **0.726**') },
  'cf.split': { value: 'lesion_id', label: 'split key', source: CF(81, 'stratified split **by `lesion_id`**') },
  'cf.latency.explain': { value: '~100 ms', label: 'local /predict latency with Grad-CAM', source: CF(237, '**~100ms**') },
  'cf.latency.fast': { value: '~31 ms', label: 'local /predict latency with explain=false', source: CF(237, '**~31ms**') },
  'cf.temperature': { value: '2.1235', label: 'temperature fitted on the validation set by NLL minimisation', source: CFC(240, 'T=2.1235 (fitted on validation via NLL minimization, current)') },
  'cf.ece.before': { value: '0.1217', label: 'test ECE before temperature scaling (T = 1)', source: CFC(238, '| T=1.0 (uncalibrated) | 0.1217') },
  // v2 and the external test set (ISIC 2018 Task 3), from the README at the v2 commit
  'cf2.v1.homeBA': { value: '0.722', label: 'v1 balanced accuracy on its own test split (n=1,543)', source: CF2(244, '| 0.7221 [0.682, 0.764] |') },
  'cf2.v1.awayBA': { value: '0.653', label: 'v1 balanced accuracy on the ISIC 2018 test set (n=1,511)', source: CF2(244, '| 0.6531 [0.609, 0.695] |') },
  'cf2.best2018': { value: '0.885', label: 'balanced accuracy of the best ISIC 2018 Task 3 submission', source: CF2(250, 'reached 0.885 balanced accuracy') },
  'cf2.offsets.median': { value: '+0.013', label: 'median ISIC 2018 gain from per-class decision offsets, over 20 refits', source: CF2(252, 'median gain of only +0.013') },
  'cf2.offsets.first': { value: '0.704', label: 'ISIC 2018 balanced accuracy after one fit of the offsets', source: CF2(252, 'from 0.653 to 0.704 on one fit') },
  'cf2.v2.awayBA': { value: '0.782', label: 'v2 fusion balanced accuracy on ISIC 2018', source: CF2(291, '| 0.782 (+0.129 [+0.088, +0.171]) |') },
  'cf2.v2.delta': { value: '+0.129', label: 'paired change in ISIC 2018 balanced accuracy, v2 − v1', source: CF2(291, '| 0.782 (+0.129 [+0.088, +0.171]) |') },
  'cf2.v2.deltaCi': { value: '[+0.088, +0.171]', label: '95% paired bootstrap CI of v2 − v1', source: CF2(291, '(+0.129 [+0.088, +0.171])') },
  'cf2.imgOnly.awayBA': { value: '0.750', label: 'v2 image-only ablation, ISIC 2018 balanced accuracy', source: CF2(291, '| 0.750 (+0.097 [+0.057, +0.138]) |') },
  'cf2.v2.homeBA': { value: '0.762', label: 'v2 fusion balanced accuracy on the internal test split', source: CF2(296, '| 0.762 (+0.040 [+0.006, +0.075]) |') },
  'cf2.v1.melAUC': { value: '0.898', label: 'v1 melanoma AUC on ISIC 2018 (plain softmax)', source: CF2(293, '| ISIC 2018 melanoma AUC | 0.898 |') },
  'cf2.v2.melAUC': { value: '0.939', label: 'v2 melanoma AUC on ISIC 2018', source: CF2(293, '| 0.939 (+0.041 [+0.017, +0.066]) |') },
  'cf2.v1.malAUC': { value: '0.898', label: 'v1 malignant-vs-benign AUC on ISIC 2018 (plain softmax)', source: CF2(294, '| ISIC 2018 malignant AUC | 0.898 |') },
  'cf2.v2.malAUC': { value: '0.954', label: 'v2 malignant-vs-benign AUC on ISIC 2018', source: CF2(294, '| 0.954 (+0.055 [+0.037, +0.074]) |') },
  'cf2.melRecall.deltaCi': { value: '[−0.012, +0.141]', label: '95% CI of the v2 − v1 change in ISIC 2018 melanoma recall', source: CF2(295, '(+0.064 [−0.012, +0.141])') },
  'cf2.fusion.vsImg': { value: '+0.033', label: 'paired ISIC 2018 balanced-accuracy gain, fusion over image-only', source: CF2(308, '+0.033 [+0.003, +0.061] balanced accuracy') },
  'cf2.fusion.vsImgCi': { value: '[+0.003, +0.061]', label: '95% CI of fusion − image-only', source: CF2(308, '+0.033 [+0.003, +0.061] balanced accuracy') },
  'cf2.fusion.noForm': { value: '0.774', label: 'fusion model on ISIC 2018 with all metadata withheld', source: CF2(308, 'still scores 0.774') },
  'cf2.fusion.form': { value: '+0.008', label: 'what the form adds at inference, ISIC 2018 balanced accuracy', source: CF2(308, 'adds +0.008 [−0.003, +0.019] balanced accuracy') },
  'cf2.fusion.formCi': { value: '[−0.003, +0.019]', label: '95% CI of what the form adds at inference', source: CF2(308, 'adds +0.008 [−0.003, +0.019] balanced accuracy') },
  'cf2.v1.spec': { value: '0.578', label: 'v1 malignant-flag specificity on ISIC 2018', source: CF2(315, '| 0.578 [0.550, 0.606] |') },
  'cf2.v2.spec': { value: '0.793', label: 'v2 malignant-flag specificity on ISIC 2018', source: CF2(315, '| 0.793 [0.770, 0.815] |') },
  'cf2.v1.sens': { value: '0.961', label: 'v1 malignant-flag sensitivity on ISIC 2018 (set for 0.95 on validation)', source: CF2(314, '| 0.961 [0.939, 0.981] |') },
  'cf2.v2.sens': { value: '0.941', label: 'v2 malignant-flag sensitivity on ISIC 2018 (set for 0.95 on validation)', source: CF2(314, '| 0.941 [0.915, 0.966] |') },
  'cf2.v1.fpPerTp': { value: '1.72', label: 'benign lesions flagged per malignant lesion caught, v1', source: CF2(316, '| 1.72 | 0.86 |') },
  'cf2.v2.fpPerTp': { value: '0.86', label: 'benign lesions flagged per malignant lesion caught, v2', source: CF2(316, '| 1.72 | 0.86 |') },
  'cf2.v2.coverage': { value: '0.915', label: 'v2 conformal coverage on ISIC 2018 at a 0.90 target', source: CF2(317, '| 0.915 / 1.64 |') },
  'cf2.v2.setSize': { value: '1.64', label: 'v2 mean conformal set size on ISIC 2018', source: CF2(317, '| 0.915 / 1.64 |') },
  'cf2.v1.setSize': { value: '1.86', label: 'v1 mean conformal set size on ISIC 2018', source: CF2(317, '| 0.905 / 1.86 |') },
  'cf2.v2.ece': { value: '0.029', label: 'v2 expected calibration error on ISIC 2018', source: CF2(318, '| ECE | 0.042 | 0.029 |') },
  'cf2.v1.homeMelAUC': { value: '0.912', label: 'v1 melanoma AUC on the internal test split (plain softmax)', source: CF2(297, '| Internal test melanoma AUC | 0.912 |') },
  'cf2.v2.homeMelAUC': { value: '0.958', label: 'v2 melanoma AUC on the internal test split', source: CF2(297, '| 0.958 (+0.047 [+0.029, +0.063]) |') },
  'cf.ece.after': { value: '0.0297', label: 'test ECE at the fitted temperature', source: CFC(240, 'current)** | 0.0297') },

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
