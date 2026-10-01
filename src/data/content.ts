export const papers = {
  iia: {
    title: 'Detecting Silent Implementation Integrity Failures in AI-Generated Code: A Static Analysis Approach',
    authors: 'Avnish Singh',
    venue: 'Preprint, 2026. Submitted to arXiv (cs.SE), awaiting announcement.',
    pdf: 'https://avnish1505.github.io/iia-preprint/IIA_preprint.pdf',
    page: 'https://avnish1505.github.io/iia-preprint/',
    code: 'https://github.com/Avnish1505/aegisops-ai/tree/main/aegisops/integrity_analyzer',
  },
  law: {
    title: 'Emergence of Artificial Intelligence in Law and Legal Technology',
    authors: 'Arya Pratap Singh, Avnish Singh',
    venue: 'ADG 2026 International Conference.',
    pdf: '/research-paper.pdf',
  },
} as const;

export const posts = [
  {
    key: 'cancerFusion',
    title: 'The model that failed away from home',
    date: 'October 2026',
    href: 'https://avnish1505.github.io/Cancer-Fusion-AI-blog/',
    summary: 'Why my skin-lesion classifier lost seven points on the ISIC 2018 test set, the fix that only moved the errors, and the rebuild that took external balanced accuracy from 0.653 to 0.782.',
  },
  {
    key: 'omitbench',
    title: 'The detector that lost: building OmitBench',
    date: 'August 2026',
    href: 'https://avnish1505.github.io/omitbench-engineering-blog/',
    summary: "A benchmark for silent omissions in AI-agent code patches, and the measurements that didn't flatter it.",
  },
  {
    key: 'aegisops',
    title: 'Building AegisOps AI: engineering a human-supervised crisis decision-support platform',
    date: 'August 2026, updated September 2026',
    href: 'https://avnish1505.github.io/aegisops-ai-blog/',
    summary: 'Ports and adapters, LLM output validated against the real scenario, and a deterministic safety layer that has the final say before a human does.',
  },
] as const;

export type PostKey = (typeof posts)[number]['key'];
export const post = (key: PostKey) => posts.find((p) => p.key === key)!;

export const earlier = [
  {
    title: 'Startup Success Predictor',
    href: 'https://github.com/Avnish1505/startup-success-predictor',
    summary: 'A trained classifier plus generative AI that estimates startup success probability and suggests strategy.',
  },
  {
    title: 'NeuralForge',
    href: 'https://github.com/Avnish1505/neural-forge',
    summary: 'A node-based visual editor for building AI image-generation workflows.',
  },
] as const;
